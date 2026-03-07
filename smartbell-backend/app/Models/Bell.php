<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bell extends Model
{
    protected $fillable = [
        'name',
        'sound_file',
        'duration',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function bellLogs(): HasMany
    {
        return $this->hasMany(BellLog::class);
    }
}
