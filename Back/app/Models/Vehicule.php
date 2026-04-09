<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicule extends Model
{
    protected $fillable = [
        'conducteur_id',
        'marque',
        'modele',
        'couleur',
        'immatriculation',
        'places',
    ];

    public function conducteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'conducteur_id');
    }
}
