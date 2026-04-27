<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trajet extends Model
{
    protected $fillable = [
        'conducteur_id',
        'depart',
        'destination',
        'date_heure',
        'nb_places',
        'prix_min',
        'prix_max',
        'type_vehicule',
        'bagage',
        'fumeur',
        'genre',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_heure' => 'datetime',
            'prix_min' => 'decimal:2',
            'prix_max' => 'decimal:2',
            'fumeur' => 'boolean',
        ];
    }

    public function conducteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'conducteur_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function placesDisponibles(): int
    {
        $placesReservees = $this->reservations()
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->sum('nb_places_reservees');

        return max(0, $this->nb_places - $placesReservees);
    }

    /**
     * Scope : exclure les trajets sans place disponible
     */
    public function scopeAvecPlaces($query)
    {
        return $query->whereRaw(
            "nb_places > (
                SELECT COALESCE(SUM(nb_places_reservees), 0)
                FROM reservations
                WHERE reservations.trajet_id = trajets.id
                AND reservations.statut IN ('en_attente', 'confirmee')
            )"
        );
    }
}
