"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Download, Search, MoreHorizontal, 
  TrendingUp, FileText, CheckCircle2, Clock, 
  Filter, Calendar, ChevronDown, FileJson, FileSpreadsheet,
  FileDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Library untuk Export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function LaporanTransaksiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<any>(null);
  const [openExport, setOpenExport] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  
  const [statusPengerjaan, setStatusPengerjaan] = useState("Semua");
  const [statusPembayaran, setStatusPembayaran] = useState("Semua");
  const [periode, setPeriode] = useState("Mingguan");

  const menuRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Database Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenuId(null);
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) setOpenExport(false);
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setOpenFilter(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTransactions = transactions.filter(item => {
    const search = searchQuery.toLowerCase();
    const matchSearch = (item.invoice_code?.toLowerCase() || "").includes(search) || (item.nama_pelanggan?.toLowerCase() || "").includes(search);
    const matchPengerjaan = statusPengerjaan === "Semua" || item.status_pengerjaan === statusPengerjaan;
    const matchPembayaran = statusPembayaran === "Semua" || item.status_pembayaran === statusPembayaran;
    return matchSearch && matchPengerjaan && matchPembayaran;
  });

  // Export Logic
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Transaksi", 14, 15);
    const tableData = filteredTransactions.map((item) => [
      new Date(item.tanggal).toLocaleDateString('id-ID'),
      item.invoice_code,
      item.nama_pelanggan,
      `${item.kategori || ''} - ${item.jasa || ''}`,
      formatIDR(item.total_bayar || 0),
      item.status_pembayaran,
      item.status_pengerjaan,
    ]);
    autoTable(doc, {
      head: [["Tanggal", "Kode", "Pelanggan", "Kategori & Jasa", "Total", "Bayar", "Proses"]],
      body: tableData,
      startY: 20,
    });
    doc.save(`Laporan_Massal.pdf`);
    setOpenExport(false);
  };

  const exportSinglePDF = (item: any) => {
    const doc = new jsPDF();
    doc.text("DETAIL TRANSAKSI", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Field", "Detail"]],
      body: [
        ["Invoice", item.invoice_code],
        ["Pelanggan", item.nama_pelanggan || "Umum"],
        ["Kategori", item.kategori],
        ["Jasa", item.jasa],
        ["Total", formatIDR(item.total_bayar || 0)],
        ["Status Bayar", item.status_pembayaran],
        ["Status Kerja", item.status_pengerjaan],
      ],
    });
    doc.save(`Laporan_${item.invoice_code}.pdf`);
    setOpenMenuId(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
    XLSX.writeFile(workbook, `Laporan_Excel.xlsx`);
    setOpenExport(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-8 w-full font-sans text-[#161616]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <StatCard title="Total Transaksi" value={transactions.length} trend="+12 hari ini" icon={<TrendingUp size={20} />} />
          <StatCard title="Total Pendapatan" value={formatIDR(transactions.reduce((acc, curr) => acc + (Number(curr.total_bayar || curr.total_harga) || 0), 0))} trend="+5% dibanding kemarin" icon={<TrendingUp size={20} />} />
          <StatCard title="Belum Lunas" value={transactions.filter(t => t.status_pembayaran !== 'Lunas').length} trend="Perlu ditindaklanjuti" icon={<FileText size={20} />} isPositive={false} />
          <StatCard title="Pengerjaan Selesai" value={transactions.filter(t => t.status_pengerjaan === 'Selesai').length} trend="Kinerja Bagus" icon={<CheckCircle2 size={20} />} />
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white rounded-[24px] border border-zinc-100 w-full overflow-hidden">
          <div className="p-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
              <h1 className="text-[20px] font-black tracking-tight text-[#2D4F53]">Laporan Penggunaan Transaksi</h1>

              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Search */}
                <div className="relative w-full sm:w-[160px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                  <input type="text" placeholder="Cari..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-[12px] font-medium focus:outline-none transition-all" onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                {/* 2. Filter Status */}
                <div className="relative" ref={filterRef}>
                  <button onClick={() => setOpenFilter(!openFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[12px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95 whitespace-nowrap">
                    <Filter size={14} className="text-zinc-400" /> Filter Status <ChevronDown size={14} className="text-zinc-400" />
                  </button>
                  {openFilter && (
                    <div className="absolute right-0 mt-2 w-[220px] bg-white border border-zinc-100 rounded-2xl z-[70] p-4 shadow-sm border border-zinc-100 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[13px] font-black text-zinc-800 mb-2 uppercase tracking-wider">Status Pengerjaan</p>
                          <div className="space-y-0.5">
                            {['Semua', 'Selesai', 'Proses', 'Batal'].map((s) => (
                              <button key={s} onClick={() => { setStatusPengerjaan(s); setOpenFilter(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${statusPengerjaan === s ? 'bg-[#F2C94C]/10 text-[#F2C94C]' : 'text-zinc-500 hover:bg-zinc-50'}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <div className="h-[1px] bg-zinc-50"></div>
                        <div>
                          <p className="text-[13px] font-black text-zinc-800 mb-2 uppercase tracking-wider">Status Pembayaran</p>
                          <div className="space-y-0.5">
                            {['Semua', 'DP Bayar', 'Lunas', 'Belum Bayar'].map((s) => (
                              <button key={s} onClick={() => { setStatusPembayaran(s); setOpenFilter(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${statusPembayaran === s ? 'bg-[#2D4F53]/10 text-[#2D4F53]' : 'text-zinc-500 hover:bg-zinc-50'}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Dropdown Periode (SUDAH KEMBALI) */}
                <div className="relative">
                  <select 
                    value={periode} 
                    onChange={(e) => setPeriode(e.target.value)} 
                    className="appearance-none pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-[12px] font-bold text-zinc-600 focus:outline-none cursor-pointer hover:bg-zinc-50 transition-all"
                  >
                    <option>Mingguan</option>
                    <option>Bulanan</option>
                    <option>Tahunan</option>
                  </select>
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                {/* 4. Export Massal */}
                <div className="relative" ref={exportRef}>
                  <button onClick={() => setOpenExport(!openExport)} className="flex items-center gap-2 px-4 py-2 bg-[#2D4F53] text-white rounded-xl text-[12px] font-bold hover:bg-[#1e3a3d] transition-all active:scale-95 whitespace-nowrap">
                    Export <Download size={14} />
                  </button>
                  {openExport && (
                    <div className="absolute right-0 mt-2 w-[180px] bg-white border border-zinc-100 rounded-xl z-[60] py-1.5 shadow-sm border border-zinc-100">
                      <button onClick={exportToPDF} className="flex items-center gap-3 w-full text-left px-4 py-2 text-[11px] font-bold text-zinc-700 hover:bg-red-50 transition-colors"><FileJson size={14} className="text-red-500" /> Export PDF (.pdf)</button>
                      <button onClick={exportToExcel} className="flex items-center gap-3 w-full text-left px-4 py-2 text-[11px] font-bold text-zinc-700 hover:bg-emerald-50 transition-colors"><FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel (.xlsx)</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[12px] text-zinc-400 mt-1 italic font-medium text-left">Klik icon titik tiga untuk melihat detail transaksi</p>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-bold bg-zinc-50/50 uppercase tracking-widest border-b border-zinc-50">
                  <th className="py-4 px-8">Tanggal</th>
                  <th className="py-4 px-8">Kode Transaksi</th>
                  <th className="py-4 px-8">Nama Pelanggan</th>
                  <th className="py-4 px-8">Kategori & Jasa</th>
                  <th className="py-4 px-8 text-right">Total Harga</th>
                  <th className="py-4 px-8 text-center">Status Bayar</th>
                  <th className="py-4 px-8 text-center">Pengerjaan</th>
                  <th className="py-4 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-20 text-center text-zinc-400 italic">Memuat data...</td></tr>
                ) : filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-5 px-8 text-[13px] text-zinc-500 font-medium">
                      {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                    </td>
                    <td className="py-5 px-8 text-[13px] text-zinc-900 font-black">{item.invoice_code}</td>
                    <td className="py-5 px-8 text-[13px] text-zinc-900 font-bold">{item.nama_pelanggan || 'Umum'}</td>
                    <td className="py-5 px-8">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-zinc-700">{item.kategori || '-'}</span>
                        <span className="text-[11px] text-zinc-400 italic">{item.jasa || '-'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right text-[13px] font-black text-[#2D4F53]">{formatIDR(item.total_bayar || 0)}</td>
                    <td className="py-5 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${item.status_pembayaran === 'Lunas' ? 'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]' : 'bg-[#FFEBEE] text-[#F44336] border-[#FFCDD2]'}`}>
                        {item.status_pembayaran?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black border ${item.status_pengerjaan === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                        {item.status_pengerjaan === 'Selesai' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.status_pengerjaan?.toUpperCase() || "PROSES"}
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}>
                        <MoreHorizontal size={20} className="text-zinc-400 group-hover:text-zinc-900 cursor-pointer" />
                      </button>
                      {openMenuId === item.id && (
                        <div ref={menuRef} className="absolute right-12 top-10 w-[170px] bg-white border border-zinc-100 rounded-xl z-[50] py-1 shadow-sm border border-zinc-100 animate-in fade-in zoom-in duration-100">
                          <button onClick={() => router.push(`/admin/laporan-transaksi/${item.id}`)} className="block w-full text-left px-4 py-2.5 text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                            Detail Laporan
                          </button>
                          <button onClick={() => exportSinglePDF(item)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-[12px] font-bold text-[#2D4F53] hover:bg-zinc-50 transition-colors">
                            <FileDown size={14} /> Export Laporan
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, isPositive = true }: any) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-zinc-100 flex justify-between items-start h-[140px] w-full text-left">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{title}</p>
        <div>
          <span className="text-[24px] font-black text-[#161616] tracking-tighter">{value}</span>
          <p className={`text-[11px] mt-1 font-bold ${isPositive ? 'text-[#34C759]' : 'text-red-400'}`}>{trend}</p>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-white border border-zinc-50 text-[#F2C94C]">{icon}</div>
    </div>
  );
}