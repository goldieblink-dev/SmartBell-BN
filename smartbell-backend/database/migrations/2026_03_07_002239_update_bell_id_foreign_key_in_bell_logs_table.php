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
        Schema::table('bell_logs', function (Blueprint $table) {
            $table->dropForeign(['bell_id']);
            $table->unsignedBigInteger('bell_id')->nullable()->change();
            $table->foreign('bell_id')->references('id')->on('bells')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bell_logs', function (Blueprint $table) {
            $table->dropForeign(['bell_id']);
            $table->unsignedBigInteger('bell_id')->nullable(false)->change();
            $table->foreign('bell_id')->references('id')->on('bells')->cascadeOnDelete();
        });
    }
};
