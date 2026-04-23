<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\ChangeRequest;

class User extends Authenticatable {
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'force_password_change', 'department', 'job_title',
        'phone', 'employee_id', 'status',
        'github_id', 'github_login', 'github_token', 'github_connected_at',
        'google_id', 'google_email', 'google_refresh_token', 'google_connected_at',
    ];
    protected $hidden   = ['password', 'remember_token', 'github_token', 'google_refresh_token'];
    protected $casts    = [
        'password' => 'hashed',
        'force_password_change' => 'boolean',
        'github_connected_at' => 'datetime',
        'github_token' => 'encrypted',
        'google_connected_at' => 'datetime',
        'google_refresh_token' => 'encrypted',
    ];

    /** When set, in-app notifications are also sent to this address (Gmail via your SMTP). */
    public function routeNotificationForMail(): ?string
    {
        return $this->google_email ?: null;
    }

    public function changeRequestsAsRequester() {
        return $this->hasMany(ChangeRequest::class, 'requester_id');
    }
    public function changeRequestsAsImplementer() {
        return $this->belongsToMany(ChangeRequest::class, 'change_request_implementer', 'user_id', 'change_request_id');
    }
    public function isAdmin():       bool { return $this->role === 'admin'; }
    public function isApprover():    bool { return $this->role === 'approver'; }
    public function isImplementer(): bool { return $this->role === 'implementer'; }
    public function isRequester():   bool { return $this->role === 'requester'; }
}