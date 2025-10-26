// ud_amanah_frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import Layout Components ---
import Navbar from './components/layout/Navbar'; 

// --- Import Page Components ---
// Komponen Utama
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Pendapatan from './pages/Pendapatan';
import KasKeluar from './pages/KasKeluar';
import Tabungan from './pages/Tabungan';
import Hutang from './pages/Hutang'; 
import Piutang from './pages/Piutang'; 
import Laporan from './pages/Laporan'; // <-- IMPORT HALAMAN LAPORAN

// Komponen Placeholder Sederhana (Jika diperlukan untuk rute masa depan/testing)
const PlaceholderPage = ({ title }) => (
    <div style={{ padding: '25px', color: '#0071ce', minHeight: '80vh' }}>
        <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>{title}</h2>
        <p>Halaman ini sedang dalam pengembangan aktif.</p>
    </div>
);


const App = () => {
  return (
    <Router>
      <Navbar /> 
      
      <main className="main-content-container"> 
        <Routes>
          {/* 1. Dashboard (Homepage) */}
          <Route path="/" element={<Dashboard />} />

          {/* 2. Master Data */}
          <Route path="/masterdata" element={<MasterData />} />

          {/* 3. Transaksi & Akun (Rute Aktif) */}
          <Route path="/pendapatan" element={<Pendapatan />} /> 
          <Route path="/kaskeluar" element={<KasKeluar />} />     
          <Route path="/tabungan" element={<Tabungan />} />
          <Route path="/hutang" element={<Hutang />} />
          <Route path="/piutang" element={<Piutang />} /> 

          {/* 4. Laporan */}
          <Route path="/laporan" element={<Laporan />} /> {/* <-- RUTE LAPORAN BARU */}

          {/* 5. Halaman 404 Not Found */}
          <Route 
            path="*" 
            element={<PlaceholderPage title="404 - Halaman Tidak Ditemukan" />} 
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;