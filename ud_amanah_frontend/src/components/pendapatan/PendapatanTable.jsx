// ud_amanah_frontend/src/components/pendapatan/PendapatanTable.jsx

import React from 'react';

const PendapatanTable = ({ transactions, onEdit, onDelete, formatRupiah }) => {
    if (!transactions || transactions.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Tidak ada transaksi pendapatan di periode ini.</p>;
    }

    const PRIMARY_COLOR = 'var(--primary-color)';
    const ACCENT_COLOR = 'var(--accent-color)';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left', width: '15%' }}>Tanggal</th>
                        <th style={{ padding: '12px', textAlign: 'left', width: '15%' }}>Tipe</th>
                        <th style={{ padding: '12px', textAlign: 'left', width: '45%' }}>Deskripsi</th>
                        <th style={{ padding: '12px', textAlign: 'right', width: '15%' }}>Nominal</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '10%' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx._id} style={{ borderBottom: '1px solid #eee', backgroundColor: tx.type === 'laba' ? '#fff9e6' : 'white' }}>
                            <td style={{ padding: '10px' }}>{formatDate(tx.date)}</td>
                            <td style={{ padding: '10px', fontWeight: '600', color: tx.type === 'laba' ? ACCENT_COLOR : PRIMARY_COLOR }}>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                            </td>
                            <td style={{ padding: '10px' }}>{tx.description}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(tx.nominal)}</td>
                            
                            {/* FIX: Tombol berdampingan dengan container flex */}
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}> 
                                    <button 
                                        onClick={() => onEdit(tx)} 
                                        style={{ backgroundColor: ACCENT_COLOR, color: PRIMARY_COLOR, border: 'none', padding: '6px 10px', borderRadius: '3px', fontWeight: '600' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onDelete(tx._id)} 
                                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', fontWeight: '600' }}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PendapatanTable;