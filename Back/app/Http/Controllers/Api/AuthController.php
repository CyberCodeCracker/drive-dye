<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * S'inscrire (UC1)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role'     => 'in:voyageur,conducteur',
            'phone'    => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role'     => $validated['role'] ?? 'voyageur',
            'phone'    => $validated['phone'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * Se connecter (UC15) + S'authentifier (UC16)
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Votre compte a été bloqué.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Consulter profil (UC6)
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Gérer profil (UC6)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'photo' => 'nullable|string|max:255',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $request->user()->fresh(),
        ]);
    }

    /**
     * Profil public d'un conducteur avec ses avis
     */
    public function conducteurProfile(User $user): JsonResponse
    {
        // Get all avis linked to this driver's trajets
        $avis = Avis::whereHas('reservation.trajet', function ($query) use ($user) {
            $query->where('conducteur_id', $user->id);
        })
            ->with(['voyageur:id,name', 'reservation.trajet:id,depart,destination'])
            ->orderBy('created_at', 'desc')
            ->get();

        $noteMoyenne = $avis->avg('note');

        // Count stats
        $totalTrajets = $user->trajets()->where('statut', 'actif')->count();
        $totalReservations = $user->trajets()
            ->withCount(['reservations' => fn($q) => $q->where('statut', 'confirmee')])
            ->get()
            ->sum('reservations_count');

        return response()->json([
            'conducteur' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'role'       => $user->role,
                'phone'      => $user->phone,
                'created_at' => $user->created_at,
            ],
            'avis'              => $avis,
            'note_moyenne'      => round($noteMoyenne ?? 0, 2),
            'total_avis'        => $avis->count(),
            'total_trajets'     => $totalTrajets,
            'total_passagers'   => $totalReservations,
        ]);
    }
}
