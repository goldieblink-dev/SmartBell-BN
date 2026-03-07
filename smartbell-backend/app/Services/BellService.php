<?php

namespace App\Services;

use App\Models\Bell;
use Illuminate\Support\Facades\Log;

class BellService
{
    /**
     * Trigger the physical or audio bell.
     * In a real deployment, this might trigger a local audio player via exec()
     * or send an IoT signal to a physical bell.
     */
    public function ring(Bell $bell): bool
    {
        Log::info("Ringing bell: {$bell->name} ({$bell->sound_file}) for {$bell->duration} seconds.");
        
        // Mocking the bell trigger logic
        // exec("play public/sounds/{$bell->sound_file}");

        return true;
    }
}
