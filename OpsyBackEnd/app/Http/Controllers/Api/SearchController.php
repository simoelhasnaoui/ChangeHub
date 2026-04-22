<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ChangeRequest;
use App\Models\Incident;

class SearchController extends Controller {
    public function globalSearch(Request $request) {
        $q = $request->query('q');
        if (!$q || strlen($q) < 2) {
            return response()->json(['requests' => [], 'users' => [], 'incidents' => []]);
        }

        $user = $request->user();

        // 1. Change Requests
        $crQuery = ChangeRequest::with(['changeType', 'requester', 'implementers'])
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('affected_system', 'like', "%{$q}%")
                      ->orWhere('id', 'like', "%{$q}%");
            });

        // Filter by role visibility (consistent with ChangeRequestController)
        if ($user->isRequester()) {
            $crQuery->where('requester_id', $user->id);
        } elseif ($user->isImplementer()) {
            $crQuery->whereHas('implementers', function($query) use ($user) {
                $query->where('users.id', $user->id);
            });
        } elseif ($user->isApprover()) {
            // Approvers only see submitted requests
            $crQuery->whereIn('status', ['pending_approval', 'approved', 'in_progress', 'done', 'rejected']);
        }
        // Admin sees everything

        $requests = $crQuery->latest()->limit(8)->get();

        // 2. Users
        $users = User::where(function($query) use ($q) {
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('department', 'like', "%{$q}%");
        })->limit(5)->get();

        return response()->json([
            'requests' => $requests,
            'users' => $users,
        ]);
    }
}
