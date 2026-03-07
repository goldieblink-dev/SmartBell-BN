import React, { useState, useEffect } from 'react';
import { Play, X, Loader2 } from 'lucide-react';

const ManualRingModal = ({ isOpen, onClose, onConfirm, bellName, isRinging }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Play className="text-primary-600" size={24} />
                        Manual Trigger
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6 text-sm">
                    Anda akan menyembunyikan bel: <strong className="text-gray-900 font-bold">{bellName || 'Unknown Bell'}</strong> secara manual di luar jadwal.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                        placeholder="Contoh: Pulang lebih awal karena rapat guru..."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
                        disabled={isRinging}
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onConfirm(notes)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center justify-center min-w-[120px] transition-colors text-sm"
                        disabled={isRinging}
                    >
                        {isRinging ? <Loader2 className="animate-spin" size={18} /> : 'Bunyikan Sekarang'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualRingModal;
