// ud_amanah_frontend/src/components/hutang/HutangPaymentForm.jsx

import React, { useState } from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545';

const HutangPaymentForm = ({ onPayment, hutangToPay, tabunganOptions, pendapatanSaldo, onCancel }) => {
    const [sourceFund, setSourceFund] = useState('pokok');
    const [tabunganId, setTabunganId] = useState(tabunganOptions[0]?.id || '');
    const [nominal, setNominal] = useState('');
    
    const isTabunganSelected = sourceFund === 'tabungan';
    const sisaHutang = hutangToPay.sisa_hutang;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const nominalValue = parseFloat(nominal);
        
        // 1. Cek Nominal vs Sisa Hutang
        if (nominalValue > sisaHutang) {
            alert(`Nominal cicilan melebihi sisa hutang (${sisaHutang.toLocaleString('id-ID')}).`);
            return;
        }

        // 2. Cek Saldo Sumber Dana
        let saldoTersedia = 0;
        if (sourceFund === 'pokok') saldoTersedia = pendapatanSaldo.pokok;
        else if (sourceFund === 'laba') saldoTersedia = pendapatanSaldo.laba;
        else if (isTabunganSelected) {
             const selectedTabungan = tabunganOptions.find(t => t.id === tabunganId);
             saldoTersedia = selectedTabungan?.saldo || 0;
        }

        if (nominalValue > saldoTersedia) {
            alert(`Saldo ${sourceFund.toUpperCase()} tidak cukup. Saldo tersedia: ${saldoTersedia.toLocaleString('id-ID')}`);
            return;
        }
        
        onPayment({
            nominal: nominalValue,
            transaction_number: hutangToPay.transaction_number,
            source_fund: sourceFund,
            tabungan_id: isTabunganSelected ? tabunganId : undefined,
            // Field lain akan diisi di controller
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '15px', border: `1px dashed ${DANGER_COLOR}`, borderRadius: '6px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>Sisa yang Harus Dibayar: <span style={{ color: DANGER_COLOR }}>{sisaHutang.toLocaleString('id-ID')}</span></p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sumber Dana</label>
                    <select 
                        value={sourceFund} 
                        onChange={(e) => {setSourceFund(e.target.value); setTabunganId(isTabunganSelected ? tabunganOptions[0]?.id : '');}} 
                        required 
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        <option value="pokok">Pokok (Saldo: {pendapatanSaldo.pokok.toLocaleString('id-ID')})</option>
                        <option value="laba">Laba (Saldo: {pendapatanSaldo.laba.toLocaleString('id-ID')})</option>
                        {tabunganOptions.length > 0 && <option value="tabungan">Saldo Tabungan</option>}
                    </select>
                </div>
                
                {isTabunganSelected && tabunganOptions.length > 0 && (
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Pilih Akun Tabungan</label>
                        <select 
                            value={tabunganId} 
                            onChange={(e) => setTabunganId(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            {tabunganOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name} (Saldo: {opt.saldo.toLocaleString('id-ID')})</option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nominal Cicilan</label>
                    <input 
                        type="number" 
                        value={nominal} 
                        onChange={(e) => setNominal(e.target.value)} 
                        required 
                        min="1"
                        max={sisaHutang}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                
                <button 
                    type="submit" 
                    style={{ padding: '10px 20px', backgroundColor: DANGER_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    BAYAR CICILAN
                </button>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    Batal
                </button>
            </div>
        </form>
    );
};

export default HutangPaymentForm;