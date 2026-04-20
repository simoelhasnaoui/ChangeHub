<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $fillable = [
        'change_request_id',
        'implementer_id',
        'title',
        'severity',
        'description',
        'resolution',
        'time_to_resolve_minutes',
    ];

    public function changeRequest()
    {
        return $this->belongsTo(ChangeRequest::class);
    }
}
