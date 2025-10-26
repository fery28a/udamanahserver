// ud_amanah_frontend/src/components/kaskeluar/KasKeluarForm.jsx

import React, { useState, useEffect } from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';

const KasKeluarForm = ({ initialData, onSave, onCancel, isEditing, tabunganOptions }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [nominal, setNominal] = useState('');
    const [sourceOfFund, setSourceOfFund] = useState('pokok'); 
    const [tabunganId, setTabunganId] = useState(''); // ID Tabungan jika sumber dana = 'tabungan'

    const isTabunganSource = sourceOfFund === 'tabungan';
    
    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description || '');
            setDate(initialData.date || new Date().toISOString().split('T')[0]);
            setNominal(initialData.nominal || '');
            setSourceOfFund(initialData.source_of_fund || 'pokok');
            setTabunganId(initialData.tabungan_id || (isTabunganSource && tabunganOptions[0]?._id) || '');
        } else {
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setNominal('');
            setSourceOfFund('pokok');
            setTabunganId('');
        }
    }, [initialData, tabunganOptions]);

    // Update Tabungan ID default jika sumber dana diubah ke Tabungan
    useEffect(() => {
        if (isTabunganSource && tabunganOptions.length > 0 && !tabunganId) {
            setTabunganId(tabunganOptions[0]._id);
        }
    }, [isTabunganSource, tabunganOptions]);


    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isTabunganSource && !tabunganId) {
            alert('Harap pilih akun Tabungan.');
            return;
        }

        const dataToSave = {
            description,
            date,
            nominal: parseFloat(nominal),
            source_of_fund: sourceOfFund, 
            tabungan_id: isTabunganSource ? tabunganId : undefined, // Hanya kirim jika sumbernya Tabungan
            ...(initialData && { _id: initialData._id }) 
        };
        
        onSave(dataToSave, isEditing);
        
        // Reset form setelah simpan
        if (!isEditing) {
            setDescription('');
            setNominal('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    };

    const formBackground = isEditing ? '#fffbe6' : '#f9f9f9';

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', padding: '15px', backgroundColor: formBackground, borderRadius: '6px' }}>
            
            <div style={{ flex: 2, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Deskripsi Pengeluaran</label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Contoh: Beli Bahan Baku" 
                    required 
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Sumber Dana</label>
                <select 
                    value={sourceOfFund} 
                    onChange={(e) => {setSourceOfFund(e.target.value); setTabunganId('');}} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    <option value="pokok">Pendapatan Pokok</option>
                    <option value="laba">Pendapatan Laba</option>
                    {tabunganOptions.length > 0 && <option value="tabungan">Akun Tabungan</option>}
                </select>
            </div>
            
            {isTabunganSource && tabunganOptions.length > 0 && (
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pilih Tabungan (Saldo Aktif)</label>
                    <select 
                        value={tabunganId} 
                        onChange={(e) => setTabunganId(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        {tabunganOptions.map(opt => (
                            <option key={opt._id} value={opt._id}>{opt.nama} ({opt.saldo.toLocaleString('id-ID')})</option>
                        ))}
                    </select>
                </div>
            )}
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tanggal</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nominal (Rp)</label>
                <input 
                    type="number" 
                    value={nominal} 
                    onChange={(e) => setNominal(e.target.value)} 
                    placeholder="Contoh: 150000" 
                    required 
                    min="1"
                    style={{ width: '100%' }}
                />
            </div>
            
            <button 
                type="submit" 
                style={{ padding: '10px 20px', backgroundColor: isEditing ? ACCENT_COLOR : PRIMARY_COLOR, color: isEditing ? PRIMARY_COLOR : 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
            >
                {isEditing ? 'UPDATE PENGELUARAN' : 'SIMPAN PENGELUARAN'}
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

export default KasKeluarForm;