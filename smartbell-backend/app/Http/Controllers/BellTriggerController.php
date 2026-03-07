<?php

namespace App\Http\Controllers;

use App\Models\Bell;
use App\Models\BellLog;
use App\Services\BellService;
use App\Services\BellSchedulerService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BellTriggerController extends Controller
{
    protected BellService $bellService;
    protected BellSchedulerService $schedulerService;

    public function __construct(BellService $bellService, BellSchedulerService $schedulerService)
    {
        $this->bellService = $bellService;
        $this->schedulerService = $schedulerService;
    }

    public function ring(Request $request)
    {
        $validated = $request->validate([
            'bell_id' => 'required|exists:bells,id',
            'notes' => 'nullable|string|max:255'
        ]);

        $bell = Bell::findOrFail($validated['bell_id']);
        
        $success = $this->bellService->ring($bell);
        
        BellLog::create([
            'schedule_id' => null, // Manual trigger has no schedule
            'bell_id' => $bell->id,
            'trigger_minute' => Carbon::now('Asia/Jakarta')->format('Y-m-d H:i') . '_manual_' . uniqid(),
            'status' => $success ? 'success' : 'failed',
            'notes' => $validated['notes'] ?? null
        ]);

        return response()->json(['message' => 'Bell triggered manually', 'bell' => $bell]);
    }

    public function getNext()
    {
        $nextBell = $this->schedulerService->getNextBellEvent();

        if (!$nextBell) {
            return response()->json(null, 200);
        }

        return response()->json($nextBell);
    }

    public function getLatestTrigger()
    {
        // Get any successful log from the last 15 seconds
        $log = BellLog::with('bell')
            ->where('status', 'success')
            ->where('triggered_at', '>=', Carbon::now('Asia/Jakarta')->subSeconds(15))
            ->orderBy('triggered_at', 'desc')
            ->first();

        return response()->json($log); // Returns null if not found
    }
}
