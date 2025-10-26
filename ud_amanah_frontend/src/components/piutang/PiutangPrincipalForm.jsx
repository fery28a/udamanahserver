// ud_amanah_frontend/src/components/piutang/PiutangPrincipalForm.jsx

import React, { useState, useEffect } from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const SUCCESS_COLOR = '#28a745';

const PiutangPrincipalForm = ({ onSave, customers, initialData, onCancel }) => {
    const [customerId, setCustomerId] = useState(initialData?.customer_id || customers[0]?._id || '');
    const [transactionNumber, setTransactionNumber] = useState(initialData?.transaction_number || '');
    const [startDate, setStartDate] = useState(initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
    const [nominal, setNominal] = useState(initialData?.nominal || '');
    const isEditing = !!initialData;
    
    useEffect(() => {
        if (initialData) {
            setCustomerId(initialData.customer_id);
            setTransactionNumber(initialData.transaction_number);
            setStartDate(new Date(initialData.start_date).toISOString().split('T')[0]);
            setDueDate(new Date(initialData.due_date).toISOString().split('T')[0]);
            setNominal(initialData.nominal);
        }
    }, [initialData]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (new Date(startDate) > new Date(dueDate)) {
            alert("Tanggal Jatuh Tempo tidak boleh mendahului Tanggal Awal Piutang.");
            return;
        }

        const dataToSave = {
            customer_id: customerId,
            transaction_number: transactionNumber,
            nominal: parseFloat(nominal),
            start_date: startDate,
            due_date: dueDate,
            ...(isEditing && { _id: initialData._id }) 
        };
        
        onSave(dataToSave, isEditing);
    };

    if (customers.length === 0) {
        return <p style={{ color: PRIMARY_COLOR }}>Harap input **Master Data Customer** terlebih dahulu.</p>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px', backgroundColor: isEditing ? '#f3fff3' : '#f9f9f9', borderRadius: '6px' }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pilih Customer</label>
                <select 
                    value={customerId} 
                    onChange={(e) => setCustomerId(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    {customers.map(opt => (
                        <option key={opt._id} value={opt._id}>{opt.nama}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>No. Transaksi Piutang</label>
                <input 
                    type="text" 
                    value={transactionNumber} 
                    onChange={(e) => setTransactionNumber(e.target.value)} 
                    placeholder="Contoh: PJL/2025/001" 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    readOnly={isEditing} 
                />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tanggal Awal Piutang</label>
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nominal Piutang</label>
                <input 
                    type="number" 
                    value={nominal} 
                    onChange={(e) => setNominal(e.target.value)} 
                    placeholder="Contoh: 5000000" 
                    required 
                    min="1"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            
            <div style={{ alignSelf: 'flex-end' }}>
                <button 
                    type="submit" 
                    style={{ padding: '10px 20px', backgroundColor: isEditing ? PRIMARY_COLOR : SUCCESS_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    {isEditing ? 'UPDATE PIUTANG' : 'CATAT PIUTANG BARU'}
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

export default PiutangPrincipalForm;