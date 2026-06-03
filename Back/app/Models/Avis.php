<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avis extends Model
{
    protected $fillable = [
        'reservation_id',
        'voyageur_id',
        'note',
        'commentaire',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function voyageur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voyageur_id');
    }
}
