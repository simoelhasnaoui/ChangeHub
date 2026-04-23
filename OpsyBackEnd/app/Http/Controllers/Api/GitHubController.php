<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GitHubController extends Controller
{
    private function gh(Request $request)
    {
        $user = $request->user();
        if (empty($user->github_token)) {
            abort(409, 'GitHub not connected.');
        }

        return Http::withToken($user->github_token)->withHeaders([
            'Accept' => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ]);
    }

    private function ensureImplementer(Request $request): void
    {
        if (!$request->user()?->isImplementer()) {
            abort(403, 'Forbidden');
        }
    }

    public function status(Request $request)
    {
        $this->ensureImplementer($request);

        $user = $request->user();
        $connected = !empty($user->github_token) && !empty($user->github_login);

        return response()->json([
            'connected' => $connected,
            'login' => $user->github_login,
            'connected_at' => $user->github_connected_at,
        ]);
    }

    public function startLink(Request $request)
    {
        $this->ensureImplementer($request);

        $clientId = config('services.github.client_id');
        $redirect = config('services.github.redirect');

        if (!$clientId || !$redirect) {
            return response()->json([
                'message' => 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_REDIRECT_URI.',
            ], 500);
        }

        $state = Str::random(64);
        Cache::put("github_oauth_state:$state", [
            'user_id' => $request->user()->id,
        ], now()->addMinutes(10));

        $params = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirect,
            'scope' => 'repo read:user workflow',
            'state' => $state,
            'allow_signup' => 'true',
        ]);

        return response()->json([
            'authorize_url' => "https://github.com/login/oauth/authorize?$params",
        ]);
    }

    // Public callback; we identify the user via state stored in cache from startLink().
    public function callback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');

        $payload = $state ? Cache::pull("github_oauth_state:$state") : null;
        $frontendRedirect = config('services.github.frontend_redirect');

        if (!$code || !$payload || empty($payload['user_id'])) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=invalid_state');
        }

        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');
        $redirect = config('services.github.redirect');

        if (!$clientId || !$clientSecret || !$redirect) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=missing_config');
        }

        $tokenRes = Http::asForm()
            ->withHeaders(['Accept' => 'application/json'])
            ->post('https://github.com/login/oauth/access_token', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'code' => $code,
                'redirect_uri' => $redirect,
            ]);

        if (!$tokenRes->ok() || !$tokenRes->json('access_token')) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=token_exchange_failed');
        }

        $accessToken = $tokenRes->json('access_token');

        $meRes = Http::withToken($accessToken)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get('https://api.github.com/user');

        if (!$meRes->ok()) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=github_user_failed');
        }

        $githubId = (string)($meRes->json('id') ?? '');
        $githubLogin = (string)($meRes->json('login') ?? '');

        $user = User::find($payload['user_id']);
        if (!$user) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=user_not_found');
        }

        // Safety: only allow implementers to link.
        if (!$user->isImplementer()) {
            return redirect()->to($frontendRedirect . '?connected=0&reason=forbidden');
        }

        $user->update([
            'github_id' => $githubId ?: null,
            'github_login' => $githubLogin ?: null,
            'github_token' => $accessToken,
            'github_connected_at' => now(),
        ]);

        return redirect()->to($frontendRedirect . '?connected=1');
    }

    public function disconnect(Request $request)
    {
        $this->ensureImplementer($request);
        $user = $request->user();

        $user->update([
            'github_id' => null,
            'github_login' => null,
            'github_token' => null,
            'github_connected_at' => null,
        ]);

        return response()->json(['message' => 'GitHub disconnected.']);
    }

    public function repos(Request $request)
    {
        $this->ensureImplementer($request);

        $queryPage = $request->query('page');
        if ($queryPage === null || $queryPage === '') {
            return $this->reposLegacyList($request);
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
        $page = max(1, (int) $queryPage);

        $res = $this->gh($request)
            ->get('https://api.github.com/user/repos', [
                'per_page' => $perPage,
                'page' => $page,
                'sort' => 'updated',
                'direction' => 'desc',
                'affiliation' => 'owner,collaborator,organization_member',
            ]);

        if (!$res->ok()) {
            return response()->json([
                'message' => 'Failed to fetch repositories from GitHub.',
                'github_status' => $res->status(),
            ], 502);
        }

        $repos = $this->normalizeGithubRepoList($res->json() ?? []);
        $lastPage = $this->githubUserReposLastPage($res, $page, $repos->count(), $perPage);

        return response()->json([
            'repos' => $repos,
            'meta' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Unpaginated list (up to 100) for task/repo pickers that need a broad set of names.
     */
    private function reposLegacyList(Request $request)
    {
        $res = $this->gh($request)
            ->get('https://api.github.com/user/repos', [
                'per_page' => 100,
                'sort' => 'updated',
                'direction' => 'desc',
                'affiliation' => 'owner,collaborator,organization_member',
            ]);

        if (!$res->ok()) {
            return response()->json([
                'message' => 'Failed to fetch repositories from GitHub.',
                'github_status' => $res->status(),
            ], 502);
        }

        $repos = $this->normalizeGithubRepoList($res->json() ?? []);

        return response()->json(['repos' => $repos]);
    }

    private function normalizeGithubRepoList(array $json): \Illuminate\Support\Collection
    {
        return collect($json)->map(function ($r) {
            return [
                'id' => $r['id'] ?? null,
                'name' => $r['name'] ?? null,
                'full_name' => $r['full_name'] ?? null,
                'private' => (bool) ($r['private'] ?? false),
                'html_url' => $r['html_url'] ?? null,
                'default_branch' => $r['default_branch'] ?? null,
                'updated_at' => $r['updated_at'] ?? null,
                'language' => $r['language'] ?? null,
                'archived' => (bool) ($r['archived'] ?? false),
                'disabled' => (bool) ($r['disabled'] ?? false),
                'owner' => [
                    'login' => $r['owner']['login'] ?? null,
                    'avatar_url' => $r['owner']['avatar_url'] ?? null,
                ],
            ];
        })->values();
    }

    private function githubUserReposLastPage(\Illuminate\Http\Client\Response $response, int $page, int $itemCount, int $perPage): int
    {
        if ($itemCount === 0) {
            return max(1, $page - 1);
        }

        $link = $response->header('Link');
        if (is_array($link)) {
            $link = implode(', ', $link);
        }
        if (is_string($link) && preg_match_all('/<([^>]+)>;\s*rel="([^"]+)"/', $link, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                if (($m[2] ?? '') === 'last' && preg_match('/[?&]page=(\d+)/', $m[1], $p)) {
                    return max(1, (int) $p[1]);
                }
            }
        }

        if ($itemCount < $perPage) {
            return $page;
        }

        return $page + 1;
    }

    public function repoInsights(Request $request)
    {
        $this->ensureImplementer($request);

        $request->validate([
            'repos' => 'required|array|min:1|max:25',
            'repos.*' => 'required|string', // "owner/name"
        ]);

        $gh = $this->gh($request);

        $out = [];
        foreach ($request->input('repos') as $fullName) {
            $fullName = trim($fullName);
            if (!str_contains($fullName, '/')) continue;
            [$owner, $repo] = explode('/', $fullName, 2);

            // Repo meta (default branch)
            $repoRes = $gh->get("https://api.github.com/repos/$owner/$repo");
            if (!$repoRes->ok()) {
                $out[] = [
                    'full_name' => $fullName,
                    'error' => 'repo_fetch_failed',
                    'github_status' => $repoRes->status(),
                ];
                continue;
            }
            $defaultBranch = $repoRes->json('default_branch') ?: 'main';

            // Latest commit on default branch
            $commitRes = $gh->get("https://api.github.com/repos/$owner/$repo/commits/$defaultBranch");
            $commit = $commitRes->ok() ? [
                'sha' => $commitRes->json('sha'),
                'html_url' => $commitRes->json('html_url'),
                'message' => $commitRes->json('commit.message'),
                'author' => $commitRes->json('commit.author.name'),
                'date' => $commitRes->json('commit.author.date'),
            ] : null;

            // Latest workflow run (Actions)
            $runsRes = $gh->get("https://api.github.com/repos/$owner/$repo/actions/runs", [
                'per_page' => 1,
            ]);
            $run = null;
            if ($runsRes->ok()) {
                $r0 = ($runsRes->json('workflow_runs') ?? [])[0] ?? null;
                if ($r0) {
                    $durationSeconds = null;
                    if (!empty($r0['run_started_at']) && !empty($r0['updated_at'])) {
                        try {
                            $durationSeconds = now()->parse($r0['updated_at'])->diffInSeconds(now()->parse($r0['run_started_at']));
                        } catch (\Throwable $e) {
                            $durationSeconds = null;
                        }
                    }
                    $run = [
                        'id' => $r0['id'] ?? null,
                        'name' => $r0['name'] ?? null,
                        'status' => $r0['status'] ?? null, // queued|in_progress|completed
                        'conclusion' => $r0['conclusion'] ?? null, // success|failure|cancelled|...
                        'html_url' => $r0['html_url'] ?? null,
                        'run_started_at' => $r0['run_started_at'] ?? null,
                        'updated_at' => $r0['updated_at'] ?? null,
                        'duration_seconds' => $durationSeconds,
                    ];
                }
            }

            $out[] = [
                'full_name' => $fullName,
                'html_url' => $repoRes->json('html_url'),
                'private' => (bool)$repoRes->json('private'),
                'archived' => (bool)$repoRes->json('archived'),
                'disabled' => (bool)$repoRes->json('disabled'),
                'default_branch' => $defaultBranch,
                'pushed_at' => $repoRes->json('pushed_at'),
                'commit' => $commit,
                'pipeline' => $run,
            ];
        }

        return response()->json(['repos' => $out]);
    }
}

