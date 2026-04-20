<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChangeType extends Model
{
    protected $fillable = ['name'];

    public function changeRequests() {
        return $this->hasMany(ChangeRequest::class);
    }
}
