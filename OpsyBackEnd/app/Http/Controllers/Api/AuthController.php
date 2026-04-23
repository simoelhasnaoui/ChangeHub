<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use App\Support\OutboundMail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {

    /** User JSON + flag so the UI can warn when SMTP is not configured. */
    private function userWithMailMeta(User $user): array
    {
        return array_merge($user->toArray(), [
            'outbound_email_ready' => OutboundMail::isReady(),
        ]);
    }

    public function login(Request $request) {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        // Revoke previous tokens for this device (optional, keeps it clean)
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userWithMailMeta($user->fresh()),
        ]);
    }

    /** Demande de lien de réinitialisation (e-mail avec jeton). */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $generic = 'Si un compte existe pour cette adresse, un lien de réinitialisation vient d’y être envoyé.';

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => $generic]);
        }

        $plain = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => hash('sha256', $plain), 'created_at' => now()]
        );

        $base = rtrim((string) config('services.frontend_url', ''), '/');
        $resetUrl = $base.'/reset-password?'.http_build_query([
            'token' => $plain,
            'email' => $user->email,
        ]);

        try {
            Mail::to($user->email)->send(new ResetPasswordMail($user->name, $resetUrl, 60));
        } catch (\Throwable $e) {
            Log::warning('ResetPasswordMail: '.$e->getMessage());
        }

        return response()->json(['message' => $generic]);
    }

    /** Définit un nouveau mot de passe à partir du lien reçu par e-mail. */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => ['required', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'confirmed'],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule et un chiffre.',
        ]);

        $row = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        if (! $row || ! hash_equals($row->token, hash('sha256', $request->token))) {
            throw ValidationException::withMessages([
                'email' => ['Ce lien est invalide ou a déjà été utilisé.'],
            ]);
        }

        if (Carbon::parse($row->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'email' => ['Ce lien a expiré. Demandez un nouveau lien.'],
            ]);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'email' => ['Compte introuvable.'],
            ]);
        }

        $user->password = $request->password;
        $user->force_password_change = false;
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Vous pouvez vous connecter.']);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function changePassword(Request $request) {
        $request->validate([
            'current_password' => 'required',
            'new_password'     => ['required', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'confirmed']
        ], [
            'new_password.regex' => 'Le mot de passe doit contenir au moins une majuscule et un chiffre.'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe actuel incorrect.']
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'force_password_change' => false
        ]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

    public function me(Request $request) {
        return response()->json($this->userWithMailMeta($request->user()->fresh()));
    }
}