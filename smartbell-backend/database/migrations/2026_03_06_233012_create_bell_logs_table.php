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
        Schema::create('bell_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bell_id')->constrained()->cascadeOnDelete();
            $table->timestamp('triggered_at')->useCurrent();
            $table->string('trigger_minute', 50)->comment('Format YYYY-MM-DD HH:MM');
            $table->string('status', 50)->default('success');
            $table->timestamps();

            $table->unique(['schedule_id', 'trigger_minute']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bell_logs');
    }
};
