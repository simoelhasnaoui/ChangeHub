<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
class UserController extends Controller {

    public function index(Request $request) {
        abort_if(! $request->user()->isAdmin(), 403);
        return response()->json(User::all());
    }

    public function implementers() {
        // Used when creating a change request — pick an implementer
        return response()->json(User::where('role', 'implementer')->get());
    }

    public function store(Request $request) {
        abort_if(! $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users',
            'role'        => 'required|in:admin,approver,implementer,requester',
            'department'  => 'nullable|string|max:255',
            'job_title'   => 'nullable|string|max:255',
            'phone'       => 'nullable|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $generatedPassword = \Illuminate\Support\Str::password(12, true, true, true, false);
        // User model uses 'password' => 'hashed' cast — assign plain text only (do not Hash::make here)
        $data['password'] = $generatedPassword;
        $data['force_password_change'] = true;

        $user = User::create($data);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeUserMail($user, $generatedPassword));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('WelcomeUserMail failed: '.$e->getMessage());
        }

        return response()->json([
            'user' => $user,
            'generated_password' => $generatedPassword,
        ], 201);
    }

    public function update(Request $request, User $user) {
        abort_if(! $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:users,email,' . $user->id,
            'role'        => 'sometimes|in:admin,approver,implementer,requester',
            'department'  => 'nullable|string|max:255',
            'job_title'   => 'nullable|string|max:255',
            'phone'       => 'nullable|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function resetPassword(Request $request, User $user) {
        abort_if(! $request->user()->isAdmin(), 403);

        $generatedPassword = \Illuminate\Support\Str::password(12, true, true, true, false);

        $user->update([
            'password' => $generatedPassword,
            'force_password_change' => true,
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\TemporaryPasswordMail($user, $generatedPassword));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('TemporaryPasswordMail failed: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé.',
            'generated_password' => $generatedPassword,
        ]);
    }

    public function destroy(Request $request, User $user) {
        abort_if(! $request->user()->isAdmin(), 403);
        abort_if($request->user()->id === $user->id, 422, 'Vous ne pouvez pas vous supprimer vous-même.');
        
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
                // Delete user's change histories
                \Illuminate\Support\Facades\DB::table('change_histories')->where('user_id', $user->id)->delete();
                
                // Delete user's change requests 
                // (MySQL will automatically cascade delete the histories/analysis linked to these requests)
                \Illuminate\Support\Facades\DB::table('change_requests')->where('requester_id', $user->id)->delete();
                
                // Finally, delete the user
                $user->delete();
            });
            
            return response()->json(['message' => 'Utilisateur et ses données associés supprimés.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur critique lors de la suppression de l\'utilisateur : ' . $e->getMessage()
            ], 500);
        }
    }
}