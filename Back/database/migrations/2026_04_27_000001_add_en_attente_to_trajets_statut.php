<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // The 'statut' column is TEXT in SQLite — it already accepts any string value
        // including 'en_attente'. The TrajetController now explicitly sets
        // statut='en_attente' on creation, so no schema change is needed.
        // This migration exists as a marker for the workflow change.
    }

    public function down(): void
    {
        // Nothing to revert.
    }
};
