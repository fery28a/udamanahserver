// ud_amanah_frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// HAPUS SEMUA IMPORTS CHART.JS

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5027/api' : '/api';
const API_URL = `${API_BASE_URL}/dashboard`;
const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545';
const SUCCESS_COLOR = '#28a745';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setData(response.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(`Gagal memuat data: ${err.response?.data?.message || 'Kesalahan Jaringan'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Memuat Dashboard Keuangan...</div>;
    if (error || !data) return <div style={{ padding: '30px', color: DANGER_COLOR }}>Error: {error || 'Data kosong.'}</div>;
    
    // --- Utility Component ---
    const SummaryCard = ({ title, value, color }) => (
        <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${color}`, minWidth: '250px' }}>
            <h4 style={{ margin: 0, color: '#666', fontWeight: '400' }}>{title}</h4>
            <p style={{ fontSize: '1.8em', fontWeight: '700', margin: '5px 0 0', color: color }}>{value}</p>
        </div>
    );
    
    return (
        <div style={{ padding: '25px', backgroundColor: 'var(--background-light)' }}>
           

            {/* BARIS 1: SALDO UTAMA */}
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '30px' }}>
                <SummaryCard 
                    title="Saldo Pendapatan Pokok" 
                    value={formatRupiah(data.pendapatanSaldo.pokok)} 
                    color={PRIMARY_COLOR} 
                />
                <SummaryCard 
                    title="Saldo Pendapatan Laba" 
                    value={formatRupiah(data.pendapatanSaldo.laba)} 
                    color={ACCENT_COLOR} 
                />
            </div>
            
            {/* BARIS 2: TABEL SALDO TABUNGAN (Full Width) */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)' }}>
                    <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Saldo Semua Akun Tabungan</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9em' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9f9f9' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Akun</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.tabunganList.length > 0 ? data.tabunganList.map(t => (
                                <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{t.nama}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: SUCCESS_COLOR }}>{formatRupiah(t.saldo)}</td>
                                </tr>
                            )) : <tr><td colSpan="2" style={{ padding: '8px', textAlign: 'center' }}>Tidak ada saldo tabungan aktif.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BARIS 3: PERINGATAN (HUTANG & PIUTANG) */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '30px' }}>
                
                {/* PERINGATAN HUTANG JATUH TEMPO */}
                <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', border: `1px solid ${ACCENT_COLOR}` }}>
                    <h3 style={{ color: ACCENT_COLOR, borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '10px' }}>
                        ⚠️ Hutang Mendekati Jatuh Tempo
                    </h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {data.expiringHutang.length > 0 ? data.expiringHutang.map(h => (
                            <li key={h._id} style={{ borderBottom: '1px dotted #eee', padding: '8px 0', fontSize: '0.95em' }}>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(h.sisa_hutang)}</span> ke {h.supplier_name} (Tempo: {formatDate(h.due_date)})
                            </li>
                        )) : <li style={{ color: '#666' }}>Tidak ada hutang mendekati jatuh tempo dalam 30 hari.</li>}
                    </ul>
                </div>

                {/* PERINGATAN PIUTANG JATUH TEMPO */}
                <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', border: `1px solid ${DANGER_COLOR}` }}>
                    <h3 style={{ color: DANGER_COLOR, borderBottom: `2px solid ${DANGER_COLOR}`, paddingBottom: '10px' }}>
                        🚨 Piutang Jatuh Tempo (Overdue)
                    </h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {data.overduePiutang.length > 0 ? data.overduePiutang.map(p => (
                            <li key={p._id} style={{ borderBottom: '1px dotted #eee', padding: '8px 0', fontSize: '0.95em' }}>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(p.nominal)}</span> dari {p.customer_name} (Terlambat: **{p.days_overdue} hari**)
                            </li>
                        )) : <li style={{ color: '#666' }}>Tidak ada piutang yang jatuh tempo.</li>}
                    </ul>
                </div>
            </div>

            {/* BARIS 4: KAS KELUAR TERBARU */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)' }}>
                <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>List Kas Keluar Terbaru (5 Transaksi)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9em' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tanggal</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Deskripsi</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Sumber Dana</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.latestKasKeluar.map(k => (
                            <tr key={k._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>{formatDate(k.date)}</td>
                                <td style={{ padding: '8px' }}>{k.description}</td>
                                <td style={{ padding: '8px' }}>
                                    {k.source_of_fund === 'tabungan' ? `Tabungan: ${k.tabungan_id?.nama || 'N/A'}` : `Pendapatan ${k.source_of_fund.toUpperCase()}`}
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: DANGER_COLOR }}>{formatRupiah(k.nominal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Dashboard;