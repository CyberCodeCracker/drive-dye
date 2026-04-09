# Backend Laravel — Plateforme de Covoiturage

API REST Laravel 12 + Sanctum pour une plateforme de covoiturage, respectant fidèlement les diagrammes de cas d'utilisation et de classes fournis.

## Architecture

- **Héritage Conducteur → Voyageur** : table `users` unique avec champ `role` (`voyageur`, `conducteur`, `admin`). Un conducteur hérite de tous les cas d'utilisation du voyageur.
- **Authentification** : Laravel Sanctum (tokens API, pas JWT réel mais token-based auth comme demandé).
- **Base de données** : SQLite (existant).

---

## Proposed Changes

### 1. Sanctum Setup

#### [MODIFY] [composer.json](file:///c:/Laravel/covoiturage/composer.json)
- Run `composer require laravel/sanctum`

#### [NEW] [api.php](file:///c:/Laravel/covoiturage/routes/api.php)
- Will be created by Sanctum install or manually

---

### 2. Migrations

#### [MODIFY] [create_users_table.php](file:///c:/Laravel/covoiturage/database/migrations/0001_01_01_000000_create_users_table.php)
- Add: `role` (enum: voyageur/conducteur/admin, default voyageur), `phone`, `photo`

#### [NEW] create_vehicules_table migration
| Column | Type |
|---|---|
| id | bigint PK |
| conducteur_id | FK → users |
| marque, modele, couleur | string |
| immatriculation | string unique |
| places | int |

#### [NEW] create_trajets_table migration
| Column | Type |
|---|---|
| id | bigint PK |
| conducteur_id | FK → users |
| depart, destination | string |
| date_heure | datetime |
| nb_places | int |
| prix_min, prix_max | decimal |
| type_vehicule, bagage, genre | string |
| fumeur | boolean |
| statut | string (actif/annulé/terminé) |

#### [NEW] create_reservations_table migration
| Column | Type |
|---|---|
| id | bigint PK |
| voyageur_id | FK → users |
| trajet_id | FK → trajets |
| date_reservation | datetime |
| nb_places_reservees | int |
| statut | string (en_attente/confirmee/annulee) |

#### [NEW] create_avis_table migration
| Column | Type |
|---|---|
| id | bigint PK |
| reservation_id | FK → reservations |
| voyageur_id | FK → users |
| note | int (1-5) |
| commentaire | text |

#### [NEW] create_notifications_table migration
| Column | Type |
|---|---|
| id | bigint PK |
| user_id | FK → users |
| message | string |
| lue | boolean |

---

### 3. Models

#### [MODIFY] [User.php](file:///c:/Laravel/covoiturage/app/Models/User.php)
- Add `HasApiTokens` trait, `role`/`phone`/`photo` to fillable
- Add relations: `vehicules()`, `trajets()`, `reservations()`, `avis()`, `notifications()`
- Add helpers: `isAdmin()`, `isConducteur()`, `isVoyageur()`

#### [NEW] `app/Models/Vehicule.php` — belongsTo conducteur
#### [NEW] `app/Models/Trajet.php` — belongsTo conducteur, hasMany reservations
#### [NEW] `app/Models/Reservation.php` — belongsTo voyageur & trajet, hasMany avis
#### [NEW] `app/Models/Avis.php` — belongsTo reservation & voyageur
#### [NEW] `app/Models/Notification.php` — belongsTo user

---

### 4. Middleware

#### [NEW] `app/Http/Middleware/CheckRole.php`
- Accepts role parameter(s), returns 403 if user role does not match

---

### 5. Controllers

#### [NEW] `app/Http/Controllers/Api/AuthController.php`
- `register()` — S'inscrire (UC1)
- `login()` — Se connecter (UC15) + S'authentifier (UC16)
- `logout()` — Déconnexion
- `profile()` / `updateProfile()` — Gérer profil (UC6)

#### [NEW] `app/Http/Controllers/Api/TrajetController.php`
- `index()` — Recherche simple (UC17)
- `search()` — Recherche avancée (UC18) avec filtres (prix, fumeur, bagage, genre, type véhicule)
- `show()` — Voir détails trajet (UC14)
- `store()` — Proposer trajet (UC8) [conducteur]
- `update()` / `destroy()` — Gérer mes offres (UC21) [conducteur]

#### [NEW] `app/Http/Controllers/Api/ReservationController.php`
- `store()` — Réserver trajet (UC3)
- `index()` — Gérer réservation (UC4) / Consulter réservation (UC10)
- `confirm()` / `cancel()` — Confirmer / Annuler (UC4)

#### [NEW] `app/Http/Controllers/Api/AvisController.php`
- `store()` — Évaluer service (UC5 = Noter UC19 + Commenter UC20)
- `index()` — Lister avis d'un trajet

#### [NEW] `app/Http/Controllers/Api/VehiculeController.php`
- CRUD — Gérer véhicule (UC7) [conducteur]

#### [NEW] `app/Http/Controllers/Api/AdminController.php`
- `users()` / `blockUser()` — Gérer user (UC11) + Bloquer user (UC22)
- `trajets()` / `updateTrajet()` / `deleteTrajet()` — Gérer propositions de trajet (UC12)
- `dashboard()` — Consulter dashboard (UC13) / AfficherStatistique

#### [NEW] `app/Http/Controllers/Api/NotificationController.php`
- `index()` / `markAsRead()`

---

### 6. Routes (`routes/api.php`)

```
POST   /register
POST   /login

middleware(auth:sanctum):
  POST   /logout
  GET    /profile
  PUT    /profile

  GET    /trajets              (recherche simple)
  GET    /trajets/search       (recherche avancée)
  GET    /trajets/{id}

  POST   /reservations
  GET    /reservations
  PUT    /reservations/{id}/confirm
  PUT    /reservations/{id}/cancel

  POST   /avis
  GET    /trajets/{id}/avis

  GET    /notifications
  PUT    /notifications/{id}/read

middleware(auth:sanctum + role:conducteur):
  POST   /trajets
  PUT    /trajets/{id}
  DELETE /trajets/{id}
  GET    /conducteur/reservations
  CRUD   /vehicules

middleware(auth:sanctum + role:admin):
  GET    /admin/users
  PUT    /admin/users/{id}/block
  GET    /admin/trajets
  PUT    /admin/trajets/{id}
  DELETE /admin/trajets/{id}
  GET    /admin/dashboard
```

---

## Verification Plan

### Automated
1. `php artisan migrate:fresh` — confirm all migrations pass without errors
2. `php artisan route:list --path=api` — verify all expected routes are registered
3. `php artisan tinker` — create a test user and verify token generation with Sanctum

### Manual (via curl/Postman)
1. **Register** → POST `/api/register` with name/email/password → expect 201 + token
2. **Login** → POST `/api/login` → expect 200 + token
3. **Create trajet** (as conducteur) → POST `/api/trajets` with Bearer token → expect 201
4. **Search trajets** → GET `/api/trajets?depart=X&destination=Y` → expect results
5. **Reserve** → POST `/api/reservations` as voyageur → expect 201
6. **Admin dashboard** → GET `/api/admin/dashboard` as admin → expect stats
