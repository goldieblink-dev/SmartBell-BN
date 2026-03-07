<?php

namespace App\Http\Controllers;

use App\Models\Bell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BellController extends Controller
{
    public function index()
    {
        return response()->json(Bell::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sound_file' => 'nullable|file|mimes:mp3,wav|max:5120', // max 5MB
            'duration' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('sound_file')) {
            $path = $request->file('sound_file')->store('bells', 'public');
            $validated['sound_file'] = $path;
        }

        $bell = Bell::create($validated);
        return response()->json($bell, 201);
    }

    public function update(Request $request, string $id)
    {
        $bell = Bell::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sound_file' => 'sometimes|file|mimes:mp3,wav,ogg,mpeg|max:10240',
            'duration' => 'sometimes|integer|min:1',
        ]);

        if ($request->hasFile('sound_file')) {
            // Delete old file
            if ($bell->sound_file && Storage::disk('public')->exists($bell->sound_file)) {
                Storage::disk('public')->delete($bell->sound_file);
            }
            
            $path = $request->file('sound_file')->store('bells', 'public');
            $validated['sound_file'] = $path;
        } else {
            // Remove from validated array if its just a string/empty (not a new file) to keep existing
            unset($validated['sound_file']);
        }

        $bell->update($validated);
        return response()->json($bell);
    }

    public function destroy(string $id)
    {
        $bell = Bell::findOrFail($id);
        
        if ($bell->sound_file && Storage::disk('public')->exists($bell->sound_file)) {
            Storage::disk('public')->delete($bell->sound_file);
        }
        
        $bell->delete();
        
        return response()->json(null, 204);
    }
}
