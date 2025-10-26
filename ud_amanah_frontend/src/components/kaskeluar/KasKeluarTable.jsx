// ud_amanah_frontend/src/components/kaskeluar/KasKeluarTable.jsx

import React from 'react';

const KasKeluarTable = ({ transactions, onEdit, onDelete, formatRupiah, tabunganList }) => {
    if (!transactions || transactions.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Tidak ada transaksi kas keluar di periode ini.</p>;
    }

    const PRIMARY_COLOR = 'var(--primary-color)';
    const ACCENT_COLOR = 'var(--accent-color)';
    const DANGER_COLOR = '#dc3545';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    // Fungsi untuk mendapatkan nama Tabungan dari ID
    const getTabunganName = (id) => {
        const tabungan = tabunganList.find(t => t._id === id);
        return tabungan ? tabungan.nama : 'Tabungan (ID Lama)';
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: DANGER_COLOR, color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left', width: '10%' }}>Tanggal</th>
                        <th style={{ padding: '12px', textAlign: 'left', width: '15%' }}>Sumber Dana</th>
                        <th style={{ padding: '12px', textAlign: 'left', width: '40%' }}>Deskripsi</th>
                        <th style={{ padding: '12px', textAlign: 'right', width: '15%' }}>Nominal</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '10%' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => {
                        const isTabungan = tx.source_of_fund === 'tabungan';
                        const sourceName = isTabungan 
                            ? getTabunganName(tx.tabungan_id)
                            : `Pendapatan ${tx.source_of_fund.charAt(0).toUpperCase() + tx.source_of_fund.slice(1)}`;

                        return (
                            <tr key={tx._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{formatDate(tx.date)}</td>
                                <td style={{ padding: '10px', fontWeight: '600', color: isTabungan ? PRIMARY_COLOR : DANGER_COLOR }}>
                                    {sourceName}
                                </td>
                                <td style={{ padding: '10px' }}>{tx.description}</td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: DANGER_COLOR }}>
                                    {formatRupiah(tx.nominal)}
                                </td>
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
                                            style={{ backgroundColor: DANGER_COLOR, color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', fontWeight: '600' }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default KasKeluarTable;