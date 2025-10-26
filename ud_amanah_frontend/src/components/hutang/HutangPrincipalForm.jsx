// ud_amanah_frontend/src/components/hutang/HutangPrincipalForm.jsx

import React, { useState, useEffect } from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const DANGER_COLOR = '#dc3545';

const HutangPrincipalForm = ({ onSave, suppliers, initialData, onCancel }) => {
    // State untuk Form Hutang Pokok
    const [supplierId, setSupplierId] = useState(initialData?.supplier_id || suppliers[0]?._id || '');
    const [transactionNumber, setTransactionNumber] = useState(initialData?.transaction_number || '');
    const [startDate, setStartDate] = useState(initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
    const [nominal, setNominal] = useState(initialData?.nominal || '');
    const isEditing = !!initialData;
    
    // Perbarui state jika initialData berubah (saat edit)
    useEffect(() => {
        if (initialData) {
            setSupplierId(initialData.supplier_id);
            setTransactionNumber(initialData.transaction_number);
            setStartDate(new Date(initialData.start_date).toISOString().split('T')[0]);
            setDueDate(new Date(initialData.due_date).toISOString().split('T')[0]);
            setNominal(initialData.nominal);
        }
    }, [initialData]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (new Date(startDate) >= new Date(dueDate)) {
            alert("Tanggal Jatuh Tempo harus lebih besar dari Tanggal Awal Hutang.");
            return;
        }

        if (nominal <= 0) {
            alert("Nominal hutang harus lebih besar dari nol.");
            return;
        }

        const dataToSave = {
            supplier_id: supplierId,
            transaction_number: transactionNumber,
            nominal: parseFloat(nominal),
            start_date: startDate,
            due_date: dueDate,
            type: 'principal', // Tipe selalu principal saat membuat hutang baru
            ...(isEditing && { _id: initialData._id }) // Sertakan ID saat edit
        };
        
        onSave(dataToSave, isEditing);
        
        // Reset form jika mode CREATE
        if (!isEditing) {
            setTransactionNumber('');
            setNominal('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
        }
    };

    if (suppliers.length === 0) {
        return <p style={{ color: DANGER_COLOR }}>Harap input **Master Data Supplier** terlebih dahulu.</p>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px', backgroundColor: isEditing ? '#fffbe6' : '#f9f9f9', borderRadius: '6px' }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pilih Supplier</label>
                <select 
                    value={supplierId} 
                    onChange={(e) => setSupplierId(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    {suppliers.map(opt => (
                        <option key={opt._id} value={opt._id}>{opt.nama}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>No. Transaksi Hutang</label>
                <input 
                    type="text" 
                    value={transactionNumber} 
                    onChange={(e) => setTransactionNumber(e.target.value)} 
                    placeholder="Contoh: INV/2025/001" 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    readOnly={isEditing} // No. Transaksi sebaiknya tidak bisa diubah saat edit
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tanggal Awal Hutang</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tanggal Jatuh Tempo</label>
                <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nominal Hutang Awal</label>
                <input 
                    type="number" 
                    value={nominal} 
                    onChange={(e) => setNominal(e.target.value)} 
                    placeholder="Contoh: 15000000" 
                    required 
                    min="1"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            
            <div style={{ alignSelf: 'flex-end' }}>
                <button 
                    type="submit" 
                    style={{ padding: '10px 20px', backgroundColor: isEditing ? PRIMARY_COLOR : DANGER_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    {isEditing ? 'UPDATE HUTANG' : 'CATAT HUTANG BARU'}
                </button>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', marginLeft: '10px' }}
                >
                    Batal
                </button>
            </div>
        </form>
    );
};

export default HutangPrincipalForm;