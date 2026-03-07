<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BellController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\BellLogController;
use App\Http\Controllers\BellTriggerController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\SettingController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::apiResource('bells', BellController::class);
    Route::apiResource('schedules', ScheduleController::class);
    Route::apiResource('holidays', HolidayController::class)->except(['show', 'update']); // only index, store, destroy
    
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::post('/settings/account', [SettingController::class, 'updateAccount']);
    
    Route::get('/bell/logs', [BellLogController::class, 'index']);
    Route::get('/bell/logs/export', [BellLogController::class, 'exportPdf']);
    Route::get('/bell/next', [BellTriggerController::class, 'getNext']);
    Route::get('/bell/latest-trigger', [BellTriggerController::class, 'getLatestTrigger']);
    Route::post('/bell/ring', [BellTriggerController::class, 'ring']);
});
