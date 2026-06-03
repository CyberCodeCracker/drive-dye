<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite enum columns have a CHECK constraint that blocks 'en_attente'.
        // The only way to change it in SQLite is to rebuild the table.
        DB::transaction(function () {
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::statement('ALTER TABLE trajets RENAME TO trajets_old');

            DB::statement("
                CREATE TABLE trajets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conducteur_id INTEGER NOT NULL,
                    depart VARCHAR NOT NULL,
                    destination VARCHAR NOT NULL,
                    date_heure DATETIME NOT NULL,
                    nb_places INTEGER NOT NULL,
                    prix_min DECIMAL(8,2) NOT NULL,
                    prix_max DECIMAL(8,2) NOT NULL,
                    type_vehicule VARCHAR,
                    bagage VARCHAR,
                    fumeur BOOLEAN NOT NULL DEFAULT 0,
                    genre VARCHAR,
                    statut VARCHAR CHECK(statut IN ('en_attente','actif','annule','termine')) NOT NULL DEFAULT 'en_attente',
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    FOREIGN KEY (conducteur_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            DB::statement('INSERT INTO trajets SELECT * FROM trajets_old');
            DB::statement('DROP TABLE trajets_old');

            DB::statement('PRAGMA foreign_keys = ON');
        });
    }

    public function down(): void
    {
        DB::transaction(function () {
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::statement('ALTER TABLE trajets RENAME TO trajets_old');

            DB::statement("
                CREATE TABLE trajets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conducteur_id INTEGER NOT NULL,
                    depart VARCHAR NOT NULL,
                    destination VARCHAR NOT NULL,
                    date_heure DATETIME NOT NULL,
                    nb_places INTEGER NOT NULL,
                    prix_min DECIMAL(8,2) NOT NULL,
                    prix_max DECIMAL(8,2) NOT NULL,
                    type_vehicule VARCHAR,
                    bagage VARCHAR,
                    fumeur BOOLEAN NOT NULL DEFAULT 0,
                    genre VARCHAR,
                    statut VARCHAR CHECK(statut IN ('actif','annule','termine')) NOT NULL DEFAULT 'actif',
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    FOREIGN KEY (conducteur_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            DB::statement('INSERT INTO trajets SELECT * FROM trajets_old');
            DB::statement('DROP TABLE trajets_old');

            DB::statement('PRAGMA foreign_keys = ON');
        });
    }
};
