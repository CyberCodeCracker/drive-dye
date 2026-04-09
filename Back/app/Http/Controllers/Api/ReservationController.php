<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Trajet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Réserver trajet (UC3)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trajet_id'          => 'required|exists:trajets,id',
            'nb_places_reservees' => 'required|integer|min:1',
        ]);

        $trajet = Trajet::findOrFail($validated['trajet_id']);

        if ($trajet->statut !== 'actif') {
            return response()->json(['message' => 'Ce trajet n\'est plus disponible.'], 422);
        }

        if ($trajet->conducteur_id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas réserver votre propre trajet.'], 422);
        }

        if ($trajet->placesDisponibles() < $validated['nb_places_reservees']) {
            return response()->json(['message' => 'Nombre de places insuffisant.'], 422);
        }

        $reservation = Reservation::create([
            'voyageur_id'         => $request->user()->id,
            'trajet_id'           => $trajet->id,
            'date_reservation'    => now(),
            'nb_places_reservees' => $validated['nb_places_reservees'],
            'statut'              => 'en_attente',
        ]);

        // Notification au conducteur
        Notification::create([
            'user_id' => $trajet->conducteur_id,
            'message' => "Nouvelle réservation de {$request->user()->name} pour votre trajet {$trajet->depart} → {$trajet->destination}.",
        ]);

        return response()->json([
            'message'     => 'Réservation effectuée.',
            'reservation' => $reservation->load('trajet'),
        ], 201);
    }

    /**
     * Gérer réservation (UC4) — liste des réservations du voyageur
     */
    public function index(Request $request): JsonResponse
    {
        $reservations = $request->user()->reservations()
            ->with(['trajet.conducteur'])
            ->orderBy('date_reservation', 'desc')
            ->paginate(15);

        return response()->json($reservations);
    }

    /**
     * Détails d'une réservation
     */
    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->voyageur_id !== $request->user()->id
            && $reservation->trajet->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $reservation->load(['trajet.conducteur', 'avis']);

        return response()->json($reservation);
    }

    /**
     * Confirmer réservation (UC4) — par le conducteur
     */
    public function confirm(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->trajet->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($reservation->statut !== 'en_attente') {
            return response()->json(['message' => 'Impossible de confirmer cette réservation.'], 422);
        }

        $reservation->update(['statut' => 'confirmee']);

        Notification::create([
            'user_id' => $reservation->voyageur_id,
            'message' => "Votre réservation pour {$reservation->trajet->depart} → {$reservation->trajet->destination} a été confirmée.",
        ]);

        return response()->json([
            'message'     => 'Réservation confirmée.',
            'reservation' => $reservation->fresh(),
        ]);
    }

    /**
     * Annuler réservation (UC4)
     */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Le voyageur ou le conducteur peuvent annuler
        if ($reservation->voyageur_id !== $user->id
            && $reservation->trajet->conducteur_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($reservation->statut === 'annulee') {
            return response()->json(['message' => 'Réservation déjà annulée.'], 422);
        }

        $reservation->update(['statut' => 'annulee']);

        // Notifier l'autre partie
        $notifyUserId = ($reservation->voyageur_id === $user->id)
            ? $reservation->trajet->conducteur_id
            : $reservation->voyageur_id;

        Notification::create([
            'user_id' => $notifyUserId,
            'message' => "La réservation pour {$reservation->trajet->depart} → {$reservation->trajet->destination} a été annulée par {$user->name}.",
        ]);

        return response()->json([
            'message'     => 'Réservation annulée.',
            'reservation' => $reservation->fresh(),
        ]);
    }

    /**
     * Consulter réservation (UC10) — réservations reçues par le conducteur
     */
    public function conducteurReservations(Request $request): JsonResponse
    {
        $trajetIds = $request->user()->trajets()->pluck('id');

        $reservations = Reservation::with(['voyageur', 'trajet'])
            ->whereIn('trajet_id', $trajetIds)
            ->orderBy('date_reservation', 'desc')
            ->paginate(15);

        return response()->json($reservations);
    }
}
