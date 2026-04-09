<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trajets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conducteur_id')->constrained('users')->onDelete('cascade');
            $table->string('depart');
            $table->string('destination');
            $table->dateTime('date_heure');
            $table->integer('nb_places');
            $table->decimal('prix_min', 8, 2);
            $table->decimal('prix_max', 8, 2);
            $table->string('type_vehicule')->nullable();
            $table->string('bagage')->nullable();
            $table->boolean('fumeur')->default(false);
            $table->string('genre')->nullable();
            $table->enum('statut', ['actif', 'annule', 'termine'])->default('actif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trajets');
    }
};
