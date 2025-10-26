// ud_amanah_frontend/src/pages/MasterData.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import sub-komponen
import SupplierForm from '../components/masterdata/SupplierForm';
import CustomerForm from '../components/masterdata/CustomerForm';
import TabunganForm from '../components/masterdata/TabunganForm';

// --- PERUBAHAN: Import dari config/api ---
import { MASTER_DATA_URL } from '../config/api';

// Konstanta Warna Tema
const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';


const MasterData = () => {
    const [activeMenu, setActiveMenu] = useState('Supplier'); 
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [tabunganMaster, setTabunganMaster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchData = async (endpoint, setData) => {
        try {
            setLoading(true);
            // Menggunakan MASTER_DATA_URL
            const response = await axios.get(`${MASTER_DATA_URL}/${endpoint}`);
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            setError(`Gagal mengambil data ${endpoint}. Pastikan backend berjalan di ${MASTER_DATA_URL}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData('suppliers', setSuppliers);
        fetchData('customers', setCustomers);
        fetchData('tabungan', setTabunganMaster);
    }, []); 

    const refreshData = (menu) => {
        if (menu === 'Supplier') fetchData('suppliers', setSuppliers);
        else if (menu === 'Customer') fetchData('customers', setCustomers);
        else if (menu === 'Tabungan Masterdata') fetchData('tabungan', setTabunganMaster);
    };


    // --- Fungsi SIMPAN/UPDATE (CREATE/UPDATE) ---
    const handleFormSubmit = async (data, isEditing) => {
        let endpoint = '';
        if (activeMenu === 'Supplier') { endpoint = 'suppliers'; }
        else if (activeMenu === 'Customer') { endpoint = 'customers'; }
        else if (activeMenu === 'Tabungan Masterdata') { endpoint = 'tabungan'; }
        if (!endpoint) return; 

        // Menggunakan MASTER_DATA_URL
        const url = isEditing ? `${MASTER_DATA_URL}/${endpoint}/${data._id}` : `${MASTER_DATA_URL}/${endpoint}`;
        const method = isEditing ? 'put' : 'post'; 

        try {
            const response = await axios[method](url, data);
            
            const action = isEditing ? 'diperbarui' : 'disimpan';
            const name = response.data.nama || response.data.namaTabungan || 'Data Baru';

            alert(`Data ${activeMenu} (${name}) berhasil ${action}!`);
            refreshData(activeMenu); 

        } catch (err) {
            console.error(`Error saat submit ${activeMenu}:`, err.response?.data?.message || err.message);
            const errorMessage = err.response?.data?.message || `Gagal menyimpan/memperbarui data ${activeMenu}.`;
            alert(errorMessage);
        }
    };


    // --- Fungsi HAPUS (DELETE) ---
    const handleDelete = async (id) => {
        let endpoint = '';
        if (activeMenu === 'Supplier') { endpoint = 'suppliers'; }
        else if (activeMenu === 'Customer') { endpoint = 'customers'; }
        else if (activeMenu === 'Tabungan Masterdata') { endpoint = 'tabungan'; }

        if (!endpoint) return;
        if (!window.confirm(`Yakin ingin menghapus data ${activeMenu} ID: ${id}?`)) return;

        // Menggunakan MASTER_DATA_URL
        const url = `${MASTER_DATA_URL}/${endpoint}/${id}`;

        try {
            await axios.delete(url);
            alert(`Data ${activeMenu} ID ${id} berhasil dihapus.`);
            refreshData(activeMenu);
            
        } catch (err) {
            console.error(`Error saat menghapus ${activeMenu}:`, err.response?.data?.message || err.message);
            const errorMessage = err.response?.data?.message || `Gagal menghapus data ${activeMenu}.`;
            alert(errorMessage);
        }
    };


    const menuItems = ['Supplier', 'Customer', 'Tabungan Masterdata'];

    const renderContent = () => {
        
        if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: PRIMARY_COLOR }}>Memuat data master...</div>;
        if (error) return <div style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px' }}>{error}</div>;

        switch (activeMenu) {
            case 'Supplier':
                return <SupplierForm onSubmit={handleFormSubmit} suppliers={suppliers} onEdit={handleFormSubmit} onDelete={handleDelete} />;
            case 'Customer':
                return <CustomerForm onSubmit={handleFormSubmit} customers={customers} onEdit={handleFormSubmit} onDelete={handleDelete} />;
            case 'Tabungan Masterdata':
                return <TabunganForm onSubmit={handleFormSubmit} tabunganMaster={tabunganMaster} onEdit={handleFormSubmit} onDelete={handleDelete} />;
            default:
                return <div>Pilih sub-menu untuk mengelola data.</div>;
        }
    };

    return (
        <div style={{ padding: '25px' }}> 
            
            
            {/* Tombol Sub-Menu Navigasi (Tab yang sistematis) */}
            <div style={{ marginBottom: '0px', display: 'flex', gap: '0px' }}>
                {menuItems.map((menu) => (
                    <button
                        key={menu}
                        onClick={() => setActiveMenu(menu)}
                        style={{
                            padding: '12px 25px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            
                            backgroundColor: activeMenu === menu ? 'white' : 'var(--background-light)',
                            color: activeMenu === menu ? PRIMARY_COLOR : '#666',
                            
                            borderTop: `2px solid ${activeMenu === menu ? PRIMARY_COLOR : '#ddd'}`,
                            borderRight: `1px solid ${activeMenu === menu ? PRIMARY_COLOR : '#ddd'}`,
                            borderLeft: `1px solid ${activeMenu === menu ? PRIMARY_COLOR : '#ddd'}`,
                            borderBottom: activeMenu === menu ? 'none' : `1px solid #ddd`,
                            
                            borderRadius: '6px 6px 0 0',
                            marginBottom: activeMenu === menu ? '-1px' : '0', 
                        }}
                    >
                        {menu}
                    </button>
                ))}
            </div>

            {/* Konten Sub-Menu Aktif */}
            <div style={{ 
                padding: '25px', 
                border: `1px solid ${PRIMARY_COLOR}`, 
                borderRadius: '0 8px 8px 8px', 
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-base)'
            }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default MasterData;