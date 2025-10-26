// ud_amanah_frontend/src/components/hutang/HutangActiveList.jsx

import React from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const DANGER_COLOR = '#dc3545';
const ACCENT_COLOR = 'var(--accent-color)';
const SUCCESS_COLOR = '#28a745';

const HutangActiveList = ({ hutangList, formatRupiah, onCicil, onEdit, suppliers }) => {
    
    // FUNGSI UTILITY: Memastikan tanggal valid sebelum diformat (FIX UTAMA)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        // Memeriksa apakah tanggal valid
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString('id-ID');
    };

    // Fungsi bantu untuk mendapatkan nama supplier
    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s._id === supplierId);
        return supplier ? supplier.nama : 'N/A';
    };

    if (hutangList.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px' }}>Tidak ada Hutang Pokok yang aktif saat ini.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                <thead>
                    <tr style={{ backgroundColor: DANGER_COLOR, color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Supplier</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>No. Transaksi</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Tgl Hutang</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Jatuh Tempo</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Nominal Pokok</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Sisa Hutang</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {hutangList.map(hutang => {
                        const daysToDue = Math.ceil((new Date(hutang.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysToDue <= 30 && daysToDue > 0;
                        const isOverdue = daysToDue <= 0;
                        
                        let rowStyle = { borderBottom: '1px solid #eee' };
                        if (isOverdue) {
                            rowStyle.backgroundColor = '#ffdddd'; // Merah Muda untuk Overdue
                            rowStyle.fontWeight = 'bold';
                        } else if (isExpiring) {
                            rowStyle.backgroundColor = '#fffacd'; // Kuning Muda untuk Expiring
                        }

                        return (
                            <tr key={hutang._id} style={rowStyle}>
                                {/* Nama Supplier: Asumsi hutang.supplier_id sudah di-populate atau ID tersedia */}
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{hutang.supplier_id?.nama || getSupplierName(hutang.supplier_id) || 'N/A'}</td>
                                <td style={{ padding: '10px' }}>{hutang.transaction_number || hutang._id.slice(-6)}</td>
                                
                                {/* Tanggal Hutang (FIX: Menggunakan formatDate) */}
                                <td style={{ padding: '10px' }}>{formatDate(hutang.date)}</td>
                                
                                {/* Tanggal Jatuh Tempo (FIX: Menggunakan formatDate) */}
                                <td style={{ padding: '10px', color: isOverdue ? DANGER_COLOR : (isExpiring ? ACCENT_COLOR : '#333') }}>
                                    {formatDate(hutang.due_date)}
                                    {isOverdue && <span style={{ fontSize: '0.7em', display: 'block' }}>(Terlambat)</span>}
                                </td>
                                
                                <td style={{ padding: '10px', textAlign: 'right' }}>{formatRupiah(hutang.nominal)}</td>
                                <td style={{ padding: '10px', textAlign: 'right', color: DANGER_COLOR, fontWeight: 'bold' }}>
                                    {formatRupiah(hutang.sisa_hutang)}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', minWidth: '150px' }}>
                                    <button 
                                        onClick={() => onCicil(hutang)}
                                        style={{ padding: '6px 10px', backgroundColor: SUCCESS_COLOR, color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px' }}
                                    >
                                        Cicil
                                    </button>
                                    <button 
                                        onClick={() => onEdit(hutang)}
                                        style={{ padding: '6px 10px', backgroundColor: PRIMARY_COLOR, color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default HutangActiveList;
