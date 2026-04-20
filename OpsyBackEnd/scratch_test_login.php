<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;

$request = Request::create('/api/login', 'POST', [
    'email' => 'simo@app.com',
    'password' => 'simo1234'
]);

$controller = new AuthController();

try {
    $response = $controller->login($request);
    echo "Login successful!\n";
    echo $response->getContent() . "\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "Login failed: " . json_encode($e->errors()) . "\n";
} catch (\Exception $e) {
    echo "An error occurred: " . $e->getMessage() . "\n";
}
