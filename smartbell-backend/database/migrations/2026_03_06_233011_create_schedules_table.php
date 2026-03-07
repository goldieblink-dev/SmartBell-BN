<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('day_of_week', 20);
            $table->time('time');
            $table->foreignId('bell_id')->constrained()->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['day_of_week', 'time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
