// ud_amanah_frontend/src/pages/Tabungan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TabunganDepositForm from '../components/tabungan/TabunganDepositForm'; // Akan dibuat

// --- PERUBAHAN: Import dari config/api ---
import { TABUNGAN_URL, getTabunganDashboardUrl } from '../config/api';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';

const Tabungan = () => {
    const [pendapatanSaldo, setPendapatanSaldo] = useState({ pokok: 0, laba: 0 });
    const [tabunganList, setTabunganList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    // --- Fetch Dashboard Data ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Menggunakan getTabunganDashboardUrl()
            const response = await axios.get(getTabunganDashboardUrl());
            setPendapatanSaldo(response.data.pendapatanSaldo);
            setTabunganList(response.data.tabunganList);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat dashboard Tabungan. Cek koneksi backend.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []); 

    // --- Deposit Handler ---
    const handleDeposit = async (data) => {
        try {
            // Data dikirim ke endpoint deposit menggunakan TABUNGAN_URL
            await axios.post(`${TABUNGAN_URL}/deposit`, data);
            alert(`Deposit sebesar ${formatRupiah(data.nominal)} berhasil.`);
            fetchData(); // Refresh data setelah deposit
        } catch (err) {
            alert(`Deposit gagal: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div style={{ padding: '25px', textAlign: 'center' }}>Memuat data Tabungan...</div>;
    if (error) return <div style={{ padding: '25px', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '25px' }}>
            

            {/* Kotak Informasi Saldo Pokok dan Laba (Diambil dari Pendapatan) */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', marginTop: '20px' }}>
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${PRIMARY_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>Saldo Pokok Tersedia</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: PRIMARY_COLOR }}>{formatRupiah(pendapatanSaldo.pokok)}</p>
                </div>
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${ACCENT_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>Saldo Laba Tersedia</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: ACCENT_COLOR }}>{formatRupiah(pendapatanSaldo.laba)}</p>
                </div>
            </div>

            {/* Area Input Deposit */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', marginBottom: '30px', border: `1px solid ${PRIMARY_COLOR}` }}>
                <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Transfer Saldo Ke Tabungan
                </h3>
                <TabunganDepositForm 
                    onDeposit={handleDeposit} 
                    tabunganOptions={tabunganList} 
                />
            </div>

            {/* Container Seluruh Tabungan */}
            <h2 style={{ color: PRIMARY_COLOR, borderBottom: `1px solid #ddd`, paddingBottom: '10px', fontWeight: '600', marginTop: '40px' }}>
                Daftar Akun Tabungan
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginTop: '20px' }}>
                {tabunganList.map(tabungan => (
                    <div 
                        key={tabungan._id} 
                        style={{ 
                            width: '300px', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                            backgroundColor: 'white',
                            border: `2px solid ${ACCENT_COLOR}`
                        }}
                    >
                        <h4 style={{ color: PRIMARY_COLOR, margin: '0 0 10px 0', fontSize: '1.4em' }}>
                            {tabungan.nama}
                        </h4>
                        <p style={{ margin: 0, color: '#666' }}>ID: {tabungan._id.slice(-6)}</p>
                        <p style={{ fontSize: '2em', fontWeight: '700', color: '#28a745', margin: '15px 0 0' }}>
                            {formatRupiah(tabungan.saldo)}
                        </p>
                        <small style={{ color: '#aaa' }}>Total Saldo Tabungan Aktif</small>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Tabungan;