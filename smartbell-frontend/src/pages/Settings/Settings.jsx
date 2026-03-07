import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Settings = () => {
    const [settings, setSettings] = useState({ active_mode: 'regular', master_volume: '1.0', is_muted: false });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRes = await api.get('/settings');
                setSettings(settingsRes.data);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            await api.post('/settings', { settings });
            alert('Settings saved globally!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Global Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 text-primary-600">
                        <SettingsIcon size={24} />
                        <h2 className="text-lg font-bold text-gray-800">Global Settings</h2>
                    </div>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Active Schedule Mode</label>
                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                <button type="button" onClick={() => setSettings({ ...settings, active_mode: 'regular' })} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${settings.active_mode === 'regular' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>Regular Mode</button>
                                <button type="button" onClick={() => setSettings({ ...settings, active_mode: 'exam' })} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${settings.active_mode === 'exam' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>Exam Mode</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Exam mode will only trigger schedules saved as 'Exam'.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Master Browser Volume ({Math.round(settings.master_volume * 100)}%)</label>
                            <input type="range" min="0" max="1" step="0.1" value={settings.master_volume} onChange={(e) => setSettings({ ...settings, master_volume: e.target.value })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-red-600 mb-2 mt-2">Emergency Kill-Switch</label>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, is_muted: !settings.is_muted })}
                                className={`w-full py-4 text-sm font-bold rounded-xl transition-colors border-2 ${settings.is_muted ? 'bg-red-600 text-white border-red-700 shadow-md animate-pulse' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                            >
                                {settings.is_muted ? 'SYSTEM IS MUTED - UNMUTE' : 'MUTE SYSTEM TODAY'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">If muted, schedules will completely ignore triggers until you unmute it.</p>
                        </div>
                        <button type="submit" disabled={isSavingSettings} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                            {isSavingSettings ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save System Settings</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Settings;
