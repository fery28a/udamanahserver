// ud_amanah_frontend/src/components/masterdata/CustomerForm.jsx

import React, { useState } from 'react';
import DataTable from './DataTable'; // Pastikan DataTable diimpor

const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';

const CustomerForm = ({ onSubmit, customers, onEdit, onDelete }) => {
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customerData = { 
        nama, 
        alamat, 
        kontak, 
        // Sertakan _id jika sedang mode edit
        ...(isEditing && { _id: currentId }) 
    };

    onSubmit(customerData, isEditing);
    
    // Reset form
    setNama(''); 
    setAlamat(''); 
    setKontak('');
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEditClick = (customer) => {
    setNama(customer.nama);
    setAlamat(customer.alamat);
    setKontak(customer.kontak);
    setCurrentId(customer._id); 
    setIsEditing(true);
  };

  // Kolom yang ditampilkan di DataTable
  const columns = ['Nama', 'Alamat', 'Kontak'];

  return (
    <div style={{ padding: '0px' }}>
      <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {isEditing ? '📝 Edit Data Customer' : '➕ Tambah Customer Baru'}
      </h3>
      
      {/* FORM INPUT DENGAN TAMPILAN SISTEMATIS */}
      <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px', 
          flexWrap: 'wrap', 
          padding: '20px',
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          border: isEditing ? `1px solid ${ACCENT_COLOR}` : 'none'
      }}>
        <input 
          type="text" 
          value={nama} 
          onChange={(e) => setNama(e.target.value)} 
          placeholder="Nama Customer" 
          required 
          style={{ flex: 1, minWidth: '180px' }}
        />
        <input 
          type="text" 
          value={alamat} 
          onChange={(e) => setAlamat(e.target.value)} 
          placeholder="Alamat"
          style={{ flex: 1.5, minWidth: '250px' }}
        />
        <input 
          type="text" 
          value={kontak} 
          onChange={(e) => setKontak(e.target.value)} 
          placeholder="Kontak (Telp/Email)"
          style={{ flex: 1, minWidth: '180px' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isEditing ? ACCENT_COLOR : PRIMARY_COLOR, 
            color: isEditing ? 'black' : 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontWeight: '600',
            transition: 'filter 0.2s',
          }}
        >
          {isEditing ? 'UPDATE DATA' : 'SIMPAN CUSTOMER'}
        </button>
        {isEditing && (
            <button 
                type="button" 
                onClick={() => { setIsEditing(false); setNama(''); setAlamat(''); setKontak(''); setCurrentId(null); }}
                style={{ 
                    padding: '10px 15px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                }}
            >
                Batal Edit
            </button>
        )}
      </form>
      
      {/* OUTPUT DATA TABLE */}
      <h4 style={{ color: PRIMARY_COLOR, marginTop: '20px' }}>Daftar Customer</h4>
      
      {customers && customers.length > 0 ? (
        <DataTable 
          data={customers} 
          columns={columns} 
          onEdit={handleEditClick} 
          onDelete={onDelete}
          primaryColor={PRIMARY_COLOR} 
          accentColor={ACCENT_COLOR} 
        />
      ) : (
        <p>Belum ada data customer yang tersimpan.</p>
      )}
    </div>
  );
};

export default CustomerForm;