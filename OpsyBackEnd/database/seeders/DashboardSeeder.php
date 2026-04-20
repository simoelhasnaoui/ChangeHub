<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ChangeType;
use App\Models\ChangeRequest;
use App\Models\ChangeHistory;
use App\Models\PostChangeAnalysis;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Change Types exist
        $types = [];
        foreach (['Déploiement', 'Configuration', 'Maintenance', 'Correction'] as $t) {
            $types[] = ChangeType::updateOrCreate(['name' => $t]);
        }

        // 2. Create Users
        $roles = ['admin', 'approver', 'implementer', 'requester'];
        $users = [];
        foreach ($roles as $role) {
            for ($i = 1; $i <= 5; $i++) {
                $users[$role][] = User::updateOrCreate(
                    ['email' => "{$role}{$i}@app.com"],
                    [
                        'name' => ucfirst($role) . " User $i",
                        'password' => Hash::make('password'),
                        'role' => $role,
                        'department' => ['IT', 'DevOps', 'Sécurité', 'Réseau'][rand(0, 3)],
                        'status' => 'active'
                    ]
                );
            }
        }

        // 3. Populate Change Requests (History spread over 6 months)
        $statuses = ['draft', 'pending_approval', 'approved', 'in_progress', 'done', 'rejected'];
        $risks = ['low', 'medium', 'high'];

        for ($i = 1; $i <= 80; $i++) {
            $status = $statuses[rand(0, count($statuses) - 1)];
            $risk = $risks[rand(0, count($risks) - 1)];
            $reqUser = $users['requester'][rand(0, 4)];
            $implUser = $users['implementer'][rand(0, 4)];
            $appUser = $users['approver'][rand(0, 4)];
            $type = $types[rand(0, 3)];

            // Create dates spread over last 6 months
            $createdAt = now()->subDays(rand(0, 180));
            
            $cr = ChangeRequest::create([
                'title' => "Optimisation - " . ['Serveur', 'Pipeline', 'Base de données', 'Firewall', 'Cache'][rand(0, 4)] . " " . Str::random(4),
                'description' => "Ceci est une description générée pour la demande $i. Elle contient des détails techniques sur l'opération.",
                'change_type_id' => $type->id,
                'affected_system' => ['Azure AD', 'Kubernetes Cluster', 'Main DB', 'Firewall Edge', 'Frontend App'][rand(0, 4)],
                'planned_date' => $createdAt->copy()->addDays(rand(7, 30)),
                'risk_level' => $risk,
                'status' => $status,
                'requester_id' => $reqUser->id,
                'implementer_id' => in_array($status, ['approved', 'in_progress', 'done']) ? $implUser->id : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // 4. Create History (for Approval Rates)
            if ($status !== 'draft') {
                // Initial Transition
                ChangeHistory::create([
                    'change_request_id' => $cr->id,
                    'user_id' => $reqUser->id,
                    'old_status' => 'draft',
                    'new_status' => 'pending_approval',
                    'comment' => 'Soumission initiale.',
                    'created_at' => $createdAt->copy()->addMinutes(rand(10, 60))
                ]);

                if (in_array($status, ['approved', 'in_progress', 'done', 'rejected'])) {
                    $newStat = $status === 'rejected' ? 'rejected' : 'approved';
                    ChangeHistory::create([
                        'change_request_id' => $cr->id,
                        'user_id' => $appUser->id,
                        'old_status' => 'pending_approval',
                        'new_status' => $newStat,
                        'comment' => $newStat === 'approved' ? 'Validation technique okay.' : 'Rejeté par manque de rollback.',
                        'created_at' => $createdAt->copy()->addHours(rand(1, 48))
                    ]);
                }
            }

            // 5. Post-Change Analysis (for Incident Rate)
            if ($status === 'done') {
                PostChangeAnalysis::create([
                    'change_request_id' => $cr->id,
                    'incident_occurred' => (rand(1, 100) <= 15), // 15% rate
                    'description' => "Analyse post-implémentation pour le changement $i.",
                    'impact' => 'Impact minimal sur la production.',
                    'solution' => 'N/A',
                    'created_at' => $cr->planned_date->copy()->addHours(5)
                ]);
            }
        }
    }
}
