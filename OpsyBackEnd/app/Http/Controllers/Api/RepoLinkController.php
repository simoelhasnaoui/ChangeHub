<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\ChangeRequestRepoLink;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class RepoLinkController extends Controller
{
    use AuthorizesRequests;

    public function upsert(Request $request, ChangeRequest $changeRequest)
    {
        $this->authorize('updateStatus', $changeRequest);

        $data = $request->validate([
            'repo_full_name' => 'nullable|string',
        ]);

        $repo = trim((string)($data['repo_full_name'] ?? ''));
        if ($repo === '') {
            ChangeRequestRepoLink::where('change_request_id', $changeRequest->id)->delete();
            return response()->json(['repo_full_name' => null]);
        }

        if (!str_contains($repo, '/')) {
            return response()->json(['message' => 'Invalid repo_full_name. Expected "owner/name".'], 422);
        }

        $link = ChangeRequestRepoLink::updateOrCreate(
            ['change_request_id' => $changeRequest->id],
            ['repo_full_name' => $repo]
        );

        return response()->json(['repo_full_name' => $link->repo_full_name]);
    }
}

