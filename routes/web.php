<?php

use App\Http\Controllers\ServerController;
use App\Http\Controllers\ServerMessageController;
use App\Http\Controllers\ServerUserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::resource('servers', ServerController::class)->middleware(['auth']);
Route::resource('servers.messages', ServerMessageController::class);
Route::post('/servers/{server}/users/leave', [ServerUserController::class, 'leave']);

require __DIR__ . '/auth.php';
