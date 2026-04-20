<?php
namespace App\Policies;

use App\Models\User;
use App\Models\ChangeRequest;

class ChangeRequestPolicy
{
    /**
     * Admins can do everything.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return null;
    }

    /**
     * Only requesters can create change requests.
     */
    public function create(User $user): bool
    {
        return $user->isRequester();
    }

    /**
     * View: requester owns it, or assigned implementer, or approver.
     */
    public function view(User $user, ChangeRequest $cr): bool
    {
        return $user->id === $cr->requester_id
            || $user->id === $cr->implementer_id
            || $user->isApprover();
    }

    /**
     * Update: only the requester who owns it, and only while draft.
     */
    public function update(User $user, ChangeRequest $cr): bool
    {
        return $user->id === $cr->requester_id && $cr->status === 'draft';
    }

    /**
     * Delete: only the requester who owns it, and only while draft.
     */
    public function delete(User $user, ChangeRequest $cr): bool
    {
        return $user->id === $cr->requester_id && $cr->status === 'draft';
    }

    /**
     * Approve: only approvers, and only when pending.
     */
    public function approve(User $user, ChangeRequest $cr): bool
    {
        return $user->isApprover() && $cr->status === 'pending_approval';
    }

    /**
     * Reject: only approvers, and only when pending.
     */
    public function reject(User $user, ChangeRequest $cr): bool
    {
        return $user->isApprover() && $cr->status === 'pending_approval';
    }

    /**
     * Update status: only the assigned implementer.
     */
    public function updateStatus(User $user, ChangeRequest $cr): bool
    {
        return $user->id === $cr->implementer_id;
    }

    /**
     * Add analysis: only the assigned implementer, and only when done.
     */
    public function addAnalysis(User $user, ChangeRequest $cr): bool
    {
        return $user->id === $cr->implementer_id && $cr->status === 'done';
    }
}
