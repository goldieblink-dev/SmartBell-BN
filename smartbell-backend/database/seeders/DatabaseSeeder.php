<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Bell;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Add default admin
        Admin::create([
            'name' => 'Administrator',
            'email' => 'admin@smkbn666.sch.id',
            'password' => Hash::make('password'),
        ]);

        // Add example bells
        $bells = [
            ['name' => 'School Start', 'sound_file' => 'school_start.mp3', 'duration' => 15],
            ['name' => 'Class Change', 'sound_file' => 'class_change.mp3', 'duration' => 10],
            ['name' => 'Break Time', 'sound_file' => 'break_time.mp3', 'duration' => 15],
            ['name' => 'End of School', 'sound_file' => 'end_school.mp3', 'duration' => 20],
        ];

        foreach ($bells as $bell) {
            Bell::create($bell);
        }
    }
}
