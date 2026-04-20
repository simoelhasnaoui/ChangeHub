<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test that the PostChangeAnalysis model points to the correct table
try {
    $count = App\Models\PostChangeAnalysis::count();
    echo "SUCCESS: PostChangeAnalysis model works. Row count: $count\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// Test that a change request loads with analysis relationship
$cr = App\Models\ChangeRequest::with(['changeType', 'requester', 'implementer', 'histories.user', 'analysis'])->first();
if ($cr) {
    echo "SUCCESS: ChangeRequest loaded with all relations: {$cr->title}\n";
} else {
    echo "No change requests found (this is OK if none created yet)\n";
}
