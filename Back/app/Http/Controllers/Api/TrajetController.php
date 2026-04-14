<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trajet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrajetController extends Controller
{
    /**
     * Recherche simple (UC17) — liste des trajets avec filtres basiques
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trajet::with('conducteur')->where('statut', 'actif');

        if ($request->filled('depart')) {
            $query->where('depart', 'like', '%' . $request->depart . '%');
        }

        if ($request->filled('destination')) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        if ($request->filled('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        $trajets = $query->orderBy('date_heure', 'asc')->paginate(9);

        return response()->json($trajets);
    }

    /**
     * Recherche avancée (UC18) — filtres complets
     */
    public function search(Request $request): JsonResponse
    {
        $query = Trajet::with('conducteur')->where('statut', 'actif');

        if ($request->filled('depart')) {
            $query->where('depart', 'like', '%' . $request->depart . '%');
        }

        if ($request->filled('destination')) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        if ($request->filled('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        if ($request->filled('prix_max')) {
            $query->where('prix_min', '<=', $request->prix_max);
        }

        if ($request->filled('type_vehicule')) {
            $query->where('type_vehicule', $request->type_vehicule);
        }

        if ($request->filled('fumeur')) {
            $query->where('fumeur', filter_var($request->fumeur, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('bagage')) {
            $query->where('bagage', $request->bagage);
        }

        if ($request->filled('genre')) {
            $query->where('genre', $request->genre);
        }

        if ($request->filled('nb_places')) {
            $query->where('nb_places', '>=', $request->nb_places);
        }

        $trajets = $query->orderBy('date_heure', 'asc')->paginate(15);

        return response()->json($trajets);
    }

    /**
     * Voir détails trajet (UC14)
     */
    public function show(Trajet $trajet): JsonResponse
    {
        $trajet->load(['conducteur', 'reservations.avis']);

        return response()->json([
            'trajet'             => $trajet,
            'places_disponibles' => $trajet->placesDisponibles(),
        ]);
    }

    /**
     * Proposer trajet (UC8) — conducteur uniquement
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'depart'         => 'required|string|max:255',
            'destination'    => 'required|string|max:255',
            'date_heure'     => 'required|date|after:now',
            'nb_places'      => 'required|integer|min:1',
            'prix_min'       => 'required|numeric|min:0',
            'prix_max'       => 'required|numeric|gte:prix_min',
            'type_vehicule'  => 'nullable|string|max:100',
            'bagage'         => 'nullable|string|max:100',
            'fumeur'         => 'boolean',
            'genre'          => 'nullable|string|max:50',
        ]);

        $trajet = $request->user()->trajets()->create($validated);

        return response()->json([
            'message' => 'Trajet créé avec succès.',
            'trajet'  => $trajet,
        ], 201);
    }

    /**
     * Modifier trajet — Gérer mes offres (UC21)
     */
    public function update(Request $request, Trajet $trajet): JsonResponse
    {
        if ($trajet->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'depart'         => 'sometimes|string|max:255',
            'destination'    => 'sometimes|string|max:255',
            'date_heure'     => 'sometimes|date|after:now',
            'nb_places'      => 'sometimes|integer|min:1',
            'prix_min'       => 'sometimes|numeric|min:0',
            'prix_max'       => 'sometimes|numeric',
            'type_vehicule'  => 'nullable|string|max:100',
            'bagage'         => 'nullable|string|max:100',
            'fumeur'         => 'boolean',
            'genre'          => 'nullable|string|max:50',
            'statut'         => 'in:actif,annule,termine',
        ]);

        $trajet->update($validated);

        return response()->json([
            'message' => 'Trajet mis à jour.',
            'trajet'  => $trajet->fresh(),
        ]);
    }

    /**
     * Supprimer trajet — Gérer mes offres (UC21)
     */
    public function destroy(Request $request, Trajet $trajet): JsonResponse
    {
        if ($trajet->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $trajet->delete();

        return response()->json([
            'message' => 'Trajet supprimé.',
        ]);
    }

    /**
     * Mes trajets — Gérer mes offres (UC21) — liste pour conducteur
     */
    public function mesTrajets(Request $request): JsonResponse
    {
        $trajets = $request->user()->trajets()
            ->with('reservations')
            ->orderBy('date_heure', 'desc')
            ->paginate(15);

        return response()->json($trajets);
    }
}
