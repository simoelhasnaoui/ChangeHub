<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChangeType;

class ChangeTypeController extends Controller {
    public function index() {
        return response()->json(ChangeType::all());
    }
}