// ud_amanah_frontend/src/pages/Pendapatan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PendapatanForm from '../components/pendapatan/PendapatanForm'; 
import PendapatanTable from '../components/pendapatan/PendapatanTable'; 

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5027/api' : '/api';
const API_URL = `${API_BASE_URL}/pendapatan`;
// Card Ringkasan yang bersih
const SummaryCard = ({ title, value, color }) => (
    <div 
        style={{ 
            flex: 1, 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
            backgroundColor: 'white', 
            borderLeft: `5px solid ${color}` 
        }}
    >
        <h4 style={{ margin: 0, color: '#666', fontWeight: '400' }}>{title}</h4>
        <p style={{ fontSize: '1.8em', fontWeight: '700', margin: '5px 0 0', color: color }}>{value}</p>
    </div>
);

const Pendapatan = () => {
    const [activeType, setActiveType] = useState('pokok'); 
    const [transactions, setTransactions] = useState([]);
    const [saldo, setSaldo] = useState({ pokok: 0, laba: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [editData, setEditData] = useState(null); 

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                month: filter.month,
                year: filter.year
            };
            // Ambil semua data dan saldo NET
            const response = await axios.get(API_URL, { params }); 
            
            // Filter transaksi yang ditampilkan berdasarkan activeType (hanya di frontend)
            const filteredTx = response.data.transactions.filter(tx => tx.type === activeType);
            setTransactions(filteredTx);
            
            setSaldo(response.data.saldo); // Saldo total (pokok & laba)
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat data. Cek koneksi backend.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [activeType, filter.month, filter.year]); 


    // --- CRUD Handlers (sama seperti sebelumnya) ---
    const handleSave = async (data) => {
        const payload = { ...data, type: activeType, date: new Date(data.date) };
        const url = editData ? `${API_URL}/${editData._id}` : API_URL;
        const method = editData ? 'put' : 'post';
        try {
            await axios[method](url, payload);
            alert(`Pendapatan berhasil ${editData ? 'diperbarui' : 'disimpan'}!`);
            setEditData(null); 
            // Refresh data (memuat ulang transaksi dan saldo)
            fetchData(); 
        } catch (err) {
            alert(`Gagal menyimpan data: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert('Transaksi berhasil dihapus.');
            fetchData(); 
        } catch (err) {
            alert(`Gagal menghapus data: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- Filter & Edit Logic ---
    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleEditClick = (data) => {
        setEditData({
            ...data,
            date: new Date(data.date).toISOString().split('T')[0] 
        });
    };
    
    // Styling untuk Tombol Tab/Sub-menu (meniru MasterData.jsx)
    const getTabButtonStyle = (type) => ({
        padding: '12px 25px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s',
        backgroundColor: activeType === type ? 'white' : 'var(--background-light)',
        color: activeType === type ? PRIMARY_COLOR : '#666',
        
        borderTop: `2px solid ${activeType === type ? PRIMARY_COLOR : '#ddd'}`,
        borderRight: `1px solid ${activeType === type ? PRIMARY_COLOR : '#ddd'}`,
        borderLeft: `1px solid ${activeType === type ? PRIMARY_COLOR : '#ddd'}`,
        borderBottom: activeType === type ? 'none' : `1px solid #ddd`,
        
        borderRadius: '6px 6px 0 0',
        marginBottom: activeType === type ? '-1px' : '0', 
    });


    return (
        <div style={{ padding: '25px' }}>
            

            {/* Kotak Informasi Saldo (Card yang sama dengan Master Data) */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', marginTop: '20px' }}>
                <SummaryCard title="Saldo Pokok (Net)" value={formatRupiah(saldo.pokok)} color={PRIMARY_COLOR} />
                <SummaryCard title="Saldo Laba (Net)" value={formatRupiah(saldo.laba)} color={ACCENT_COLOR} />
            </div>

            {/* Tombol Sub-Menu (Sama seperti MasterData.jsx) */}
            <div style={{ marginBottom: '0px', display: 'flex', gap: '0px' }}>
                <button
                    onClick={() => setActiveType('pokok')}
                    style={getTabButtonStyle('pokok')}
                >
                    Pendapatan Pokok
                </button>
                <button
                    onClick={() => setActiveType('laba')}
                    style={getTabButtonStyle('laba')}
                >
                    Pendapatan Laba
                </button>
            </div>

            {/* Konten Utama (Form dan Tabel) */}
            <div style={{ 
                padding: '25px', 
                border: `1px solid ${PRIMARY_COLOR}`, 
                borderRadius: '0 8px 8px 8px', 
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-base)' 
            }}>
                
                {/* Area Input (Form) */}
                <div style={{ marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ color: PRIMARY_COLOR, paddingBottom: '10px', fontWeight: '600' }}>
                        {editData ? `📝 Edit Transaksi ${activeType === 'pokok' ? 'Pokok' : 'Laba'}` : `➕ Tambah Transaksi ${activeType === 'pokok' ? 'Pokok' : 'Laba'} Baru`}
                    </h3>
                    <PendapatanForm 
                        initialData={editData} 
                        onSave={handleSave} 
                        onCancel={() => setEditData(null)} 
                        isEditing={!!editData}
                    />
                </div>

                {/* Area Output (Tabel) */}
                <div>
                    <h3 style={{ color: PRIMARY_COLOR, paddingBottom: '10px', fontWeight: '600' }}>
                        Riwayat Transaksi {activeType === 'pokok' ? 'Pokok' : 'Laba'}
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
                    
                    <PendapatanTable 
                        transactions={transactions} 
                        onEdit={handleEditClick} 
                        onDelete={handleDelete}
                        formatRupiah={formatRupiah}
                    />
                </div>
            </div>
        </div>
    );
};

export default Pendapatan;