// ud_amanah_frontend/src/pages/Hutang.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import komponen anak
import HutangPaymentForm from '../components/hutang/HutangPaymentForm'; 
import HutangPrincipalForm from '../components/hutang/HutangPrincipalForm'; 
import HutangSettled from '../components/hutang/HutangSettled'; 
import HutangActiveList from '../components/hutang/HutangActiveList'; 

// --- PERUBAHAN: Import dari config/api ---
import { 
    HUTANG_URL, 
    getMasterDataUrl,
    getHutangPrincipalUrl, 
    getHutangPaymentUrl,
} from '../config/api';

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545'; // Merah untuk Hutang

const Hutang = () => {
    // ===================================
    // 1. STATE MANAGEMENT
    // ===================================
    const [hutangList, setHutangList] = useState([]); // Data Aktif
    const [settledHutangList, setSettledHutangList] = useState([]); // <-- STATE BARU UNTUK DATA LUNAS
    const [pendapatanSaldo, setPendapatanSaldo] = useState({ pokok: 0, laba: 0 });
    const [tabunganSaldoMap, setTabunganSaldoMap] = useState({});
    const [tabunganMasterList, setTabunganMasterList] = useState([]);
    const [supplierMasterList, setSupplierMasterList] = useState([]);

    // UI & Error State
    const [activeTab, setActiveTab] = useState('active'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Form State
    const [isFormActive, setIsFormActive] = useState(false); 
    const [editPrincipal, setEditPrincipal] = useState(null); 
    const [payPrincipalData, setPayPrincipalData] = useState(null); 

    // Utility
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    // ===================================
    // 2. DATA FETCHING
    // ===================================
    
    // --- FUNGSI FETCH DATA AKTIF & DASHBOARD ---
    const fetchActiveData = async () => {
        try {
            // 1. Ambil data hutang dashboard (aktif)
            const hutangResponse = await axios.get(`${HUTANG_URL}/dashboard`);
            
            setPendapatanSaldo(hutangResponse.data.pendapatanSaldo);
            setTabunganSaldoMap(hutangResponse.data.tabunganSaldoMap);
            setHutangList(hutangResponse.data.hutangList);
        } catch (err) {
            console.error("Error fetching active data:", err);
            setError("Gagal memuat dashboard Hutang Aktif. Cek koneksi backend/rute.");
        }
    };
    
    // --- FUNGSI FETCH DATA LUNAS (BARU) ---
    const fetchSettledData = async () => {
        try {
            // Asumsi endpoint backend untuk data lunas adalah /api/hutang/settled
            const settledResponse = await axios.get(`${HUTANG_URL}/settled`);
            setSettledHutangList(settledResponse.data);
        } catch (err) {
            console.error("Error fetching settled data:", err);
            setError("Gagal memuat Hutang Lunas. Cek koneksi backend/rute.");
        }
    };
    
    // --- FUNGSI FETCH MASTER DATA ---
    const fetchMasterData = async () => {
        try {
            const tabunganMasterResponse = await axios.get(getMasterDataUrl('tabungan'));
            const supplierResponse = await axios.get(getMasterDataUrl('suppliers')); 
            setTabunganMasterList(tabunganMasterResponse.data);
            setSupplierMasterList(supplierResponse.data);
        } catch (err) {
            console.error("Error fetching master data:", err);
            setError("Gagal memuat data Master.");
        }
    };

    // --- LOGIKA useEffect UNTUK MENGAMBIL DATA SESUAI TAB ---
    useEffect(() => {
        setLoading(true);
        fetchMasterData();
        
        if (activeTab === 'active') {
            fetchActiveData().finally(() => setLoading(false));
        } else if (activeTab === 'settled') {
            fetchSettledData().finally(() => setLoading(false));
        }
    }, [activeTab]); // Berjalan saat tab berubah

    // ===================================
    // 3. HANDLERS (CRUD)
    // ===================================

    // Handler untuk Hutang Pokok Baru / Edit
    const handlePrincipalSubmit = async (dataToSave, isEditing) => {
        try {
            if (isEditing) {
                // UPDATE (PUT) - Menggunakan getHutangPrincipalUrl dengan ID
                await axios.put(getHutangPrincipalUrl(dataToSave._id), dataToSave);
                alert("Detail Hutang Pokok berhasil diperbarui!");
                setEditPrincipal(null); // Tutup form
            } else {
                // CREATE (POST) - Menggunakan getHutangPrincipalUrl tanpa ID
                await axios.post(getHutangPrincipalUrl(), dataToSave);
                alert("Hutang baru berhasil dicatat!");
                setIsFormActive(false);
            }
            fetchActiveData(); // Refresh data aktif
        } catch (err) {
            console.error("Error saving principal:", err);
            alert(`Gagal mencatat hutang: ${err.response?.data?.message || 'Kesalahan Server'}`);
        }
    };

    // Handler untuk Pembayaran Cicilan
    const handleNewPayment = async (dataToSave) => {
        try {
            // Menggunakan getHutangPaymentUrl()
            await axios.post(getHutangPaymentUrl(), dataToSave);
            alert("Pembayaran berhasil dicatat!");
            setPayPrincipalData(null); // Tutup form
            fetchActiveData(); // Refresh data aktif
        } catch (err) {
            console.error("Error saving payment:", err);
            alert(`Gagal mencatat pembayaran: ${err.response?.data?.message || 'Kesalahan Server'}`);
        }
    };
    
    // Handler untuk memulai proses pembayaran
    const startPayPrincipal = (hutangData) => {
        setPayPrincipalData(hutangData);
        setIsFormActive(false);
        setEditPrincipal(null);
    };

    // Handler untuk memulai proses edit
    const startEditPrincipal = (hutangData) => {
        setEditPrincipal(hutangData);
        setIsFormActive(false);
        setPayPrincipalData(null);
    };

    // Gabungkan Master Tabungan dengan Saldo (Untuk opsi form pembayaran)
    const tabunganOptions = tabunganMasterList
        .map(master => ({
            id: master._id,
            name: master.nama,
            saldo: tabunganSaldoMap[master._id] || 0
        }))
        .filter(opt => opt.saldo > 0); // Hanya tabungan yang bersaldo yang bisa dipakai bayar
    
    const activePrincipalHutang = hutangList.filter(h => h.sisa_hutang > 0);
    const totalSisaHutang = activePrincipalHutang.reduce((sum, h) => sum + h.sisa_hutang, 0);

    const getTabButtonStyle = (tabName) => ({
        padding: '10px 15px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s',
        backgroundColor: activeTab === tabName ? 'white' : 'var(--background-light)',
        color: activeTab === tabName ? DANGER_COLOR : '#666',
        borderTop: `2px solid ${activeTab === tabName ? DANGER_COLOR : '#ddd'}`,
        borderRight: `1px solid ${activeTab === tabName ? DANGER_COLOR : '#ddd'}`,
        borderLeft: `1px solid ${activeTab === tabName ? DANGER_COLOR : '#ddd'}`,
        borderBottom: activeTab === tabName ? 'none' : `1px solid #ddd`,
        borderRadius: '6px 6px 0 0',
        marginBottom: activeTab === tabName ? '-1px' : '0', 
    });


    return (
        <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif' }}>
            
            
            {/* Modal/Form Tambah/Edit Hutang Baru (Principal) */}
            {(isFormActive || editPrincipal) && (
                <div style={{ border: `1px solid ${PRIMARY_COLOR}`, padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: PRIMARY_COLOR, marginTop: '0' }}>
                        {editPrincipal ? '✏️ Edit Detail Hutang Pokok' : '➕ Catat Hutang Pokok Baru'}
                    </h3>
                    <HutangPrincipalForm 
                        onSave={handlePrincipalSubmit} 
                        suppliers={supplierMasterList} 
                        initialData={editPrincipal}
                        onCancel={() => { setIsFormActive(false); setEditPrincipal(null); }}
                    />
                </div>
            )}
            
            {/* Modal/Form Cicil Hutang */}
            {payPrincipalData && (
                <div style={{ backgroundColor: '#fffbe6', padding: '25px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0,0,0,0.15)', marginBottom: '30px', border: `1px solid ${DANGER_COLOR}` }}>
                    <h3 style={{ color: DANGER_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        💰 Catat Pembayaran Hutang Cicilan
                    </h3>
                    <HutangPaymentForm
                        onPayment={handleNewPayment}
                        hutangToPay={payPrincipalData}
                        tabunganOptions={tabunganOptions}
                        pendapatanSaldo={pendapatanSaldo}
                        onCancel={() => setPayPrincipalData(null)}
                    />
                </div>
            )}

            {/* Kotak Informasi Saldo */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', marginTop: '20px' }}>
                {/* Total Sisa Hutang */}
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${DANGER_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>TOTAL SISA HUTANG</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: DANGER_COLOR }}>{formatRupiah(totalSisaHutang)}</p>
                </div>
                {/* Saldo Pokok */}
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${PRIMARY_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>Saldo Pokok Tersedia</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: PRIMARY_COLOR }}>{formatRupiah(pendapatanSaldo.pokok)}</p>
                </div>
                {/* Saldo Laba */}
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${ACCENT_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>Saldo Laba Tersedia</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: ACCENT_COLOR }}>{formatRupiah(pendapatanSaldo.laba)}</p>
                </div>
                {/* Tombol Aksi */}
                <button 
                    onClick={() => { setIsFormActive(true); setEditPrincipal(null); setPayPrincipalData(null); }}
                    style={{ padding: '10px 20px', height: 'fit-content', alignSelf: 'center', backgroundColor: PRIMARY_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    + Hutang Baru
                </button>
            </div>

            {/* TAB NAVIGASI */}
            <div style={{ marginBottom: '0px', display: 'flex', gap: '0px' }}>
                <button onClick={() => setActiveTab('active')} style={getTabButtonStyle('active')}>
                    Hutang Aktif ({activePrincipalHutang.length})
                </button>
                <button onClick={() => setActiveTab('settled')} style={getTabButtonStyle('settled')}>
                    Hutang Lunas
                </button>
            </div>

            {/* KONTEN AKTIF */}
            <div style={{ padding: '25px', border: `1px solid ${PRIMARY_COLOR}`, borderRadius: '0 8px 8px 8px', backgroundColor: 'white', boxShadow: 'var(--shadow-base)' }}>
                {loading && <p>Memuat data...</p>}
                {error && !loading ? <p style={{ color: DANGER_COLOR }}>{error}</p> : (
                    activeTab === 'active' ? (
                        <HutangActiveList 
                            hutangList={activePrincipalHutang} 
                            formatRupiah={formatRupiah} 
                            onCicil={startPayPrincipal} 
                            onEdit={startEditPrincipal} 
                            suppliers={supplierMasterList}
                        />
                    ) : (
                        // --- PERUBAHAN: Meneruskan data lunas ke komponen anak ---
                        <HutangSettled 
                            hutangList={settledHutangList} 
                            formatRupiah={formatRupiah} 
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default Hutang;
