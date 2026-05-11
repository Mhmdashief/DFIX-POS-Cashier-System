"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Download, Search, MoreHorizontal, Filter, 
  Calendar, ChevronDown, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, Clock, FileSpreadsheet, FileDown,
  Package, Inbox, LogOut
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function LaporanBahanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openExport, setOpenExport] = useState(false);
  
  const [filterType, setFilterType] = useState("Semua");

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const { data: logs, error } = await supabase
        .from('riwayat_bahan') 
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (error) throw error;
      setData(logs || []);
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setOpenExport(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = data.filter(item => {
    const search = searchQuery.toLowerCase();
    const matchSearch = (item.bahan?.toLowerCase() || "").includes(search) || (item.ref?.toLowerCase() || "").includes(search);
    const matchType = filterType === "Semua" || item.type === filterType;
    return matchSearch && matchType;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("LAPORAN RIWAYAT BAHAN", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Tanggal", "Bahan", "Varian", "Kategori", "Type", "Qty", "Ref"]],
      body: filteredData.map(i => [
        new Date(i.tanggal).toLocaleDateString('id-ID'),
        i.bahan, i.varian || "-", i.kategori || "-", i.type, i.qty, i.ref || "-"
      ]),
      headStyles: { fillColor: [45, 79, 83] }
    });
    doc.save(`Laporan_Bahan.pdf`);
    setOpenExport(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-8 w-full font-sans text-[#161616]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* STATS SECTION (SESUAI GAMBAR) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <StatCard 
            title="Total Bahan" 
            value={data.length} 
            trend="Item tercatat" 
            icon={<Package size={22} className="text-[#F2C94C]" />} 
          />
          <StatCard 
            title="Bahan Masuk" 
            value={data.filter(d => d.type === 'Masuk').length} 
            trend="Total restock" 
            icon={<Inbox size={22} className="text-emerald-500" />} 
          />
          <StatCard 
            title="Bahan Keluar" 
            value={data.filter(d => d.type === 'Keluar').length} 
            trend="Total digunakan" 
            icon={<LogOut size={22} className="text-orange-500" />} 
            isPositive={false}
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[24px] border border-zinc-100 w-full overflow-hidden shadow-sm">
          <div className="p-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
              <div>
                <h1 className="text-[20px] font-black tracking-tight text-[#2D4F53]">Laporan Riwayat Bahan</h1>
                <p className="text-[12px] text-zinc-400 mt-1 italic font-medium">Monitoring arus keluar masuk material</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-45">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                  <input 
                    type="text" 
                    placeholder="Cari bahan..." 
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-[12px] font-medium focus:outline-none" 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>

                <div className="relative">
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="appearance-none pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-[12px] font-bold text-zinc-600 focus:outline-none cursor-pointer">
                    <option value="Semua">Semua Tipe</option>
                    <option value="Masuk">Masuk</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                  <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                <div className="relative" ref={exportRef}>
                  <button 
                    onClick={() => setOpenExport(!openExport)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2D4F53] text-white rounded-xl text-[12px] font-bold hover:opacity-90 transition-opacity"
                  >
                    Export <Download size={14} />
                  </button>
                  
                  {openExport && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-100 rounded-2xl z-100 py-2 shadow-2xl">
                      <button onClick={exportToPDF} className="w-full text-left px-4 py-2 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-2">
                        <FileDown size={14} className="text-red-500" /> PDF
                      </button>
                      <button onClick={fetchRiwayat} className="w-full text-left px-4 py-2 text-[12px] font-bold text-zinc-400 hover:bg-zinc-50 flex items-center gap-2">
                        <RefreshCw size={14} /> Refresh
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-bold bg-zinc-50/50 uppercase tracking-widest border-b border-zinc-50">
                  <th className="py-4 px-8 border-b border-zinc-50">Tanggal</th>
                  <th className="py-4 px-8 border-b border-zinc-50">Bahan</th>
                  <th className="py-4 px-8 border-b border-zinc-50">Varian</th>
                  <th className="py-4 px-8 border-b border-zinc-50">Kategori</th>
                  <th className="py-4 px-8 border-b border-zinc-50 text-center">Type</th>
                  <th className="py-4 px-8 border-b border-zinc-50 text-center">Qty</th>
                  <th className="py-4 px-8 border-b border-zinc-50">Ref</th>
                  <th className="py-4 px-8 border-b border-zinc-50 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-20 text-center text-zinc-400 italic">Memuat...</td></tr>
                ) : filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-5 px-8 text-[13px] text-zinc-500 font-medium">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-5 px-8 text-[13px] text-zinc-900 font-black">{item.bahan}</td>
                    <td className="py-5 px-8 text-[13px] text-zinc-600 font-bold">{item.varian || '-'}</td>
                    <td className="py-5 px-8 text-[12px] text-zinc-400 font-bold uppercase">{item.kategori}</td>
                    <td className="py-5 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${item.type === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        {item.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-5 px-8 text-center text-[13px] font-black ${item.type === 'Masuk' ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {item.type === 'Masuk' ? '+' : '-'}{item.qty}
                    </td>
                    <td className="py-5 px-8 text-[12px] text-zinc-400 font-medium italic">{item.ref || '-'}</td>
                    <td className="py-5 px-8 text-right">
                      <MoreHorizontal size={20} className="text-zinc-400 cursor-pointer inline-block" />
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
    <div className="bg-white p-7 rounded-[32px] border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-left space-y-1">
        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">{title}</p>
        <h3 className="text-[28px] font-black text-[#161616] tracking-tighter">{value}</h3>
        <p className={`text-[11px] font-bold ${isPositive ? 'text-emerald-500' : 'text-orange-500'}`}>{trend}</p>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-inner">
        {icon}
      </div>
    </div>
  );
}