<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Marquer comme lue
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        $notification->update(['lue' => true]);

        return response()->json([
            'message'      => 'Notification lue.',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Marquer toutes comme lues
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->where('lue', false)->update(['lue' => true]);

        return response()->json([
            'message' => 'Toutes les notifications marquées comme lues.',
        ]);
    }
}
