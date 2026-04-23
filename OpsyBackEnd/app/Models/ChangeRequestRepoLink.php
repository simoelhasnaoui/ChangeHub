<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChangeRequestRepoLink extends Model
{
    protected $fillable = ['change_request_id', 'repo_full_name'];

    public function changeRequest()
    {
        return $this->belongsTo(ChangeRequest::class);
    }
}

