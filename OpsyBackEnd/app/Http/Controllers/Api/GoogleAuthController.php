<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function startLink(Request $request)
    {
        $clientId = config('services.google.client_id');
        $redirect = config('services.google.redirect');

        if (! $clientId || ! $redirect) {
            return response()->json([
                'message' => 'Google OAuth non configuré. Définissez GOOGLE_CLIENT_ID et GOOGLE_REDIRECT_URI.',
            ], 500);
        }

        $state = Str::random(64);
        Cache::put("google_oauth_state:$state", [
            'user_id' => $request->user()->id,
        ], now()->addMinutes(10));

        $params = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirect,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        return response()->json([
            'authorize_url' => 'https://accounts.google.com/o/oauth2/v2/auth?'.$params,
        ]);
    }

    public function callback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');

        $payload = $state ? Cache::pull("google_oauth_state:$state") : null;
        $frontendRedirect = rtrim((string) config('services.google.frontend_redirect'), '/');

        if (! $code || ! $payload || empty($payload['user_id'])) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=invalid_state');
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirect = config('services.google.redirect');

        if (! $clientId || ! $clientSecret || ! $redirect) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=missing_config');
        }

        $tokenRes = Http::asForm()
            ->timeout(30)
            ->post('https://oauth2.googleapis.com/token', [
                'code' => $code,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirect,
                'grant_type' => 'authorization_code',
            ]);

        if (! $tokenRes->ok() || ! $tokenRes->json('access_token')) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=token_exchange_failed');
        }

        $accessToken = $tokenRes->json('access_token');
        $refreshToken = $tokenRes->json('refresh_token');

        $infoRes = Http::withToken($accessToken)
            ->timeout(15)
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if (! $infoRes->ok()) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=userinfo_failed');
        }

        $googleId = (string) ($infoRes->json('sub') ?? '');
        $googleEmail = (string) ($infoRes->json('email') ?? '');

        if ($googleId === '' || $googleEmail === '') {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=missing_profile');
        }

        $user = User::find($payload['user_id']);
        if (! $user) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=user_not_found');
        }

        $other = User::where('google_id', $googleId)->where('id', '!=', $user->id)->first();
        if ($other) {
            return redirect()->to($frontendRedirect.'?google_connected=0&reason=google_already_linked');
        }

        $payloadUpdate = [
            'google_id' => $googleId,
            'google_email' => $googleEmail,
            'google_connected_at' => now(),
        ];
        if (! empty($refreshToken)) {
            $payloadUpdate['google_refresh_token'] = $refreshToken;
        }
        $user->update($payloadUpdate);

        return redirect()->to($frontendRedirect.'?google_connected=1');
    }

    public function disconnect(Request $request)
    {
        $user = $request->user();
        $user->update([
            'google_id' => null,
            'google_email' => null,
            'google_refresh_token' => null,
            'google_connected_at' => null,
        ]);

        return response()->json(['message' => 'Gmail déconnecté.']);
    }
}
