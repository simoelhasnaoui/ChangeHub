<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$email = 'admin@app.com';
$password = 'password';

$user = App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "User NOT FOUND\n";
    exit;
}

echo "User Found: " . $user->email . "\n";
echo "Password Match: " . (Illuminate\Support\Facades\Hash::check($password, $user->password) ? "YES" : "NO") . "\n";
echo "Hash: " . $user->password . "\n";
