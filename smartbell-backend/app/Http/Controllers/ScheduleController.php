<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        return response()->json(Schedule::with('bell')->orderBy('time', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'time' => 'required|date_format:H:i',
            'bell_id' => 'required|exists:bells,id',
            'description' => 'nullable|string|max:255',
        ]);

        $schedule = Schedule::create($validated);
        return response()->json($schedule->load('bell'), 201);
    }

    public function update(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);
        
        $validated = $request->validate([
            'day_of_week' => 'sometimes|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'time' => 'sometimes|date_format:H:i',
            'bell_id' => 'sometimes|exists:bells,id',
            'description' => 'nullable|string|max:255',
        ]);

        $schedule->update($validated);
        return response()->json($schedule->load('bell'));
    }

    public function destroy(string $id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        
        return response()->json(null, 204);
    }
}
