// ud_amanah_frontend/src/components/piutang/PiutangSettled.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
// FIX: Import API URL terpusat
import { PIUTANG_URL } from "../../config/api"; 

const PRIMARY_COLOR = 'var(--primary-color)';
const SUCCESS_COLOR = '#28a745';
const ACCENT_COLOR = 'var(--accent-color)';

// Komponen ini tidak lagi menerima piutangList sebagai props, 
// melainkan mengambil data sendiri.
const PiutangSettled = ({ formatRupiah }) => {
    const [settledList, setSettledList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { month: filter.month, year: filter.year };
            // FIX: Gunakan PIUTANG_URL yang diimpor
            const response = await axios.get(`${PIUTANG_URL}/settled`, { params });
            setSettledList(response.data);
        } catch (error) {
            console.error("Error fetching settled debt:", error);
            // Anda mungkin ingin menampilkan pesan error di UI
            setSettledList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.month, filter.year]);

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };
    
    // Fungsi Cetak Bukti Lunas (Printer Dot Matriks Style)
    const printSettlement = (piutang) => {
        const doc = new jsPDF();
        const yStart = 20;
        let y = yStart;
        const lineSpacing = 6;
        
        // Header (Dot Matriks Style)
        doc.setFont('Courier'); 
        doc.setFontSize(14);
        doc.text("---------------------------------------------", 10, y);
        y += lineSpacing;
        doc.text("BUKTI PENERIMAAN PELUNASAN PIUTANG", 10, y);
        y += lineSpacing;
        doc.text(`UD AMANAH`, 10, y);
        y += lineSpacing;
        doc.text("---------------------------------------------", 10, y);
        y += lineSpacing;

        // Detail Transaksi
        doc.setFontSize(10);
        doc.text(`CUSTOMER: ${piutang.customer_id.nama}`, 10, y);
        y += lineSpacing;
        doc.text(`NO. TRANSAKSI: ${piutang.transaction_number}`, 10, y);
        y += lineSpacing;
        doc.text(`TANGGAL AWAL PIUTANG: ${new Date(piutang.start_date).toLocaleDateString('id-ID')}`, 10, y);
        y += lineSpacing;
        doc.text(`TANGGAL PELUNASAN: ${new Date(piutang.settlement_date).toLocaleDateString('id-ID')}`, 10, y); 
        y += lineSpacing;
        doc.text("---------------------------------------------", 10, y);
        y += lineSpacing;

        // Nominal
        doc.setFontSize(12);
        doc.text("NOMINAL DITERIMA:", 10, y);
        doc.text(formatRupiah(piutang.nominal), 140, y);
        y += lineSpacing * 2;
        
        // Tanda Tangan
        doc.setFontSize(10);
        doc.text("DITERIMA OLEH,", 20, y);
        doc.text("DISETOR OLEH,", 140, y);
        y += lineSpacing * 4;

        // Nama Terang
        doc.text("-----------------------", 20, y);
        doc.text("-----------------------", 140, y);
        y += lineSpacing;
        doc.text(`( UD AMANAH )`, 20, y);
        doc.text(`( ${piutang.customer_id.nama} )`, 140, y);


        doc.save(`LunasPiutang_${piutang.transaction_number}.pdf`);
    };

    return (
        <div>
            {/* Filter */}
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <label style={{ marginRight: '10px', fontWeight: '600' }}>Bulan Pelunasan:</label>
                <select name="month" value={filter.month} onChange={handleFilterChange} style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(filter.year, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                    ))}
                </select>
                <label style={{ marginRight: '10px', fontWeight: '600' }}>Tahun:</label>
                <input type="number" name="year" value={filter.year} onChange={handleFilterChange} style={{ padding: '8px', width: '80px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            {loading ? <p>Memuat data piutang lunas...</p> : settledList.length === 0 ? (
                <p style={{ color: PRIMARY_COLOR }}>Tidak ada piutang yang lunas pada periode ini.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: SUCCESS_COLOR, color: 'white' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>No. Transaksi</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Tgl Awal</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Tgl Lunas</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Nominal</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settledList.map((piutang) => (
                            <tr key={piutang._id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#e6ffed' }}>
                                <td style={{ padding: '10px' }}>{piutang.customer_id.nama}</td>
                                <td style={{ padding: '10px' }}>{piutang.transaction_number}</td>
                                <td style={{ padding: '10px' }}>{new Date(piutang.start_date).toLocaleDateString('id-ID')}</td>
                                <td style={{ padding: '10px' }}>{new Date(piutang.settlement_date).toLocaleDateString('id-ID')}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{formatRupiah(piutang.nominal)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button onClick={() => printSettlement(piutang)} style={{ padding: '6px 10px', backgroundColor: ACCENT_COLOR, color: PRIMARY_COLOR, border: 'none', borderRadius: '4px' }}>
                                        Cetak Bukti
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PiutangSettled;
