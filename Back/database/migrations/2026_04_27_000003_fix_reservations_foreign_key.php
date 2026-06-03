<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // The previous migration renamed trajets → trajets_old then recreated trajets.
        // SQLite silently rewired FK references in reservations (and avis) to trajets_old,
        // which was then dropped. We must rebuild both tables to fix the broken FKs.
        //
        // Order: drop children first (avis), rebuild parent (reservations), then rebuild child (avis).
        DB::statement('PRAGMA foreign_keys = OFF');

        // 1. Save avis data and drop it (it depends on reservations)
        DB::statement('CREATE TABLE avis_backup AS SELECT * FROM avis');
        DB::statement('DROP TABLE avis');

        // 2. Rebuild reservations with correct FK → trajets
        DB::statement('CREATE TABLE reservations_backup AS SELECT * FROM reservations');
        DB::statement('DROP TABLE reservations');
        DB::statement("
            CREATE TABLE reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                voyageur_id INTEGER NOT NULL,
                trajet_id INTEGER NOT NULL,
                date_reservation DATETIME NOT NULL,
                nb_places_reservees INTEGER NOT NULL,
                statut VARCHAR CHECK(statut IN ('en_attente','confirmee','annulee')) NOT NULL DEFAULT 'en_attente',
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                FOREIGN KEY (voyageur_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (trajet_id) REFERENCES trajets(id) ON DELETE CASCADE
            )
        ");
        DB::statement('INSERT INTO reservations SELECT * FROM reservations_backup');
        DB::statement('DROP TABLE reservations_backup');

        // 3. Recreate avis with correct FK → reservations
        DB::statement("
            CREATE TABLE avis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reservation_id INTEGER NOT NULL,
                voyageur_id INTEGER NOT NULL,
                note INTEGER NOT NULL,
                commentaire TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
                FOREIGN KEY (voyageur_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        DB::statement('INSERT INTO avis SELECT * FROM avis_backup');
        DB::statement('DROP TABLE avis_backup');

        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        // No revert needed.
    }
};
