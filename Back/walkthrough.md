# Covoiturage Backend — Walkthrough

## What Was Built

Backend API Laravel 12 + Sanctum for a carpooling platform, respecting the provided use case and class diagrams.

## Architecture

- **Single [users](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/AdminController.php#14-36) table** with `role` field ([voyageur](file:///c:/Laravel/covoiturage/app/Models/Avis.php#22-26), [conducteur](file:///c:/Laravel/covoiturage/app/Models/Vehicule.php#19-23), `admin`) to model inheritance Conducteur → Voyageur
- **Sanctum token-based auth** via `HasApiTokens` trait
- **Role middleware** ([CheckRole](file:///c:/Laravel/covoiturage/app/Http/Middleware/CheckRole.php#9-30)) registered as `role` alias — also blocks banned users

## Files Created/Modified

### Migrations (8 tables total)
| File | Purpose |
|---|---|
| [0001_01_01_000000_create_users_table.php](file:///c:/Laravel/covoiturage/database/migrations/0001_01_01_000000_create_users_table.php) | **Modified** — added `role`, `phone`, `photo`, `is_blocked` |
| [2026_04_01_140000_create_vehicules_table.php](file:///c:/Laravel/covoiturage/database/migrations/2026_04_01_140000_create_vehicules_table.php) | Vehicles for conducteurs |
| [2026_04_01_140001_create_trajets_table.php](file:///c:/Laravel/covoiturage/database/migrations/2026_04_01_140001_create_trajets_table.php) | Trips with all search filters |
| [2026_04_01_140002_create_reservations_table.php](file:///c:/Laravel/covoiturage/database/migrations/2026_04_01_140002_create_reservations_table.php) | Bookings linking voyageur↔trajet |
| [2026_04_01_140003_create_avis_table.php](file:///c:/Laravel/covoiturage/database/migrations/2026_04_01_140003_create_avis_table.php) | Reviews (note + commentaire) |
| [2026_04_01_140004_create_notifications_table.php](file:///c:/Laravel/covoiturage/database/migrations/2026_04_01_140004_create_notifications_table.php) | User notifications |

### Models (6)
[User](file:///c:/Laravel/covoiturage/app/Models/User.php#12-84), [Vehicule](file:///c:/Laravel/covoiturage/app/Models/Vehicule.php#8-24), [Trajet](file:///c:/Laravel/covoiturage/app/Models/Trajet.php#9-55), [Reservation](file:///c:/Laravel/covoiturage/app/Models/Reservation.php#9-41), [Avis](file:///c:/Laravel/covoiturage/app/Models/Avis.php#8-27), [Notification](file:///c:/Laravel/covoiturage/app/Models/Notification.php#8-28) — all with proper relations and casts.

### Controllers (7) → 34 API Routes

| Controller | Use Cases Covered |
|---|---|
| [AuthController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/AuthController.php#12-116) | UC1 (S'inscrire), UC15/UC16 (Se connecter/S'authentifier), UC6 (Gérer profil) |
| [TrajetController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/TrajetController.php#10-183) | UC17 (Recherche simple), UC18 (Recherche avancée), UC14 (Détails), UC8 (Proposer), UC21 (Gérer offres) |
| [ReservationController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/ReservationController.php#12-162) | UC3 (Réserver), UC4 (Gérer réservation), UC10 (Consulter réservations conducteur) |
| [AvisController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/AvisController.php#11-79) | UC5 (Évaluer) = UC19 (Noter) + UC20 (Commenter) |
| [VehiculeController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/VehiculeController.php#10-96) | UC7 (Gérer véhicule) |
| [AdminController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/AdminController.php#12-121) | UC11 (Gérer user), UC22 (Bloquer), UC12 (Gérer trajets), UC13 (Dashboard) |
| [NotificationController](file:///c:/Laravel/covoiturage/app/Http/Controllers/Api/NotificationController.php#9-50) | Notifications (envoyerEmail from diagram → in-app notifications) |

### Route Groups
- **Public**: register, login, search trajets, view trajet details/avis
- **Auth (sanctum)**: logout, profile, reservations, avis, notifications
- **Conducteur**: CRUD trajets, vehicules, view received reservations
- **Admin**: manage users/block, manage trajets, dashboard stats

## Verification Results

- ✅ `php artisan migrate:fresh` — all 8 migrations passed
- ✅ `php artisan route:list` — 34 routes registered
- ✅ Middleware `role` alias correctly registered in [bootstrap/app.php](file:///c:/Laravel/covoiturage/bootstrap/app.php)
