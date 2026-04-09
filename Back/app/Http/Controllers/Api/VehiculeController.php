<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehiculeController extends Controller
{
    /**
     * Gérer véhicule (UC7) — liste
     */
    public function index(Request $request): JsonResponse
    {
        $vehicules = $request->user()->vehicules;

        return response()->json($vehicules);
    }

    /**
     * Ajouter véhicule
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'couleur'         => 'required|string|max:50',
            'immatriculation' => 'required|string|max:20|unique:vehicules',
            'places'          => 'required|integer|min:1|max:50',
        ]);

        $vehicule = $request->user()->vehicules()->create($validated);

        return response()->json([
            'message'  => 'Véhicule ajouté.',
            'vehicule' => $vehicule,
        ], 201);
    }

    /**
     * Détails véhicule
     */
    public function show(Request $request, Vehicule $vehicule): JsonResponse
    {
        if ($vehicule->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($vehicule);
    }

    /**
     * Modifier véhicule
     */
    public function update(Request $request, Vehicule $vehicule): JsonResponse
    {
        if ($vehicule->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'marque'          => 'sometimes|string|max:100',
            'modele'          => 'sometimes|string|max:100',
            'couleur'         => 'sometimes|string|max:50',
            'immatriculation' => 'sometimes|string|max:20|unique:vehicules,immatriculation,' . $vehicule->id,
            'places'          => 'sometimes|integer|min:1|max:50',
        ]);

        $vehicule->update($validated);

        return response()->json([
            'message'  => 'Véhicule mis à jour.',
            'vehicule' => $vehicule->fresh(),
        ]);
    }

    /**
     * Supprimer véhicule
     */
    public function destroy(Request $request, Vehicule $vehicule): JsonResponse
    {
        if ($vehicule->conducteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $vehicule->delete();

        return response()->json([
            'message' => 'Véhicule supprimé.',
        ]);
    }
}
