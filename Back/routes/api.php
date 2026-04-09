<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TrajetController;
use App\Http\Controllers\Api\VehiculeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Recherche de trajets (accessible sans auth)
Route::get('/trajets', [TrajetController::class, 'index']);
Route::get('/trajets/search', [TrajetController::class, 'search']);
Route::get('/trajets/{trajet}', [TrajetController::class, 'show']);
Route::get('/trajets/{trajet}/avis', [AvisController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Routes authentifiées (tout utilisateur connecté)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Réservations (voyageur)
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::put('/reservations/{reservation}/confirm', [ReservationController::class, 'confirm']);
    Route::put('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

    // Avis
    Route::post('/avis', [AvisController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    /*
    |----------------------------------------------------------------------
    | Routes conducteur
    |----------------------------------------------------------------------
    */
    Route::middleware('role:conducteur')->group(function () {

        // Trajets (CRUD conducteur)
        Route::post('/trajets', [TrajetController::class, 'store']);
        Route::put('/trajets/{trajet}', [TrajetController::class, 'update']);
        Route::delete('/trajets/{trajet}', [TrajetController::class, 'destroy']);
        Route::get('/conducteur/trajets', [TrajetController::class, 'mesTrajets']);

        // Réservations reçues
        Route::get('/conducteur/reservations', [ReservationController::class, 'conducteurReservations']);

        // Véhicules
        Route::apiResource('/vehicules', VehiculeController::class);
    });

    /*
    |----------------------------------------------------------------------
    | Routes administrateur
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}/block', [AdminController::class, 'blockUser']);

        Route::get('/trajets', [AdminController::class, 'trajets']);
        Route::put('/trajets/{trajet}', [AdminController::class, 'updateTrajet']);
        Route::delete('/trajets/{trajet}', [AdminController::class, 'deleteTrajet']);

        Route::get('/dashboard', [AdminController::class, 'dashboard']);
    });
});
