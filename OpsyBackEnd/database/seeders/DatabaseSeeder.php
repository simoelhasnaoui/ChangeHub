<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\ChangeType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        // Users
        $admin = User::updateOrCreate(['email' => 'admin@app.com'], ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'admin']);
        $approver = User::updateOrCreate(['email' => 'approver@app.com'], ['name' => 'Approbateur', 'password' => Hash::make('password'), 'role' => 'approver']);
        $impl = User::updateOrCreate(['email' => 'implementer@app.com'], ['name' => 'Implémenteur', 'password' => Hash::make('password'), 'role' => 'implementer']);
        $req = User::updateOrCreate(['email' => 'requester@app.com'], ['name' => 'Demandeur', 'password' => Hash::make('password'), 'role' => 'requester']);
        User::updateOrCreate(['email' => 'simo@app.com'], ['name' => 'simo', 'password' => Hash::make('simo1234'), 'role' => 'admin']);

        // Change types
        $types = [];
        foreach (['Déploiement', 'Configuration', 'Maintenance', 'Correction'] as $type) {
            $types[] = ChangeType::updateOrCreate(['name' => $type]);
        }

        // Sample Change Requests for Stats
        if (\App\Models\ChangeRequest::count() === 0) {
            foreach (range(1, 10) as $i) {
                $status = ['submitted', 'approved', 'rejected', 'implemented', 'validated'][rand(0, 4)];
                $risk = ['low', 'medium', 'high', 'critical'][rand(0, 3)];
                $cat = $types[rand(0, 3)]->id;

                \App\Models\ChangeRequest::create([
                    'title' => "Backup System Update $i",
                    'description' => "Periodic update for the backup system $i",
                    'category_id' => $cat,
                    'risk_level' => $risk,
                    'status' => $status,
                    'affected_system' => 'Database Cluster',
                    'requester_id' => $req->id,
                    'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                    'impact_analysis' => 'Minimal downtime expected.',
                    'rollback_plan' => 'Restore from snapshot.',
                    'scheduled_start' => now()->addDays(rand(1, 10)),
                    'scheduled_end' => now()->addDays(rand(11, 15)),
                ]);
            }
        }
    }
}