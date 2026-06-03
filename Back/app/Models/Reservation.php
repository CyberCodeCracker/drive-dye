<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    protected $fillable = [
        'voyageur_id',
        'trajet_id',
        'date_reservation',
        'nb_places_reservees',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_reservation' => 'datetime',
        ];
    }

    public function voyageur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voyageur_id');
    }

    public function trajet(): BelongsTo
    {
        return $this->belongsTo(Trajet::class);
    }

    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class);
    }
}
