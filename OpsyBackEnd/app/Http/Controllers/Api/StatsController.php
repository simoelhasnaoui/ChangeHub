<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index()
    {
        // 1. TOP CARDS (7 Primary Metrics)
        $totalRequests = ChangeRequest::count();
        $pendingApproval = ChangeRequest::where('status', 'pending_approval')->count();
        $inProgress = ChangeRequest::where('status', 'in_progress')->count();
        $doneThisMonth = ChangeRequest::where('status', 'done')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $rejected = ChangeRequest::where('status', 'rejected')->count();
        $totalUsers = User::count();
        $activeImplementers = User::where('role', 'implementer')->count();

        // 2. BREAKDOWNS (Charts)
        $statusBreakdown = ChangeRequest::select('status', DB::raw('count(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => $item->status, // Map in front for translation
                'value' => (int) $item->value
            ]);

        $riskBreakdown = ChangeRequest::select('risk_level', DB::raw('count(*) as value'))
            ->groupBy('risk_level')
            ->get()
            ->map(fn($item) => [
                'name' => $item->risk_level,
                'value' => (int) $item->value
            ]);

        $typeBreakdown = ChangeRequest::join('change_types', 'change_requests.change_type_id', '=', 'change_types.id')
            ->select('change_types.name', DB::raw('count(*) as value'))
            ->groupBy('change_types.name')
            ->get();

        // Historical - Last 6 Months (Safe French Format)
        $monthsFr = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 
            5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août', 
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        $requestsOverTime = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = ChangeRequest::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $requestsOverTime->push([
                'month' => $monthsFr[$date->month],
                'count' => $count
            ]);
        }

        // 3. TOP PERFORMERS
        $topRequesters = ChangeRequest::join('users', 'change_requests.requester_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as total'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $topImplementers = ChangeRequest::join('users', 'change_requests.implementer_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as total'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        // Approval Rates (from History)
        $approverStats = DB::table('change_histories')
            ->join('users', 'change_histories.user_id', '=', 'users.id')
            ->whereIn('new_status', ['approved', 'rejected'])
            ->select(
                'users.name',
                DB::raw('SUM(CASE WHEN new_status = "approved" THEN 1 ELSE 0 END) as approved'),
                DB::raw('SUM(CASE WHEN new_status = "rejected" THEN 1 ELSE 0 END) as rejected')
            )
            ->groupBy('users.id', 'users.name')
            ->get()
            ->map(function($stat) {
                $total = $stat->approved + $stat->rejected;
                $stat->rate = $total > 0 ? round(($stat->approved / $total) * 100) : 0;
                return $stat;
            });

        // 4. INCIDENT RATE
        $totalAnalyzed = DB::table('post_change_analysis')->count();
        $incidentsFound = DB::table('post_change_analysis')->where('incident_occurred', true)->count();
        $incidentRate = $totalAnalyzed > 0 ? round(($incidentsFound / $totalAnalyzed) * 100, 1) : 0;

        return response()->json([
            'cards' => [
                'totalRequests' => $totalRequests,
                'pendingApproval' => $pendingApproval,
                'inProgress' => $inProgress,
                'doneThisMonth' => $doneThisMonth,
                'rejected' => $rejected,
                'totalUsers' => $totalUsers,
                'activeImplementers' => $activeImplementers,
            ],
            'breakdowns' => [
                'status' => $statusBreakdown,
                'risk' => $riskBreakdown,
                'type' => $typeBreakdown,
                'overTime' => $requestsOverTime,
            ],
            'performance' => [
                'topRequesters' => $topRequesters,
                'topImplementers' => $topImplementers,
                'approvers' => $approverStats,
            ],
            'metrics' => [
                'incidentRate' => $incidentRate,
                'totalReports' => $totalAnalyzed
            ]
        ]);
    }
}
