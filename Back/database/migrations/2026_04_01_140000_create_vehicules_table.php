<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conducteur_id')->constrained('users')->onDelete('cascade');
            $table->string('marque');
            $table->string('modele');
            $table->string('couleur');
            $table->string('immatriculation')->unique();
            $table->integer('places');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicules');
    }
};
