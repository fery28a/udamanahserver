// ud_amanah_frontend/src/components/masterdata/SupplierForm.jsx

import React, { useState } from 'react';
import DataTable from './DataTable';

const SupplierForm = ({ onSubmit, suppliers, onEdit, onDelete }) => {
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nama, alamat, kontak });
    setNama(''); setAlamat(''); setKontak(''); // Reset form
  };

  return (
    <div>
      <h3>Input Data Suplier</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={nama} 
          onChange={(e) => setNama(e.target.value)} 
          placeholder="Nama Suplier" 
          required 
          style={{ borderColor: '#0071ce', marginRight: '10px' }}
        />
        <input 
          type="text" 
          value={alamat} 
          onChange={(e) => setAlamat(e.target.value)} 
          placeholder="Alamat"
          style={{ borderColor: '#0071ce', marginRight: '10px' }}
        />
        <input 
          type="text" 
          value={kontak} 
          onChange={(e) => setKontak(e.target.value)} 
          placeholder="Kontak (Telp/Email)"
          style={{ borderColor: '#0071ce' }}
        />
        <button type="submit" style={{ backgroundColor: '#0071ce', color: 'white', marginLeft: '10px' }}>Simpan Suplier</button>
      </form>
      
      {/* Output Data di bawah menu */}
      <h4>Daftar Suplier</h4>
      <DataTable 
        data={suppliers} 
        columns={['Nama', 'Alamat', 'Kontak']} 
        onEdit={onEdit} 
        onDelete={onDelete}
        primaryColor="#0071ce" // Warna tema
        accentColor="#ffc220" 
      />
    </div>
  );
};
export default SupplierForm;