// ud_amanah_frontend/src/pages/KasKeluar.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KasKeluarForm from '../components/kaskeluar/KasKeluarForm'; 
import KasKeluarTable from '../components/kaskeluar/KasKeluarTable'; 

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545';
const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:8084/api' : '/api';
const API_URL = `${API_BASE_URL}/kaskeluar`;
// Card Saldo Reusable
const SaldoCard = ({ title, value, color }) => (
    <div style={{ padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: 'white', borderLeft: `5px solid ${color}`, minWidth: '220px', flexShrink: 0 }}>
        <h5 style={{ margin: 0, color: '#666', fontWeight: '400' }}>{title}</h5>
        <p style={{ fontSize: '1.4em', fontWeight: '700', margin: '5px 0 0', color: color }}>{value}</p>
    </div>
);


const KasKeluar = () => {
    const [transactions, setTransactions] = useState([]);
    const [pendapatanSaldo, setPendapatanSaldo] = useState({ pokok: 0, laba: 0 });
    const [tabunganList, setTabunganList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [editData, setEditData] = useState(null); 

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    // --- Fetch Data Dashboard ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { month: filter.month, year: filter.year };
            const response = await axios.get(`${API_URL}/dashboard`, { params });

            setTransactions(response.data.transactions);
            setPendapatanSaldo(response.data.pendapatanSaldo);
            setTabunganList(response.data.tabunganList);
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat data. Cek koneksi backend.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [filter.month, filter.year]); 

    // --- CRUD Handlers ---
    const handleSave = async (data) => {
        const payload = { ...data, date: new Date(data.date) };
        const url = editData ? `${API_URL}/${editData._id}` : `${API_URL}/`;
        const method = editData ? 'put' : 'post';

        try {
            await axios[method](url, payload);
            alert(`Transaksi Kas Keluar berhasil ${editData ? 'diperbarui' : 'disimpan'}!`);
            setEditData(null); 
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Gagal menyimpan data: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert('Transaksi berhasil dihapus.');
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Gagal menghapus data: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleEditClick = (data) => {
        setEditData({
            ...data,
            date: new Date(data.date).toISOString().split('T')[0] // Format tanggal ke YYYY-MM-DD
        });
    };

    const totalKeluarBulanIni = transactions.reduce((sum, tx) => sum + tx.nominal, 0);


    return (
        <div style={{ padding: '25px' }}>
            

            {/* Kotak Informasi Saldo Pendapatan */}
            <h3 style={{ color: PRIMARY_COLOR, marginTop: '20px' }}>Saldo Sumber Dana Utama</h3>
            <div style={{ display: 'flex', gap: '25px', marginBottom: '15px' }}>
                <SaldoCard title="Saldo Pokok (Net)" value={formatRupiah(pendapatanSaldo.pokok)} color={PRIMARY_COLOR} />
                <SaldoCard title="Saldo Laba (Net)" value={formatRupiah(pendapatanSaldo.laba)} color={ACCENT_COLOR} />
                <SaldoCard title="Total Keluar Bulan Ini" value={formatRupiah(totalKeluarBulanIni)} color={DANGER_COLOR} />
            </div>

            {/* Kotak Informasi Saldo Tabungan (Scrollable) */}
            <h3 style={{ color: PRIMARY_COLOR, marginTop: '20px' }}>Saldo Akun Tabungan (Aktif)</h3>
            <div 
                style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    overflowX: 'auto', 
                    paddingBottom: '15px', 
                    marginBottom: '30px' 
                }}
            >
                {tabunganList.length > 0 ? tabunganList.map(tabungan => (
                    <SaldoCard 
                        key={tabungan._id} 
                        title={`Tabungan: ${tabungan.nama}`} 
                        value={formatRupiah(tabungan.saldo)} 
                        color={PRIMARY_COLOR} 
                    />
                )) : (
                    <p style={{ padding: '10px', color: '#666' }}>Tidak ada akun Tabungan bersaldo.</p>
                )}
            </div>
            
            {/* Area Input (Form) */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', marginBottom: '30px', border: `1px solid ${DANGER_COLOR}` }}>
                <h3 style={{ color: DANGER_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {editData ? `📝 Edit Transaksi Pengeluaran` : `➕ Tambah Transaksi Pengeluaran Baru`}
                </h3>
                <KasKeluarForm 
                    initialData={editData} 
                    onSave={handleSave} 
                    onCancel={() => setEditData(null)} 
                    isEditing={!!editData}
                    tabunganOptions={tabunganList.filter(t => t.saldo > 0)} // Hanya Tabungan bersaldo yang bisa dipilih
                />
            </div>

            {/* Area Output (Tabel) */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: 'var(--shadow-base)' }}>
                <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Riwayat Kas Keluar
                </h3>
                
                {/* Filter Bulan & Tahun */}
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <label style={{ marginRight: '10px', fontWeight: '600' }}>Bulan:</label>
                    <select name="month" value={filter.month} onChange={handleFilterChange} style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(filter.year, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                        ))}
                    </select>
                    <label style={{ marginRight: '10px', fontWeight: '600' }}>Tahun:</label>
                    <input type="number" name="year" value={filter.year} onChange={handleFilterChange} style={{ padding: '8px', width: '80px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {loading && <p style={{ textAlign: 'center' }}>Memuat transaksi...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                <KasKeluarTable 
                    transactions={transactions} 
                    onEdit={handleEditClick} 
                    onDelete={handleDelete}
                    formatRupiah={formatRupiah}
                    tabunganList={tabunganList} // Kirim list tabungan untuk menampilkan nama
                />
            </div>
        </div>
    );
};

export default KasKeluar;