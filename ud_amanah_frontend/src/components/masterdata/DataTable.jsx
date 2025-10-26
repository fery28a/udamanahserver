// ud_amanah_frontend/src/components/masterdata/DataTable.jsx (Example)

import React from 'react';

const DataTable = ({ data, columns, onEdit, onDelete, primaryColor, accentColor }) => {
  if (!data || data.length === 0) {
    return <p>Tidak ada data untuk ditampilkan.</p>;
  }

  // Fungsi untuk mendapatkan nilai field berdasarkan kolom
  const getCellValue = (item, colName) => {
    switch (colName) {
      case 'Nama':
        return item.nama;
      case 'Alamat':
        return item.alamat;
      case 'Kontak':
        return item.kontak;
      case 'Nama Tabungan':
        return item.nama; // Untuk TabunganMaster
      default:
        return '';
    }
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
      <thead>
        <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
          {columns.map((col, index) => (
            <th key={index} style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>
              {col}
            </th>
          ))}
          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id || item.id} style={{ borderBottom: '1px solid #eee' }}>
            {columns.map((col, index) => (
              <td key={index} style={{ padding: '10px', border: '1px solid #eee' }}>
                {getCellValue(item, col)}
              </td>
            ))}
            <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>
              <button 
                onClick={() => onEdit(item)} 
                style={{ 
                  marginRight: '5px', 
                  backgroundColor: accentColor, 
                  color: 'black', 
                  border: 'none', 
                  padding: '5px 10px', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(item._id || item.id)} 
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;