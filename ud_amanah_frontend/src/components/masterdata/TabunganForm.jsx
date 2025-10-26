// ud_amanah_frontend/src/components/masterdata/TabunganForm.jsx

import React, { useState } from 'react';
import DataTable from './DataTable';

const TabunganForm = ({ onSubmit, tabunganMaster, onEdit, onDelete }) => {
  const [namaTabungan, setNamaTabungan] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nama: namaTabungan }); // Mengirim objek dengan key 'nama'
    setNamaTabungan(''); // Reset form
  };

  return (
    <div>
      <h3>Input Nama Master Tabungan</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={namaTabungan} 
          onChange={(e) => setNamaTabungan(e.target.value)} 
          placeholder="Nama Tabungan (Contoh: Dana Pendidikan)" 
          required 
          style={{ borderColor: '#ffc220', marginRight: '10px' }}
        />
        <button type="submit" style={{ backgroundColor: '#ffc220', color: 'black', fontWeight: 'bold' }}>Simpan Jenis Tabungan</button>
      </form>
      
      {/* Output Data di bawah menu */}
      <h4>Daftar Jenis Tabungan</h4>
      <DataTable 
        data={tabunganMaster} 
        columns={['Nama Tabungan']} 
        onEdit={onEdit} 
        onDelete={onDelete}
        primaryColor="#0071ce" 
        accentColor="#ffc220"
      />
    </div>
  );
};
export default TabunganForm;