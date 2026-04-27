<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'photo',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean',
        ];
    }

    // --- Role helpers ---

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isConducteur(): bool
    {
        return $this->role === 'conducteur';
    }

    public function isVoyageur(): bool
    {
        return $this->role === 'voyageur';
    }

    // --- Relations ---

    public function vehicules(): HasMany
    {
        return $this->hasMany(Vehicule::class, 'conducteur_id');
    }

    public function trajets(): HasMany
    {
        return $this->hasMany(Trajet::class, 'conducteur_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'voyageur_id');
    }

    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class, 'voyageur_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
