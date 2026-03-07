import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BellRing, LayoutDashboard, CalendarDays, CalendarOff, Settings as SettingsIcon, Activity, LogOut, Menu, X, Volume2 } from 'lucide-react';
import api from '../../services/api';

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`
            }
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </NavLink>
    );
};

const Layout = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const navigate = useNavigate();

    // References for audio playback
    const audioRef = useRef(null);
    const lastPlayedId = useRef(null);

    // Audio polling logic (every 5 seconds)
    useEffect(() => {
        const pollAudio = async () => {
            try {
                // Fetch latest trigger and settings concurrently
                const [triggerRes, settingsRes] = await Promise.all([
                    api.get('/bell/latest-trigger'),
                    api.get('/settings')
                ]);

                const masterVolume = settingsRes.data?.master_volume || 1.0;

                if (triggerRes.data && triggerRes.data.id !== lastPlayedId.current) {
                    // New unseen trigger!
                    lastPlayedId.current = triggerRes.data.id;
                    const soundFile = triggerRes.data.bell?.sound_file;

                    if (soundFile && audioRef.current) {
                        setCurrentlyPlaying(triggerRes.data.bell?.name);
                        audioRef.current.src = `http://localhost:8000/storage/${soundFile}`;
                        audioRef.current.volume = masterVolume;

                        // Attempt to play (browsers require user interaction first, but admin panels usually have it)
                        audioRef.current.play().catch(e => console.error("Auto-play prevented", e));
                    }
                }
            } catch (error) {
                // Ignore silent poll errors
            }
        };

        const audioTimer = setInterval(pollAudio, 5000);
        return () => clearInterval(audioTimer);
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to logout?\n\nThe automated bell will STOP ringing if this browser tab is closed or logged out!')) return;
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('smartbell_token');
            navigate('/login');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: CalendarDays, label: 'Bell Schedule', to: '/schedules' },
        { icon: CalendarOff, label: 'Holidays', to: '/holidays' },
        { icon: BellRing, label: 'Bell Types', to: '/bells' },
        { icon: Activity, label: 'Bell Logs', to: '/logs' },
        { icon: SettingsIcon, label: 'Settings', to: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
                    <BellRing size={24} /> SmartBell
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none" title="Logout">
                        <LogOut size={24} />
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 z-10 transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 h-screen overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 hidden md:flex items-center gap-3 text-primary-600 mb-6 border-b border-gray-100 pb-6">
                    <div className="bg-primary-50 p-2 rounded-xl">
                        <BellRing size={28} className="text-primary-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl leading-none">SmartBell</h1>
                        <p className="text-xs text-gray-500 mt-1">SMK Bakti Nusantara</p>
                    </div>
                </div>

                <div className="p-4 md:pt-0 flex flex-col h-full">
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-gray-100 pt-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                            <LogOut size={20} />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 hidden md:flex items-center justify-between shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200" title="This browser tab is actively listening for bells">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                            </span>
                            Audio System Online
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end border-r border-gray-200 pr-6">
                            <span className="text-sm font-medium text-gray-800">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
                        >
                            <LogOut size={20} />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                    {currentlyPlaying && (
                        <div className="mb-6 bg-primary-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <Volume2 size={24} className="animate-bounce" />
                                <div>
                                    <p className="font-bold">Now Playing...</p>
                                    <p className="text-sm opacity-90">{currentlyPlaying}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                            </div>
                        </div>
                    )}

                    <Outlet />
                </div>

                {/* Hidden Global Audio Player */}
                <audio
                    ref={audioRef}
                    onEnded={() => setCurrentlyPlaying(null)}
                    onError={() => setCurrentlyPlaying(null)}
                />
            </main>
        </div>
    );
};

export default Layout;
