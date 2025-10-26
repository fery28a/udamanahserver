// ud_amanah_frontend/src/components/piutang/PiutangActiveList.jsx

import React from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const SUCCESS_COLOR = '#28a745';
const DANGER_COLOR = '#dc3545'; // Untuk overdue

const PiutangActiveList = ({ piutangList, formatRupiah, onSettle, onEdit }) => {
    if (piutangList.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', color: PRIMARY_COLOR }}>Tidak ada piutang aktif saat ini.</p>;
    }

    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {piutangList.map(piutang => {
                const dueDate = new Date(piutang.due_date);
                const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const isOverdue = daysRemaining < 0;

                return (
                    <div key={piutang._id} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${SUCCESS_COLOR}`, backgroundColor: '#fff', boxShadow: 'var(--shadow-base)' }}>
                        <h4 style={{ color: PRIMARY_COLOR, margin: '0 0 5px 0' }}>{piutang.transaction_number}</h4>
                        <p style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: '#666' }}>Customer: <span style={{ fontWeight: '600' }}>{piutang.customer_name}</span></p>

                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '0', fontSize: '1.5em', fontWeight: '700', color: SUCCESS_COLOR }}>
                                {formatRupiah(piutang.nominal)}
                            </p>
                            <small style={{ color: '#aaa' }}>Nominal Piutang</small>
                        </div>
                        
                        <div style={{ fontSize: '0.9em', marginBottom: '15px', padding: '10px', backgroundColor: '#f3fff3', borderRadius: '4px', borderLeft: isOverdue ? `3px solid ${DANGER_COLOR}` : `3px solid ${PRIMARY_COLOR}` }}>
                            <p style={{ margin: '0' }}>Awal: {formatDate(piutang.start_date)}</p>
                            <p style={{ margin: '5px 0 0' }}>Jatuh Tempo: <span style={{ fontWeight: '700', color: isOverdue ? DANGER_COLOR : PRIMARY_COLOR }}>{formatDate(piutang.due_date)}</span></p>
                            <p style={{ margin: '5px 0 0', fontWeight: '700', color: isOverdue ? DANGER_COLOR : PRIMARY_COLOR }}>
                                {isOverdue ? `Terlambat ${Math.abs(daysRemaining)} hari` : `Sisa ${daysRemaining} hari`}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button 
                                onClick={() => onSettle(piutang._id)} 
                                style={{ flex: 1, padding: '8px', backgroundColor: SUCCESS_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                            >
                                Tandai Lunas
                            </button>
                            <button 
                                onClick={() => onEdit(piutang)} 
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

export default PiutangActiveList;