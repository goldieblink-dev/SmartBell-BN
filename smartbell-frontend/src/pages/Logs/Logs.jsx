import React, { useState, useEffect } from 'react';
import { Activity, Loader2, CheckCircle2, XCircle, Download } from 'lucide-react';
import api from '../../services/api';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/bell/logs');
                setLogs(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                    <Activity className="text-primary-600" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Bell Activity Logs</h1>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    disabled={isExporting}
                    onClick={async () => {
                        try {
                            setIsExporting(true);
                            const res = await api.get('/bell/logs/export', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'smartbell-activity-logs.pdf');
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        } catch (error) {
                            alert('Failed to export PDF');
                            console.error(error);
                        } finally {
                            setIsExporting(false);
                        }
                    }}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Export to PDF
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Action Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Notes</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Bell Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Schedule Info</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map(log => {
                                    const date = new Date(log.triggered_at);
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">{date.toLocaleDateString('id-ID')}</div>
                                                <div className="text-gray-500 text-xs">{date.toLocaleTimeString('id-ID')}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {log.schedule_id ? (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">Automatic</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">Manual</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 italic">
                                                {log.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {log.bell?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {log.schedule ? (
                                                    <>
                                                        <span className="font-medium text-gray-900">{log.schedule.day_of_week}</span>
                                                        <span className="mx-2 text-gray-300">|</span>
                                                        {log.schedule.time.substring(0, 5)}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not scheduled</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.status === 'success' ? (
                                                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded inline-flex text-sm font-medium">
                                                        <CheckCircle2 size={16} /> Success
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded inline-flex text-sm font-medium">
                                                        <XCircle size={16} /> Failed
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {logs.length === 0 && <div className="p-8 text-center text-gray-500">No activity logs recorded yet.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;
