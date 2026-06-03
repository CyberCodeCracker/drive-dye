<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès interdit. Rôle insuffisant.',
            ], 403);
        }

        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Votre compte a été bloqué.',
            ], 403);
        }

        return $next($request);
    }
}
