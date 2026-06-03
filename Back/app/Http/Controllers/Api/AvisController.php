<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    /**
     * Évaluer service (UC5) = Noter (UC19) + Commenter (UC20)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'note'           => 'required|integer|min:1|max:5',
            'commentaire'    => 'nullable|string|max:1000',
        ]);

        $reservation = Reservation::findOrFail($validated['reservation_id']);

        // Vérifier que le voyageur est bien le propriétaire de la réservation
        if ($reservation->voyageur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // Vérifier que la réservation est confirmée
        if ($reservation->statut !== 'confirmee') {
            return response()->json(['message' => 'Vous ne pouvez évaluer qu\'une réservation confirmée.'], 422);
        }

        // Vérifier qu'un avis n'a pas déjà été donné
        $existingAvis = Avis::where('reservation_id', $reservation->id)
            ->where('voyageur_id', $request->user()->id)
            ->first();

        if ($existingAvis) {
            return response()->json(['message' => 'Vous avez déjà évalué cette réservation.'], 422);
        }

        $avis = Avis::create([
            'reservation_id' => $reservation->id,
            'voyageur_id'    => $request->user()->id,
            'note'           => $validated['note'],
            'commentaire'    => $validated['commentaire'] ?? null,
        ]);

        return response()->json([
            'message' => 'Avis enregistré.',
            'avis'    => $avis,
        ], 201);
    }

    /**
     * Lister les avis d'un trajet
     */
    public function index(int $trajetId): JsonResponse
    {
        $avis = Avis::whereHas('reservation', function ($query) use ($trajetId) {
            $query->where('trajet_id', $trajetId);
        })
            ->with('voyageur:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $moyenne = $avis->avg('note');

        return response()->json([
            'avis'         => $avis,
            'note_moyenne' => round($moyenne, 2),
            'total'        => $avis->count(),
        ]);
    }
}
