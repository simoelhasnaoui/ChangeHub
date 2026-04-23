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
            'scope' => 'repo read:user',
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
        $user = $request->user();

        if (empty($user->github_token)) {
            return response()->json(['message' => 'GitHub not connected.'], 409);
        }

        $res = Http::withToken($user->github_token)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
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

        $repos = collect($res->json() ?? [])->map(function ($r) {
            return [
                'id' => $r['id'] ?? null,
                'name' => $r['name'] ?? null,
                'full_name' => $r['full_name'] ?? null,
                'private' => (bool)($r['private'] ?? false),
                'html_url' => $r['html_url'] ?? null,
                'default_branch' => $r['default_branch'] ?? null,
                'updated_at' => $r['updated_at'] ?? null,
                'language' => $r['language'] ?? null,
                'archived' => (bool)($r['archived'] ?? false),
                'disabled' => (bool)($r['disabled'] ?? false),
                'owner' => [
                    'login' => $r['owner']['login'] ?? null,
                    'avatar_url' => $r['owner']['avatar_url'] ?? null,
                ],
            ];
        })->values();

        return response()->json(['repos' => $repos]);
    }
}

