<?php

use Illuminate\Support\Facades\Schedule;
use App\Services\BellSchedulerService;

Schedule::call(function () {
    app(BellSchedulerService::class)->runMinuteCheck();
})->everyMinute();
