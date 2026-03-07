import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Play } from 'lucide-react';
import api from '../../services/api';

const BellTypes = () => {
    const [bells, setBells] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBell, setEditingBell] = useState(null);
    const [formData, setFormData] = useState({ name: '', sound_file: null, duration: 10 });
    const [isSaving, setIsSaving] = useState(false);

    const fetchBells = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/bells');
            setBells(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBells();
    }, []);

    const handleOpenModal = (bell = null) => {
        if (bell) {
            setEditingBell(bell);
            setFormData({ name: bell.name, sound_file: null, duration: bell.duration });
        } else {
            setEditingBell(null);
            setFormData({ name: '', sound_file: null, duration: 10 });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!editingBell && !formData.sound_file) {
            alert('Please select an audio file.');
            return;
        }

        if (formData.sound_file && formData.sound_file.size > 5 * 1024 * 1024) {
            alert('File size exceeds the 5MB limit. Please choose a smaller audio file.');
            return;
        }

        setIsSaving(true);
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('duration', formData.duration);
        if (formData.sound_file) {
            submitData.append('sound_file', formData.sound_file);
        }

        try {
            if (editingBell) {
                // Laravel uses _method=PUT with POST for FormData
                submitData.append('_method', 'PUT');
                await api.post(`/bells/${editingBell.id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/bells', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchBells();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save bell type');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this bell type? Schedules using it will be deleted!')) return;
        try {
            await api.delete(`/bells/${id}`);
            fetchBells();
        } catch (error) {
            alert('Failed to delete bell type');
        }
    };

    const handleManualRing = async (id) => {
        if (!confirm('Ring this bell manually now?')) return;
        try {
            await api.post('/bell/ring', { bell_id: id });
            alert('Bell triggered!');
        } catch (error) {
            alert('Failed to trigger');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Bell Types Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} /> Add Bell
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
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Bell Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Sound File</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Duration (sec)</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bells.map(bell => (
                                    <tr key={bell.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{bell.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {bell.sound_file ? (
                                                <audio controls controlsList="nodownload noplaybackrate" className="h-8 max-w-[200px]">
                                                    <source src={`http://localhost:8000/storage/${bell.sound_file}`} />
                                                    Your browser does not support audio.
                                                </audio>
                                            ) : (
                                                <span className="text-red-400">Missing File</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{bell.duration}s</td>
                                        <td className="px-6 py-4 text-sm text-right space-x-2">
                                            <button
                                                onClick={() => handleManualRing(bell.id)}
                                                className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                                title="Manual Ring"
                                            >
                                                <Play size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(bell)}
                                                className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bell.id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bells.length === 0 && <div className="p-8 text-center text-gray-500">No bell types found. Add your first bell type.</div>}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editingBell ? 'Edit' : 'Add'} Bell Type</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bell Name</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. School Start" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Sound File (Max 5MB, .mp3 or .wav)</label>
                                <input
                                    required={!editingBell} // Required only when creating
                                    type="file"
                                    accept="audio/mpeg, audio/wav"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    onChange={e => setFormData({ ...formData, sound_file: e.target.files[0] })}
                                />
                                {editingBell && !formData.sound_file && (
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep current file.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                                <input required type="number" min="1" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} />
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

export default BellTypes;
