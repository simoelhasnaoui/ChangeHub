<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChangeHistory extends Model {
    protected $fillable = ['change_request_id', 'user_id', 'old_status', 'new_status', 'comment'];

    public function changeRequest() { return $this->belongsTo(ChangeRequest::class); }
    public function user()          { return $this->belongsTo(User::class); }
}