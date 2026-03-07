<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\BellLog;
use App\Models\Holiday;
use App\Models\Setting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BellSchedulerService
{
    protected BellService $bellService;

    public function __construct(BellService $bellService)
    {
        $this->bellService = $bellService;
    }

    /**
     * Run the scheduler logic.
     * Must be called every minute by Laravel's Scheduler.
     */
    public function runMinuteCheck(): void
    {
        $now = Carbon::now('Asia/Jakarta');
        
        // 1. Check for Holiday
        if (Holiday::where('date', $now->toDateString())->exists()) {
            Log::info("Skipping bell trigger. Today is a registered holiday.");
            return;
        }

        $currentDay = $now->englishDayOfWeek; // e.g., "Monday"
        $currentTime = $now->format('H:i:00'); // e.g., "07:00:00"
        $currentMinute = $now->format('Y-m-d H:i'); // e.g., "2023-10-31 07:00"
        $oneMinuteLater = $now->copy()->addMinute()->format('H:i:00'); // e.g., "07:01:00"
        
        // 2. Filter by Active Schedule Mode (regular vs exam) and Mute Status
        $activeModeSetting = Setting::where('key', 'active_mode')->first();
        $isMutedSetting = Setting::where('key', 'is_muted')->first();
        
        $activeMode = $activeModeSetting ? $activeModeSetting->value : 'regular';
        $isMuted = $isMutedSetting && $isMutedSetting->value === 'true';

        if ($isMuted) {
            Log::info("Skipping bell trigger. System is manually muted.");
            return; // System is manually muted for emergencies
        }

        $schedules = Schedule::where('day_of_week', $currentDay)
            ->where('time', '>=', $currentTime)
            ->where('time', '<', $oneMinuteLater)
            ->where('type', $activeMode)
            ->with('bell')
            ->get();

        foreach ($schedules as $schedule) {
            $this->processSchedule($schedule, $currentMinute);
        }
    }

    /**
     * Process an individual schedule and ensure anti-double-trigger logic.
     */
    protected function processSchedule(Schedule $schedule, string $currentMinute): void
    {
        DB::transaction(function () use ($schedule, $currentMinute) {
            // Check if log already exists to prevent double-trigger
            $existingLog = BellLog::where('schedule_id', $schedule->id)
                ->where('trigger_minute', $currentMinute)
                ->first();

            if ($existingLog) {
                Log::info("Trigger skipped for Schedule ID: {$schedule->id}. Already triggered at {$currentMinute}");
                return;
            }

            // Trigger the bell
            $success = $this->bellService->ring($schedule->bell);

            // Record the activity log
            BellLog::create([
                'schedule_id' => $schedule->id,
                'bell_id' => $schedule->bell_id,
                'trigger_minute' => $currentMinute,
                'status' => $success ? 'success' : 'failed',
            ]);
            
            Log::info("Successfully processed and logged Schedule ID: {$schedule->id}");
        });
    }

    /**
     * Determine the next upcoming bell event.
     */
    public function getNextBellEvent(): ?array
    {
        $now = Carbon::now('Asia/Jakarta');
        
        if (Holiday::where('date', $now->toDateString())->exists()) {
            // It's a holiday, return early for today but we might want to check the next non-holiday day.
            // For simplicity in the dashboard, just say "Holiday" currently
             return [
                'day_of_week' => $now->englishDayOfWeek,
                'time' => '--:--',
                'bell_name' => 'Holiday',
                'description' => 'No bells today',
                'time_remaining' => 'Muted',
            ];
        }

        $currentDay = $now->englishDayOfWeek;
        $currentTime = $now->format('H:i:s');
        
        $activeModeSetting = Setting::where('key', 'active_mode')->first();
        $activeMode = $activeModeSetting ? $activeModeSetting->value : 'regular';
        
        // Case 1: Search for schedules remaining today
        $nextSchedule = Schedule::where('day_of_week', $currentDay)
            ->where('time', '>', $currentTime)
            ->where('type', $activeMode)
            ->orderBy('time', 'asc')
            ->with('bell')
            ->first();

        // Case 2: If no more schedules today, find the first schedule of upcoming days
        if (!$nextSchedule) {
            $daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            $currentIndex = array_search($currentDay, $daysOrder);
            
            // Reorder days array starting from tomorrow
            $upcomingDays = array_merge(
                array_slice($daysOrder, $currentIndex + 1),
                array_slice($daysOrder, 0, $currentIndex + 1)
            );

            foreach ($upcomingDays as $day) {
                // In a perfect system we would also check if the upcoming day is a holiday, but we will keep it simple
                $nextSchedule = Schedule::where('day_of_week', $day)
                    ->where('type', $activeMode)
                    ->orderBy('time', 'asc')
                    ->with('bell')
                    ->first();
                    
                if ($nextSchedule) {
                    break;
                }
            }
        }

        if (!$nextSchedule) {
            return null; // No schedules exist in the system at all
        }

        // Calculate time remaining
        $scheduleDateTime = $this->calculateScheduleDateTime($now, $nextSchedule->day_of_week, $nextSchedule->time);
        $diffInMinutes = $now->diffInMinutes($scheduleDateTime, false);

        if ($diffInMinutes < 0) {
            $diffInMinutes += 7 * 24 * 60; // Add a week if logic goes backwards
        }

        $hours = floor($diffInMinutes / 60);
        $minutes = $diffInMinutes % 60;
        
        $timeRemainingStr = "";
        if ($hours > 0) $timeRemainingStr .= "{$hours} hours ";
        $timeRemainingStr .= "{$minutes} minutes";

        return [
            'day_of_week' => $nextSchedule->day_of_week,
            'time' => Carbon::parse($nextSchedule->time)->format('H:i'),
            'bell_name' => $nextSchedule->bell->name,
            'description' => $nextSchedule->description,
            'time_remaining' => trim($timeRemainingStr),
        ];
    }

    /**
     * Helper to get accurate target datetime for calculation
     */
    private function calculateScheduleDateTime(Carbon $now, string $targetDay, string $targetTime): Carbon
    {
        $target = Carbon::parse($targetTime, 'Asia/Jakarta');
        
        if ($now->englishDayOfWeek !== $targetDay) {
            $target->next($targetDay);
        } elseif ($targetTime <= $now->format('H:i:s')) {
            // Same day, but time already passed -> next week
            $target->addWeek();
        } else {
            // Same day, time is in future -> keep today
            $target->setDate($now->year, $now->month, $now->day);
        }

        return $target;
    }
}
