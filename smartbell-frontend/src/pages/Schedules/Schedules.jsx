import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Play } from 'lucide-react';
import api from '../../services/api';
import ManualRingModal from '../../components/ManualRingModal';

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [bells, setBells] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('regular');
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({ day_of_week: 'Monday', type: 'regular', time: '07:00', bell_id: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [ringModalState, setRingModalState] = useState({ isOpen: false, bellId: null, bellName: '' });
    const [isManualRinging, setIsManualRinging] = useState(false);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [schedRes, bellRes] = await Promise.all([
                api.get('/schedules'),
                api.get('/bells')
            ]);
            setSchedules(schedRes.data);
            setBells(bellRes.data);
            if (bellRes.data.length > 0) {
                setFormData(prev => ({ ...prev, bell_id: bellRes.data[0].id }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (schedule = null) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                day_of_week: schedule.day_of_week,
                type: schedule.type,
                time: schedule.time.substring(0, 5), // Format HH:mm
                bell_id: schedule.bell_id,
                description: schedule.description || ''
            });
        } else {
            setEditingSchedule(null);
            setFormData({
                day_of_week: 'Monday',
                type: activeTab, // default to currently viewed tab
                time: '07:00',
                bell_id: bells.length > 0 ? bells[0].id : '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingSchedule) {
                await api.put(`/schedules/${editingSchedule.id}`, formData);
            } else {
                await api.post('/schedules', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Failed to save schedule');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.delete(`/schedules/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete schedule');
        }
    };

    const openRingModal = (bellId, bellName) => {
        setRingModalState({ isOpen: true, bellId, bellName });
    };

    const handleConfirmRing = async (notes) => {
        setIsManualRinging(true);
        try {
            await api.post('/bell/ring', { bell_id: ringModalState.bellId, notes });
            alert('Bell triggered!');
        } catch (error) {
            alert('Failed to trigger');
        } finally {
            setIsManualRinging(false);
            setRingModalState({ isOpen: false, bellId: null, bellName: '' });
        }
    };

    // Group schedules by day for better reading (Filter by active tab first)
    const groupedSchedules = DAYS.reduce((acc, day) => {
        acc[day] = schedules.filter(s => s.day_of_week === day && s.type === activeTab);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Bell Schedules</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} /> Add Schedule
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('regular')}
                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'regular' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Regular Schedule
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'exam' ? 'text-amber-600 border-amber-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Exam Schedule
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
            ) : schedules.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    No schedules found. Click "Add Schedule" to create one.
                </div>
            ) : (
                <div className="space-y-6">
                    {DAYS.map(day => (
                        groupedSchedules[day].length > 0 && (
                            <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
                                    <h3 className="font-bold text-gray-700">{day}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            {groupedSchedules[day].map(schedule => (
                                                <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 w-32">
                                                        <span className="font-bold text-lg text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                                            {schedule.time.substring(0, 5)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900">{schedule.description || 'Unnamed Event'}</p>
                                                        <p className="text-sm text-gray-500">Audio: {schedule.bell?.name || 'Unknown'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2 w-48">
                                                        <button onClick={() => openRingModal(schedule.bell_id, schedule.bell?.name)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg" title="Ring Now">
                                                            <Play size={18} />
                                                        </button>
                                                        <button onClick={() => handleOpenModal(schedule)} className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(schedule.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Ring Modal */}
            <ManualRingModal
                isOpen={ringModalState.isOpen}
                onClose={() => setRingModalState({ isOpen: false, bellId: null, bellName: '' })}
                onConfirm={handleConfirmRing}
                bellName={ringModalState.bellName}
                isRinging={isManualRinging}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editingSchedule ? 'Edit' : 'Add'} Schedule</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'regular' })} className={`flex-1 py-1 text-sm font-medium rounded-lg transition-colors ${formData.type === 'regular' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>Regular</button>
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'exam' })} className={`flex-1 py-1 text-sm font-medium rounded-lg transition-colors ${formData.type === 'exam' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>Exam</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                <select required className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white" value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })}>
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input required type="time" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bell Type</label>
                                <select required className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white" value={formData.bell_id} onChange={e => setFormData({ ...formData, bell_id: e.target.value })}>
                                    <option value="" disabled>Select a bell...</option>
                                    {bells.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Masuk Kelas, Sholat Dhuha" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center justify-center min-w-[100px]">
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedules;
