<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$email = 'simo@app.com';
$password = 'simo1234';

$user = App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "User not found\n";
    exit;
}

echo "User found: " . $user->email . "\n";
echo "Hashed password in DB: " . $user->password . "\n";
echo "Does it match '$password'? " . (Illuminate\Support\Facades\Hash::check($password, $user->password) ? "YES" : "NO") . "\n";
