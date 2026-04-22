<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\User;
use App\Notifications\ChangeRequestNotification;
use App\Models\ChangeRequest;
use App\Models\ChangeHistory;
use App\Models\PostChangeAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ChangeRequestController extends Controller {
    use AuthorizesRequests;
    // List — filtered by role
    public function index(Request $request) {
        $user = $request->user();

        $query = ChangeRequest::with(['changeType', 'requester', 'implementers']);

        if ($user->isRequester()) {
            $query->where('requester_id', $user->id);
        } elseif ($user->isImplementer()) {
            $query->whereHas('implementers', function($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        } elseif ($user->isApprover()) {
            $query->whereIn('status', ['pending_approval', 'approved', 'in_progress', 'done', 'rejected']);
        }
        // admin sees all

        return response()->json($query->latest()->get());
    }

    // Create
    public function store(Request $request) {
        $this->authorize('create', ChangeRequest::class);

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'change_type_id'   => 'required|exists:change_types,id',
            'affected_system'  => 'required|string|max:255',
            'planned_date'     => 'required|date|after_or_equal:today',
            'risk_level'       => 'required|in:low,medium,high',
            'implementers'     => 'nullable|array',
            'implementers.*'   => 'exists:users,id',
        ]);

        $cr = ChangeRequest::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'change_type_id' => $data['change_type_id'],
            'affected_system' => $data['affected_system'],
            'planned_date' => $data['planned_date'],
            'risk_level' => $data['risk_level'],
            'requester_id' => $request->user()->id,
            'status' => 'draft',
        ]);

        if ($request->has('implementers')) {
            $cr->implementers()->sync($request->implementers);
        }

        $this->logHistory($cr, null, 'draft', 'Demande créée.', $request->user()->id);

        return response()->json($cr->load(['changeType', 'requester', 'implementers']), 201);
    }

    // Show
    public function show(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('view', $changeRequest);

        return response()->json(
            $changeRequest->load(['changeType', 'requester', 'implementers', 'histories.user', 'analysis', 'incidents'])
        );
    }

    // Update (draft only)
    public function update(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('update', $changeRequest);

        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'sometimes|string',
            'change_type_id'  => 'sometimes|exists:change_types,id',
            'affected_system' => 'sometimes|string|max:255',
            'planned_date'    => 'sometimes|date|after_or_equal:today',
            'risk_level'      => 'sometimes|in:low,medium,high',
            'implementers'    => 'sometimes|array',
            'implementers.*'  => 'exists:users,id',
        ]);

        if ($request->has('implementers')) {
            $changeRequest->implementers()->sync($request->implementers);
        }

        return response()->json($changeRequest->load(['changeType', 'requester', 'implementers']));
    }

    // Delete (draft only)
    public function destroy(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('delete', $changeRequest);
        $changeRequest->delete();
        return response()->json(['message' => 'Demande supprimée.']);
    }

    // Submit for approval (draft → pending_approval)
    public function submit(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('update', $changeRequest);

        abort_if($changeRequest->status !== 'draft', 422, 'Seules les demandes en brouillon peuvent être soumises.');

        $this->transition($changeRequest, 'pending_approval', 'Soumis pour approbation.', $request->user()->id);

        // Notify all Approvers
        $approvers = User::where('role', 'approver')->get();
        Notification::send($approvers, new ChangeRequestNotification(
            "Nouvelle demande en attente d'approbation: '{$changeRequest->title}'.",
            "/approver/changes/{$changeRequest->id}"
        ));

        return response()->json($changeRequest);
    }

    // Approve (pending_approval → approved)
    public function approve(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('approve', $changeRequest);

        $request->validate([
            'implementers' => 'required|array|min:1',
            'implementers.*' => 'exists:users,id',
            'approval_conditions' => 'nullable|string',
            'comment' => 'nullable|string',
        ]);

        if ($request->has('approval_conditions')) {
            $changeRequest->update(['approval_conditions' => $request->approval_conditions]);
        }

        $changeRequest->implementers()->sync($request->implementers);

        $comment = $request->input('comment') ?? 'Approuvé.';
        $this->transition($changeRequest, 'approved', $comment, $request->user()->id);

        // Notify Requester
        $changeRequest->requester->notify(new ChangeRequestNotification(
            "Votre demande '{$changeRequest->title}' a été approuvée.",
            "/requester/changes/{$changeRequest->id}"
        ));

        // Notify Implementers
        Notification::send($changeRequest->implementers, new ChangeRequestNotification(
            "Vous avez été assigné à une nouvelle demande: '{$changeRequest->title}'.",
            "/implementer/changes/{$changeRequest->id}"
        ));

        return response()->json($changeRequest->load(['changeType', 'requester', 'implementers']));
    }

    // Reject (pending_approval → rejected)
    public function reject(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('reject', $changeRequest);

        $request->validate([
            'comment' => 'required|string', // mandatory on rejection
        ]);

        $this->transition($changeRequest, 'rejected', $request->comment, $request->user()->id);

        // Notify Requester
        $changeRequest->requester->notify(new ChangeRequestNotification(
            "Votre demande '{$changeRequest->title}' a été rejetée.",
            "/requester/changes/{$changeRequest->id}"
        ));

        return response()->json($changeRequest);
    }

    // Appeal (rejected → pending_approval)
    public function appeal(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('appeal', $changeRequest);

        $request->validate([
            'comment' => 'required|string',
        ]);

        $this->transition($changeRequest, 'pending_approval', "Appel interjeté : " . $request->comment, $request->user()->id);

        // Notify all Approvers
        $approvers = \App\Models\User::where('role', 'approver')->get();
        \Illuminate\Support\Facades\Notification::send($approvers, new \App\Notifications\ChangeRequestNotification(
            "Un appel a été soumis pour la demande: '{$changeRequest->title}'.",
            "/approver/changes/{$changeRequest->id}"
        ));

        return response()->json($changeRequest);
    }

    // Update status — implementer (approved → in_progress → done)
    public function updateStatus(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('updateStatus', $changeRequest);

        $request->validate([
            'status'  => 'required|in:approved,in_progress,done',
            'comment' => 'nullable|string',
        ]);

        $statuses = ['approved', 'in_progress', 'done'];
        
        abort_unless(
            in_array($changeRequest->status, $statuses) && in_array($request->status, $statuses),
            422,
            'Transition de statut invalide pour ce type de dossier.'
        );

        $this->transition($changeRequest, $request->status, $request->input('comment') ?? '', $request->user()->id);

        // Notify Requester if done
        if ($request->status === 'done') {
            $changeRequest->requester->notify(new ChangeRequestNotification(
                "L'implémentation de '{$changeRequest->title}' est terminée. Votre validation est requise.",
                "/requester/changes/{$changeRequest->id}"
            ));
        }

        return response()->json($changeRequest);
    }

    // Validate completion - Requester
    public function validateChange(Request $request, ChangeRequest $changeRequest) {
        abort_if($request->user()->id !== $changeRequest->requester_id, 403, 'Seul le demandeur peut valider.');
        abort_if($changeRequest->status !== 'done', 422, 'Le changement n\'est pas encore terminé.');

        $request->validate([
            'validation_status' => 'required|in:validated,rejected',
            'comment'           => 'required_if:validation_status,rejected|nullable|string',
        ]);

        if ($request->validation_status === 'rejected') {
            $changeRequest->update(['requester_validation_status' => 'rejected']);
            $this->transition($changeRequest, 'in_progress', "Validation refusée par le demandeur. " . $request->comment, $request->user()->id);
            
            // Notify Implementers
            Notification::send($changeRequest->implementers, new ChangeRequestNotification(
                "Le demandeur a rejeté l'implémentation pour '{$changeRequest->title}'. Corrections requises.",
                "/implementer/changes/{$changeRequest->id}"
            ));
        } else {
            $changeRequest->update(['requester_validation_status' => 'validated']);
            $this->logHistory($changeRequest, 'done', 'done', 'Le demandeur a validé l\'implémentation.', $request->user()->id);
        }

        return response()->json($changeRequest);
    }

    // Add post-change analysis (done only)
    public function storeAnalysis(Request $request, ChangeRequest $changeRequest) {
        $this->authorize('addAnalysis', $changeRequest);

        $data = $request->validate([
            'incident_occurred' => 'required|boolean',
            'description'       => 'nullable|string',
            'impact'            => 'nullable|string',
            'solution'          => 'nullable|string',
            'incidents'         => 'nullable|array',
            'incidents.*.title' => 'required_with:incidents|string|max:255',
            'incidents.*.severity' => 'required_with:incidents|in:low,medium,high,critical',
            'incidents.*.description' => 'required_with:incidents|string',
            'incidents.*.resolution' => 'required_with:incidents|string',
            'incidents.*.time_to_resolve_minutes' => 'required_with:incidents|integer|min:0',
        ]);

        $analysis = clone collect($data)->except('incidents');

        $analysisRecord = PostChangeAnalysis::updateOrCreate(
            ['change_request_id' => $changeRequest->id],
            $analysis->toArray()
        );

        // Delete existing incidents to replace them or you can just add
        $changeRequest->incidents()->delete();

        if (!empty($data['incidents'])) {
            foreach ($data['incidents'] as $inv) {
                $changeRequest->incidents()->create([
                    'implementer_id' => $request->user()->id,
                    'title' => $inv['title'],
                    'severity' => $inv['severity'],
                    'description' => $inv['description'],
                    'resolution' => $inv['resolution'],
                    'time_to_resolve_minutes' => $inv['time_to_resolve_minutes']
                ]);
            }
        }

        return response()->json($analysisRecord->load('changeRequest.incidents'), 201);
    }

    // Helpers
    private function transition(ChangeRequest $cr, string $newStatus, string $comment, int $userId): void {
        $old = $cr->status;
        $cr->update(['status' => $newStatus]);
        $this->logHistory($cr, $old, $newStatus, $comment, $userId);
    }

    private function logHistory(ChangeRequest $cr, ?string $old, string $new, string $comment, int $userId): void {
        ChangeHistory::create([
            'change_request_id' => $cr->id,
            'user_id'           => $userId,
            'old_status'        => $old,
            'new_status'        => $new,
            'comment'           => $comment,
        ]);
    }
}