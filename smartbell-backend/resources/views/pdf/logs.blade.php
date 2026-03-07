<!DOCTYPE html>
<html>
<head>
    <title>SmartBell Activity Logs</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
        th { background-color: #f2f2f2; }
        .success { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h2>SmartBell Activity Logs</h2>
    <p>Generated on: {{ \Carbon\Carbon::now('Asia/Jakarta')->format('d M Y H:i') }}</p>
    <table>
        <thead>
            <tr>
                <th>Date / Time</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Bell Name</th>
                <th>Schedule Info</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($logs as $log)
            <tr>
                <td>{{ \Carbon\Carbon::parse($log->triggered_at)->format('d/m/Y H:i:s') }}</td>
                <td>{{ $log->schedule_id ? 'Auto' : 'Manual' }}</td>
                <td>{{ $log->notes ?: '-' }}</td>
                <td>{{ $log->bell ? $log->bell->name : 'Unknown' }}</td>
                <td>
                    @if($log->schedule)
                        {{ $log->schedule->day_of_week }} | {{ substr($log->schedule->time, 0, 5) }}
                    @else
                        -
                    @endif
                </td>
                <td class="{{ $log->status == 'success' ? 'success' : 'failed' }}">{{ ucfirst($log->status) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
