// ud_amanah_frontend/src/components/pendapatan/PendapatanForm.jsx

import React, { useState, useEffect } from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';

const PendapatanForm = ({ initialData, onSave, onCancel, isEditing }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [nominal, setNominal] = useState('');

    useEffect(() => {
        if (initialData) {
            // Mode edit
            setDescription(initialData.description || '');
            setDate(initialData.date || new Date().toISOString().split('T')[0]);
            setNominal(initialData.nominal || '');
        } else {
            // Mode tambah baru
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setNominal('');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const dataToSave = {
            description,
            date,
            nominal: parseFloat(nominal),
            ...(initialData && { _id: initialData._id }) // Sertakan ID jika edit
        };
        
        onSave(dataToSave, isEditing);
        
        // Reset form jika mode CREATE
        if (!isEditing) {
            setDescription('');
            setNominal('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', padding: '15px', backgroundColor: isEditing ? '#fffbe6' : '#f9f9f9', borderRadius: '6px' }}>
            
            <div style={{ flex: 2, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Deskripsi Pendapatan</label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Contoh: Penjualan Produk A" 
                    required 
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tanggal</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                    // FIX: Perbaikan style untuk tampilan yang profesional
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nominal (Rp)</label>
                <input 
                    type="number" 
                    value={nominal} 
                    onChange={(e) => setNominal(e.target.value)} 
                    placeholder="Contoh: 500000" 
                    required 
                    min="0"
                    style={{ width: '100%' }}
                />
            </div>
            
            <button 
                type="submit" 
                style={{ padding: '10px 20px', backgroundColor: isEditing ? ACCENT_COLOR : PRIMARY_COLOR, color: isEditing ? PRIMARY_COLOR : 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
            >
                {isEditing ? 'UPDATE' : 'SIMPAN'}
            </button>
            
            {isEditing && (
                <button 
                    type="button" 
                    onClick={onCancel} 
                    style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    Batal
                </button>
            )}
        </form>
    );
};

export default PendapatanForm;