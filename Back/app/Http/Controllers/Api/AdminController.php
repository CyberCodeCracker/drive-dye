<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Trajet;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Gérer user (UC11) — liste des utilisateurs
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    /**
     * Bloquer / Débloquer user (UC22)
     */
    public function blockUser(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Impossible de bloquer un administrateur.'], 422);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);

        $status = $user->is_blocked ? 'bloqué' : 'débloqué';

        return response()->json([
            'message' => "Utilisateur {$status}.",
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * Gérer propositions de trajet (UC12) — liste
     */
    public function trajets(Request $request): JsonResponse
    {
        $query = Trajet::with('conducteur');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $trajets = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($trajets);
    }

    /**
     * Modifier trajet (admin) (UC12)
     */
    public function updateTrajet(Request $request, Trajet $trajet): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'sometimes|in:en_attente,actif,annule,termine',
        ]);

        $trajet->update($validated);

        return response()->json([
            'message' => 'Trajet mis à jour.',
            'trajet'  => $trajet->fresh(),
        ]);
    }

    /**
     * Approuver un trajet (admin)
     */
    public function approveTrajet(Trajet $trajet): JsonResponse
    {
        if ($trajet->statut !== 'en_attente') {
            return response()->json(['message' => 'Ce trajet ne peut pas être approuvé.'], 422);
        }

        $trajet->update(['statut' => 'actif']);

        Notification::create([
            'user_id' => $trajet->conducteur_id,
            'message' => "Votre trajet {$trajet->depart} → {$trajet->destination} a été approuvé par l'administrateur.",
        ]);

        return response()->json([
            'message' => 'Trajet approuvé.',
            'trajet'  => $trajet->fresh()->load('conducteur'),
        ]);
    }

    /**
     * Rejeter un trajet (admin)
     */
    public function rejectTrajet(Trajet $trajet): JsonResponse
    {
        if ($trajet->statut !== 'en_attente') {
            return response()->json(['message' => 'Ce trajet ne peut pas être rejeté.'], 422);
        }

        $trajet->update(['statut' => 'annule']);

        Notification::create([
            'user_id' => $trajet->conducteur_id,
            'message' => "Votre trajet {$trajet->depart} → {$trajet->destination} a été refusé par l'administrateur.",
        ]);

        return response()->json([
            'message' => 'Trajet rejeté.',
            'trajet'  => $trajet->fresh()->load('conducteur'),
        ]);
    }

    /**
     * Supprimer trajet (admin) (UC12)
     */
    public function deleteTrajet(Trajet $trajet): JsonResponse
    {
        $trajet->delete();

        return response()->json([
            'message' => 'Trajet supprimé.',
        ]);
    }

    /**
     * Consulter dashboard (UC13) — TableauDeBord / AfficherStatistique
     */
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_users'        => User::count(),
            'total_voyageurs'    => User::where('role', 'voyageur')->count(),
            'total_conducteurs'  => User::where('role', 'conducteur')->count(),
            'total_trajets'      => Trajet::count(),
            'trajets_actifs'     => Trajet::where('statut', 'actif')->count(),
            'trajets_en_attente' => Trajet::where('statut', 'en_attente')->count(),
            'total_reservations' => Reservation::count(),
            'reservations_confirmees' => Reservation::where('statut', 'confirmee')->count(),
            'reservations_en_attente' => Reservation::where('statut', 'en_attente')->count(),
            'users_bloques'      => User::where('is_blocked', true)->count(),
        ];

        return response()->json($stats);
    }
}
