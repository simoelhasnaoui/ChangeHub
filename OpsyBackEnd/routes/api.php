<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChangeRequestController;
use App\Http\Controllers\Api\ChangeTypeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\GitHubController;
use App\Http\Controllers\Api\RepoLinkController;
use App\Http\Controllers\Api\GoogleAuthController;

// Public
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/github/link/callback', [GitHubController::class, 'callback']);
Route::get('/google/link/callback', [GoogleAuthController::class, 'callback']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    
    // Global Search
    Route::get('/search', [SearchController::class, 'globalSearch']);
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Google (Gmail — notification copy for all authenticated roles)
    Route::post('/google/link/start', [GoogleAuthController::class, 'startLink']);
    Route::post('/google/disconnect', [GoogleAuthController::class, 'disconnect']);

    // GitHub (Implementer)
    Route::get('/github/status', [GitHubController::class, 'status']);
    Route::post('/github/link/start', [GitHubController::class, 'startLink']);
    Route::post('/github/disconnect', [GitHubController::class, 'disconnect']);
    Route::get('/github/repos', [GitHubController::class, 'repos']);
    Route::post('/github/repo-insights', [GitHubController::class, 'repoInsights']);

    // Change types (all roles — used in forms)
    Route::get('/change-types', [ChangeTypeController::class, 'index']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/implementers', [UserController::class, 'implementers']);
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
    // Passwords
    Route::post('/password/change', [AuthController::class, 'changePassword']);
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

    // Change requests — CRUD
    Route::get('/change-requests', [ChangeRequestController::class, 'index']);
    Route::get('/change-requests/activity', [ChangeRequestController::class, 'activity']);
    Route::post('/change-requests', [ChangeRequestController::class, 'store']);
    Route::get('/change-requests/{changeRequest}', [ChangeRequestController::class, 'show']);
    Route::put('/change-requests/{changeRequest}', [ChangeRequestController::class, 'update']);
    Route::delete('/change-requests/{changeRequest}', [ChangeRequestController::class, 'destroy']);
    Route::post('/change-requests/{changeRequest}/repo-link', [RepoLinkController::class, 'upsert']);

    // Workflow actions
    Route::post('/change-requests/{changeRequest}/submit', [ChangeRequestController::class, 'submit']);
    Route::post('/change-requests/{changeRequest}/approve', [ChangeRequestController::class, 'approve']);
    Route::post('/change-requests/{changeRequest}/reject', [ChangeRequestController::class, 'reject']);
    Route::post('/change-requests/{changeRequest}/appeal', [ChangeRequestController::class, 'appeal']);
    Route::post('/change-requests/{changeRequest}/update-status', [ChangeRequestController::class, 'updateStatus']);
    Route::post('/change-requests/{changeRequest}/validate', [ChangeRequestController::class, 'validateChange']);

    // Post-change analysis
    Route::post('/change-requests/{changeRequest}/analysis', [ChangeRequestController::class, 'storeAnalysis']);
    Route::get('/change-requests/{changeRequest}/analysis/pdf', [ChangeRequestController::class, 'downloadAnalysisPdf']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Stats (Admin only)
    Route::get('/admin/stats', [StatsController::class, 'index']);
});