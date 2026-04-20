<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$start = microtime(true);
$password = 'password';
$hash = password_hash($password, PASSWORD_BCRYPT);
$check = password_verify($password, $hash);
$end = microtime(true);

echo "Hash check took: " . ($end - $start) . " seconds\n";
