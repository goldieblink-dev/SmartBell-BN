import React, { useState, useEffect } from 'react';
import { Clock, BellRing, Activity, CalendarDays, Loader2, Play } from 'lucide-react';
import api from '../../services/api';
import ManualRingModal from '../../components/ManualRingModal';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextBell, setNextBell] = useState(null);
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ringModalState, setRingModalState] = useState({ isOpen: false, bellId: null, bellName: '' });
    const [isManualRinging, setIsManualRinging] = useState(false);

    const fetchData = async () => {
        try {
            const [nextRes, schedRes, logsRes] = await Promise.all([
                api.get('/bell/next').catch(() => ({ data: null })),
                api.get('/schedules'),
                api.get('/bell/logs')
            ]);

            setNextBell(nextRes.data);

            // Filter today's schedules
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayName = days[new Date().getDay()];
            const todays = schedRes.data.filter(s => s.day_of_week === todayName);
            setTodaySchedules(todays);

            setRecentLogs(logsRes.data.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Update time every second for the clock
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        // Refresh API data every minute to catch bell changes
        const dataInterval = setInterval(fetchData, 60000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(dataInterval);
        };
    }, []);

    const openRingModal = (bellId, bellName) => {
        setRingModalState({ isOpen: true, bellId, bellName });
    };

    const handleConfirmRing = async (notes) => {
        setIsManualRinging(true);
        try {
            await api.post('/bell/ring', { bell_id: ringModalState.bellId, notes });
            alert('Bell triggered successfully!');
            fetchData();
        } catch (error) {
            alert('Failed to trigger bell.');
        } finally {
            setIsManualRinging(false);
            setRingModalState({ isOpen: false, bellId: null, bellName: '' });
        }
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Time"
                    value={currentTime.toLocaleTimeString('en-US', { hour12: false })}
                    subtitle={currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                    icon={Clock}
                    colorClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                    title="Next Bell"
                    value={nextBell ? nextBell.time : "None"}
                    subtitle={nextBell ? `${nextBell.bell_name} (in ${nextBell.time_remaining})` : "No upcoming schedule"}
                    icon={BellRing}
                    colorClass="bg-orange-50 text-orange-600"
                />

                <StatCard
                    title="Today's Schedules"
                    value={todaySchedules.length}
                    subtitle="Bells scheduled for today"
                    icon={CalendarDays}
                    colorClass="bg-green-50 text-green-600"
                />

                <StatCard
                    title="System Status"
                    value="Active"
                    subtitle="Scheduler running automatically"
                    icon={Activity}
                    colorClass="bg-purple-50 text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
                    </div>
                    <div className="p-0">
                        {todaySchedules.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">No schedules for today.</div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {todaySchedules.map((schedule) => (
                                    <li key={schedule.id} className="p-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg">
                                                {schedule.time.substring(0, 5)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{schedule.bell?.name || 'Unknown Bell'}</p>
                                                <p className="text-xs text-gray-500">{schedule.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openRingModal(schedule.bell_id, schedule.bell?.name)}
                                            className="p-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors tooltip"
                                            title="Trigger manually"
                                        >
                                            <Play size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent Logs panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Recent Activity Logs</h3>
                    </div>
                    <div className="p-0">
                        {recentLogs.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">No recent activity.</div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {recentLogs.map((log) => (
                                    <li key={log.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-sm border-b border-gray-100 pb-1 mb-1 font-medium text-gray-900 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {log.bell?.name || 'Unknown'} Triggered
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Mode: {log.schedule_id ? 'Automatic (Scheduled)' : 'Manual (Admin)'}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-gray-500">
                                                {new Date(log.triggered_at).toLocaleTimeString('id-ID')}
                                                <div className="mt-1">{new Date(log.triggered_at).toLocaleDateString('id-ID')}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <ManualRingModal
                isOpen={ringModalState.isOpen}
                onClose={() => setRingModalState({ isOpen: false, bellId: null, bellName: '' })}
                onConfirm={handleConfirmRing}
                bellName={ringModalState.bellName}
                isRinging={isManualRinging}
            />
        </div>
    );
};

export default Dashboard;
