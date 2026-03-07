import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import api from '../../services/api';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ date: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchHolidays = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/holidays', formData);
            setIsModalOpen(false);
            setFormData({ date: '', description: '' });
            fetchHolidays();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save holiday');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this holiday?')) return;
        try {
            await api.delete(`/holidays/${id}`);
            fetchHolidays();
        } catch (error) {
            alert('Failed to delete holiday');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">School Holidays</h1>
                    <p className="text-gray-500 text-sm mt-1">SmartBell will be muted on these dates automatically.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} /> Add Holiday
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Description</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {holidays.map(holiday => {
                                    const isPast = new Date(holiday.date) < new Date(new Date().setHours(0, 0, 0, 0));
                                    return (
                                        <tr key={holiday.id} className={`hover:bg-gray-50 transition-colors ${isPast ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <Calendar size={16} className="text-primary-500" />
                                                {new Date(holiday.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                                                {isPast && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">Passed</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{holiday.description || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-right space-x-2">
                                                <button onClick={() => handleDelete(holiday.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {holidays.length === 0 && <div className="p-8 text-center text-gray-500">No holidays set. The bell runs every day.</div>}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Add Holiday</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input required type="date" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Independence Day" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
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

export default Holidays;
