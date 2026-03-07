<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BellLog extends Model
{
    protected $fillable = [
        'schedule_id',
        'bell_id',
        'triggered_at',
        'trigger_minute',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'triggered_at' => 'datetime',
        ];
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function bell(): BelongsTo
    {
        return $this->belongsTo(Bell::class);
    }
}
