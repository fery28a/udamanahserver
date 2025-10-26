// ud_amanah_frontend/src/components/tabungan/TabunganDepositForm.jsx

import React, { useState } from 'react';

// --- DEFINISI VARIABEL WARNA UNTUK MENGHILANGKAN REFERENCEERROR ---
const PRIMARY_COLOR = 'var(--primary-color)'; 
// -----------------------------------------------------------------

const TabunganDepositForm = ({ onDeposit, tabunganOptions }) => {
    // Set default ID ke ID tabungan pertama yang tersedia
    const [tabunganId, setTabunganId] = useState(tabunganOptions[0]?._id || '');
    const [sourceFund, setSourceFund] = useState('pokok');
    const [nominal, setNominal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!tabunganId || !nominal) {
            alert("Harap lengkapi semua kolom.");
            return;
        }

        onDeposit({
            tabungan_id: tabunganId,
            source_fund: sourceFund,
            nominal: parseFloat(nominal),
        });

        // Reset nominal setelah submit
        setNominal('');
    };

    if (tabunganOptions.length === 0) {
        return <p style={{ color: PRIMARY_COLOR }}>Harap input **Master Data Tabungan** terlebih dahulu di menu Master Data.</p>;
    }


    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tabungan Tujuan</label>
                <select 
                    value={tabunganId} 
                    onChange={(e) => setTabunganId(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    {tabunganOptions.map(opt => (
                        <option key={opt._id} value={opt._id}>{opt.nama}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Sumber Dana (Pendapatan)</label>
                <select 
                    value={sourceFund} 
                    onChange={(e) => setSourceFund(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    <option value="pokok">Pendapatan Pokok</option>
                    <option value="laba">Pendapatan Laba</option>
                </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nominal Transfer</label>
                <input 
                    type="number" 
                    value={nominal} 
                    onChange={(e) => setNominal(e.target.value)} 
                    placeholder="Contoh: 1000000" 
                    required 
                    min="1"
                    style={{ width: '100%' }}
                />
            </div>
            
            <button 
                type="submit" 
                style={{ 
                    padding: '10px 20px', 
                    backgroundColor: PRIMARY_COLOR, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontWeight: '600' 
                }}
            >
                TRANSFER
            </button>
        </form>
    );
};

export default TabunganDepositForm;