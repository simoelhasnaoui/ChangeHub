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
        'phone', 'employee_id', 'status', 'avatar_path'
    ];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = ['password' => 'hashed', 'force_password_change' => 'boolean'];

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