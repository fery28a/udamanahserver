// ud_amanah_frontend/src/pages/Piutang.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PiutangActiveList from '../components/piutang/PiutangActiveList'; // Akan dibuat
import PiutangSettled from '../components/piutang/PiutangSettled'; // Akan dibuat
import PiutangPrincipalForm from '../components/piutang/PiutangPrincipalForm'; // Akan dibuat

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:8084/api' : '/api';
const API_URL = `${API_BASE_URL}/piutang`;
const MASTER_DATA_API_URL = `${API_BASE_URL}/masterdata`;
const PRIMARY_COLOR = 'var(--primary-color)';
const SUCCESS_COLOR = '#28a745'; // Warna hijau untuk Piutang

const Piutang = () => {
    const [activeTab, setActiveTab] = useState('active'); 
    const [piutangList, setPiutangList] = useState([]);
    const [customerMasterList, setCustomerMasterList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormActive, setIsFormActive] = useState(false); 
    const [editData, setEditData] = useState(null); 

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const piutangResponse = await axios.get(API_URL); // GET /api/piutang/ (Active)
            const customerResponse = await axios.get(`${MASTER_DATA_API_URL}/customers`);

            setPiutangList(piutangResponse.data);
            setCustomerMasterList(customerResponse.data);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat Piutang. Cek koneksi backend/rute.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (activeTab === 'active') fetchData();
    }, [activeTab]);

    // Handler untuk Hutang Pokok Baru / Edit
    const handlePrincipalSubmit = async (dataToSave, isEditing) => {
        const url = isEditing ? `${API_URL}/${dataToSave._id}` : API_URL;
        const method = isEditing ? 'put' : 'post';
        
        try {
            await axios[method](url, dataToSave);
            alert(`Piutang berhasil ${isEditing ? 'diperbarui' : 'dicatat'}!`);
            setIsFormActive(false);
            setEditData(null);
            fetchData(); 
        } catch (err) {
            alert(`Gagal menyimpan: ${err.response?.data?.message || 'Kesalahan Server'}`);
        }
    };
    
    // Handler Tandai Lunas
    const handleSettle = async (id) => {
        if (!window.confirm("Yakin menandai Piutang ini LUNAS?")) return;
        try {
            await axios.put(`${API_URL}/settle/${id}`);
            alert('Piutang berhasil dilunasi dan dipindahkan ke Piutang Lunas.');
            fetchData();
        } catch (err) {
            alert(`Gagal melunasi: ${err.response?.data?.message || 'Kesalahan Server'}`);
        }
    };
    
    const startEdit = (data) => {
        setEditData(data);
        setIsFormActive(false);
    };

    const totalActivePiutang = piutangList.reduce((sum, p) => sum + p.nominal, 0);

    const getTabButtonStyle = (tabName) => ({
        padding: '10px 15px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s',
        backgroundColor: activeTab === tabName ? 'white' : 'var(--background-light)',
        color: activeTab === tabName ? SUCCESS_COLOR : '#666',
        borderTop: `2px solid ${activeTab === tabName ? SUCCESS_COLOR : '#ddd'}`,
        borderRight: `1px solid ${activeTab === tabName ? SUCCESS_COLOR : '#ddd'}`,
        borderLeft: `1px solid ${activeTab === tabName ? SUCCESS_COLOR : '#ddd'}`,
        borderBottom: activeTab === tabName ? 'none' : `1px solid #ddd`,
        borderRadius: '6px 6px 0 0',
        marginBottom: activeTab === tabName ? '-1px' : '0', 
    });


    return (
        <div style={{ padding: '25px' }}>
            
            
            {/* Kotak Informasi dan Tombol Aksi */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', marginTop: '20px' }}>
                <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-base)', backgroundColor: 'white', borderLeft: `5px solid ${SUCCESS_COLOR}` }}>
                    <h4 style={{ margin: 0, color: '#666' }}>TOTAL PIUTANG AKTIF</h4>
                    <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0 0', color: SUCCESS_COLOR }}>{formatRupiah(totalActivePiutang)}</p>
                </div>
                <button 
                    onClick={() => { setIsFormActive(true); setEditData(null); }}
                    style={{ padding: '10px 20px', height: 'fit-content', alignSelf: 'center', backgroundColor: PRIMARY_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600' }}
                >
                    + Catat Piutang Baru
                </button>
            </div>

            {/* Form Tambah/Edit Piutang Baru */}
            {(isFormActive || editData) && (
                <div style={{ border: `1px solid ${PRIMARY_COLOR}`, padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: PRIMARY_COLOR, marginTop: '0' }}>
                        {editData ? '✏️ Edit Detail Piutang' : '➕ Catat Piutang Baru'}
                    </h3>
                    <PiutangPrincipalForm 
                        onSave={handlePrincipalSubmit} 
                        customers={customerMasterList} 
                        initialData={editData}
                        onCancel={() => { setIsFormActive(false); setEditData(null); }}
                    />
                </div>
            )}

            {/* TAB NAVIGASI */}
            <div style={{ marginBottom: '0px', display: 'flex', gap: '0px' }}>
                <button onClick={() => setActiveTab('active')} style={getTabButtonStyle('active')}>
                    Piutang Aktif ({piutangList.length})
                </button>
                <button onClick={() => setActiveTab('settled')} style={getTabButtonStyle('settled')}>
                    Piutang Lunas
                </button>
            </div>

            {/* KONTEN AKTIF */}
            <div style={{ padding: '25px', border: `1px solid ${PRIMARY_COLOR}`, borderRadius: '0 8px 8px 8px', backgroundColor: 'white', boxShadow: 'var(--shadow-base)' }}>
                {loading && <p>Memuat data...</p>}
                {error && !loading ? <p style={{ color: SUCCESS_COLOR }}>{error}</p> : (
                    activeTab === 'active' ? (
                        <PiutangActiveList 
                            piutangList={piutangList} 
                            formatRupiah={formatRupiah} 
                            onSettle={handleSettle}
                            onEdit={startEdit}
                        />
                    ) : (
                        <PiutangSettled formatRupiah={formatRupiah} />
                    )
                )}
            </div>
        </div>
    );
};

export default Piutang;