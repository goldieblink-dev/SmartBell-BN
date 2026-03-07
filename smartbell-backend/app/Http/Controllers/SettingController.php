<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json([
            'active_mode' => $settings['active_mode'] ?? 'regular',
            'master_volume' => $settings['master_volume'] ?? '1.0',
            'is_muted' => isset($settings['is_muted']) ? $settings['is_muted'] === 'true' : false,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.active_mode' => 'nullable|string|in:regular,exam',
            'settings.master_volume' => 'nullable|numeric|between:0,1',
            'settings.is_muted' => 'nullable|boolean',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function updateAccount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'current_password' => 'required|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        $admin = $request->user();

        if (!Hash::check($validated['current_password'], $admin->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $admin->name = $validated['name'];
        $admin->email = $validated['email'];
        
        if (!empty($validated['new_password'])) {
            $admin->password = Hash::make($validated['new_password']);
        }

        $admin->save();

        return response()->json(['message' => 'Account updated successfully']);
    }
}
