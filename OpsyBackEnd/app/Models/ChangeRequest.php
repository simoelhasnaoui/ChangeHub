<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChangeRequest extends Model {
    protected $fillable = [
        'title', 'description', 'change_type_id', 'affected_system',
        'planned_date', 'risk_level', 'status', 'approval_conditions', 'requester_validation_status',
        'requester_id', 'implementer_id',
    ];

    public function changeType()  { return $this->belongsTo(ChangeType::class); }
    public function requester()   { return $this->belongsTo(User::class, 'requester_id'); }
    public function implementers() { return $this->belongsToMany(User::class, 'change_request_implementer', 'change_request_id', 'user_id'); }
    public function histories()   { return $this->hasMany(ChangeHistory::class); }
    public function analysis()    { return $this->hasOne(PostChangeAnalysis::class); }
    public function incidents()   { return $this->hasMany(Incident::class); }
}
