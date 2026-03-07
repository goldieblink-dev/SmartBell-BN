<?php

namespace App\Http\Controllers;

use App\Models\BellLog;
use Illuminate\Http\Request;

class BellLogController extends Controller
{
    public function index()
    {
        $logs = BellLog::with(['schedule', 'bell'])
            ->orderBy('triggered_at', 'desc')
            ->limit(100)
            ->get();
            
        return response()->json($logs);
    }

    public function exportPdf()
    {
        $logs = BellLog::with(['schedule', 'bell'])
            ->orderBy('triggered_at', 'desc')
            ->limit(500)
            ->get();
            
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.logs', compact('logs'));
        return $pdf->download('smartbell-activity-logs.pdf');
    }
}
