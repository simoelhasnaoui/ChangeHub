<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PostChangeAnalysis extends Model {
    protected $table    = 'post_change_analysis';
    protected $fillable = ['change_request_id', 'incident_occurred', 'description', 'impact', 'solution'];
    protected $casts    = ['incident_occurred' => 'boolean'];

    public function changeRequest() { return $this->belongsTo(ChangeRequest::class); }
}
