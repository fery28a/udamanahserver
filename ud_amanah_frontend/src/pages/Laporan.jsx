// ud_amanah_frontend/src/pages/Laporan.jsx (FINAL)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx';

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5027/api' : '/api';
const API_URL = `${API_BASE_URL}/laporan`;
const PRIMARY_COLOR = 'var(--primary-color)';
const ACCENT_COLOR = 'var(--accent-color)';
const DANGER_COLOR = '#dc3545';
const SUCCESS_COLOR = '#28a745';

const REPORT_OPTIONS = [
    { value: 'pokok', label: 'Laporan Pendapatan Pokok' },
    { value: 'laba', label: 'Laporan Pendapatan Laba' },
    { value: 'kaskeluar', label: 'Laporan Kas Keluar' },
    { value: 'saldotabungan', label: 'Laporan Saldo Tabungan' },
    { value: 'hutangaktif', label: 'Laporan Hutang Aktif' },
    { value: 'hutanglunas', label: 'Laporan Hutang Lunas' },
    { value: 'piutangaktif', label: 'Laporan Piutang Aktif' },
    { value: 'piutanglunas', label: 'Laporan Piutang Lunas' },
];

const Laporan = () => {
    const [selectedReport, setSelectedReport] = useState(REPORT_OPTIONS[0].value);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

    const fetchData = async () => {
        if (!selectedReport) return;

        setLoading(true);
        setError(null);
        try {
            const params = { month: filter.month, year: filter.year };
            const response = await axios.get(`${API_URL}/${selectedReport}`, { params });
            
            // FIX PENTING: Mengakses response.data.data (properti yang disepakati di backend)
            setReportData(response.data.data); 
            
        } catch (err) {
            console.error("Error fetching report:", err);
            setError(`Gagal memuat data laporan. ${err.response?.data?.message || err.message}`);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedReport, filter.month, filter.year]);
    
    // --- Cetak ke PDF ---
    const handlePrintPDF = () => {
        if (reportData.length === 0) {
            alert("Tidak ada data untuk dicetak.");
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape' });
        const reportTitle = REPORT_OPTIONS.find(opt => opt.value === selectedReport).label;
        
        doc.setFontSize(16);
        doc.text(reportTitle, 14, 15);
        doc.setFontSize(10);
        doc.text(`Periode: ${filter.month}/${filter.year}`, 14, 22);

        // Siapkan kolom dan baris untuk jsPDF AutoTable
        // Menggunakan utilitas untuk meratakan data dan headers (penanganan populate)
        const normalizeData = reportData.map(item => {
            const newItem = {};
            for (const key in item) {
                let value = item[key];
                
                // Jika properti adalah objek Mongoose (misal: supplier_id), gunakan properti 'nama'
                if (key.endsWith('_id') && typeof value === 'object' && value !== null && value.nama) {
                    newItem[key.replace('_id', '_name')] = value.nama;
                } else if (key !== '__v') {
                    newItem[key] = value;
                }
            }
            return newItem;
        }).map(item => {
             // Konversi tanggal/rupiah di sini
             for (const key in item) {
                if (typeof item[key] === 'number' && key !== 'ID') { // Hindari konversi ID ke rupiah
                    item[key] = formatRupiah(item[key]);
                } else if (typeof item[key] === 'string' && item[key].match(/^\d{4}-\d{2}-\d{2}/)) {
                    item[key] = new Date(item[key]).toLocaleDateString('id-ID');
                }
             }
             return item;
        });

        const columns = Object.keys(normalizeData[0] || {}).filter(key => key !== '__v');
        const rows = normalizeData.map(item => columns.map(col => item[col]));


        doc.autoTable({
            head: [columns.map(c => c.replace(/_/g, ' ').toUpperCase())],
            body: rows,
            startY: 28,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: PRIMARY_COLOR, textColor: 255 },
        });

        doc.save(`${selectedReport}_${filter.year}_${filter.month}.pdf`);
    };

    // --- Cetak ke Excel (XLSX) ---
    const handlePrintExcel = () => {
        if (reportData.length === 0) {
            alert("Tidak ada data untuk dicetak.");
            return;
        }
        
        // Data diubah formatnya (populasi/tanggal/rupiah) sebelum diekspor ke XLSX
        const finalExportData = reportData.map(item => {
             const newItem = {};
             for (const key in item) {
                 let value = item[key];
                 // Penanganan Populasi (misal: customer_id.nama)
                 if (key.endsWith('_id') && typeof value === 'object' && value !== null && value.nama) {
                     newItem[key.replace('_id', '_name').toUpperCase()] = value.nama;
                 } else if (key !== '__v') {
                    // Konversi Tanggal
                    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                    newItem[key.replace(/_/g, ' ').toUpperCase()] = value;
                 }
             }
             return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(finalExportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
        
        const reportName = REPORT_OPTIONS.find(opt => opt.value === selectedReport).label.replace(/ /g, '_');
        XLSX.writeFile(workbook, `${reportName}_${filter.year}_${filter.month}.xlsx`);
    };


    return (
        <div style={{ padding: '25px' }}>
            {/* ... Judul dan Kontrol Filter ... */}
           

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px', border: `1px solid ${PRIMARY_COLOR}` }}>
                
                <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Pilih Laporan & Filter Periode</h3>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                    
                    {/* Kolom Pilihan Laporan */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Jenis Laporan</label>
                        <select 
                            value={selectedReport} 
                            onChange={(e) => setSelectedReport(e.target.value)} 
                            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '300px' }}
                        >
                            {REPORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Bulan & Tahun */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Filter Bulan</label>
                        <select name="month" value={filter.month} onChange={(e) => setFilter({...filter, month: e.target.value})} style={{ padding: '10px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(filter.year, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                            ))}
                        </select>
                        <input type="number" name="year" value={filter.year} onChange={(e) => setFilter({...filter, year: e.target.value})} style={{ padding: '10px', width: '80px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    {/* Tombol Cetak */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        
                        <button 
                            onClick={handlePrintExcel} 
                            disabled={reportData.length === 0}
                            style={{ padding: '10px 15px', backgroundColor: SUCCESS_COLOR, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', opacity: reportData.length === 0 ? 0.5 : 1 }}
                        >
                            Cetak Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Area Tampilan Data Laporan */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: PRIMARY_COLOR, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Hasil Laporan</h3>
                
                {loading && <p style={{ textAlign: 'center' }}>Memuat data laporan...</p>}
                {error && <p style={{ color: DANGER_COLOR }}>Error: {error}</p>}
                
                {reportData.length > 0 && !loading ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                                    {/* Ambil key dari item pertama, filter properti internal Mongoose */}
                                    {Object.keys(reportData[0]).filter(key => key !== '__v').map(key => (
                                        <th key={key} style={{ padding: '10px', textAlign: 'left' }}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        {Object.keys(item).filter(key => key !== '__v').map(key => {
                                            let value = item[key];
                                            
                                            // Handle Populate (Jika properti adalah objek dan memiliki 'nama')
                                            if (typeof value === 'object' && value !== null && value.nama) {
                                                value = value.nama;
                                            }
                                            // Handle Konversi Tanggal/Rupiah di tampilan tabel
                                            else if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
                                                value = new Date(value).toLocaleDateString('id-ID');
                                            }
                                            else if (typeof value === 'number' && key !== 'ID') {
                                                value = formatRupiah(value);
                                            }

                                            return <td key={key} style={{ padding: '10px' }}>{value}</td>;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : !loading && <p>Pilih jenis laporan untuk memuat data.</p>}
            </div>
        </div>
    );
};

export default Laporan;