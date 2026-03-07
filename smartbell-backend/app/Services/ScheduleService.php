<?php

namespace App\Services;

use App\Models\Schedule;

class ScheduleService
{
    /**
     * Provide any necessary schedule validation or complex logic here.
     * For now, it mostly delegates to Eloquent queries.
     */
    public function getAllSchedules()
    {
        return Schedule::with('bell')->orderBy('time')->get();
    }
}
