<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {

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
            'user'  => $user->fresh()->toArray(),
        ]);
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
        return response()->json($request->user());
    }
}