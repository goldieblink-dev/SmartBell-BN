<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index()
    {
        return response()->json(Holiday::orderBy('date', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'description' => 'nullable|string|max:255',
        ]);

        $holiday = Holiday::create($validated);
        return response()->json($holiday, 201);
    }

    public function destroy(string $id)
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->delete();
        
        return response()->json(null, 204);
    }
}
