<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = [
        'day_of_week',
        'type',
        'time',
        'bell_id',
        'description',
    ];

    public function bell(): BelongsTo
    {
        return $this->belongsTo(Bell::class);
    }

    public function bellLogs(): HasMany
    {
        return $this->hasMany(BellLog::class);
    }
}
