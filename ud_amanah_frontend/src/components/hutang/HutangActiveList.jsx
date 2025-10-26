// ud_amanah_frontend/src/components/hutang/HutangActiveList.jsx

import React from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545';

const HutangActiveList = ({ hutangList, formatRupiah, onCicil, onEdit }) => {
    if (hutangList.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', color: PRIMARY_COLOR }}>Tidak ada hutang aktif saat ini.</p>;
    }

    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID');
    const getDaysDifference = (start, end) => {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {hutangList.map(hutang => {
                const totalDays = getDaysDifference(new Date(hutang.start_date), new Date(hutang.due_date));
                const daysRemaining = getDaysDifference(new Date(), new Date(hutang.due_date));
                const daysPassed = totalDays - daysRemaining;
                const recCicil = hutang.nominal_awal / totalDays;

                return (
                    <div key={hutang._id} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${DANGER_COLOR}`, backgroundColor: '#fff', boxShadow: 'var(--shadow-base)' }}>
                        <h4 style={{ color: DANGER_COLOR, margin: '0 0 5px 0' }}>{hutang.transaction_number}</h4>
                        <p style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: '#666' }}>Supplier: <span style={{ fontWeight: '600' }}>{hutang.supplier_name}</span></p>

                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '0', fontSize: '1.5em', fontWeight: '700', color: DANGER_COLOR }}>
                                {formatRupiah(hutang.sisa_hutang)}
                            </p>
                            <small style={{ color: '#aaa' }}>Sisa Hutang dari {formatRupiah(hutang.nominal_awal)}</small>
                        </div>
                        
                        <div style={{ fontSize: '0.9em', marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <p style={{ margin: '0' }}>Awal: {formatDate(hutang.start_date)} | Jatuh Tempo: {formatDate(hutang.due_date)}</p>
                            <p style={{ margin: '5px 0 0' }}>Sisa Hari: <span style={{ fontWeight: '700', color: daysRemaining < 7 ? DANGER_COLOR : PRIMARY_COLOR }}>{daysRemaining} hari</span></p>
                            <p style={{ margin: '5px 0 0', fontWeight: '700' }}>Rekomendasi Cicilan/Hari: {formatRupiah(recCicil)}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button 
                                onClick={() => onCicil(hutang)} 
                                style={{ flex: 1, padding: '8px', backgroundColor: ACCENT_COLOR, color: PRIMARY_COLOR, border: 'none', borderRadius: '4px', fontWeight: '600' }}
                            >
                                Cicil Hutang
                            </button>
                            <button 
                                onClick={() => onEdit(hutang)} 
                                style={{ width: '80px', padding: '8px', backgroundColor: '#e9ecef', color: '#6c757d', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HutangActiveList;