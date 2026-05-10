"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, Search, Filter, Package, 
  AlertTriangle, XCircle, ArrowUpRight, 
  ChevronDown, MoreHorizontal, History,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- SUB-COMPONENT: StatCard ---
export function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-100 shadow-none flex justify-between items-start h-[135px] w-full">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[13px] font-bold text-[#161616] tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-[#161616] leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-[#34C759]'}`}>
            {!isNeutral && <ArrowUpRight size={14} strokeWidth={3} />} {trend}
          </p>
        </div>
      </div>
      <div className="p-2.5 rounded-lg border border-zinc-50 bg-white flex items-center justify-center text-[#F2C94C]">
        {icon}
      </div>
    </div>
  );
}

export default function LaporanBahanPage() {
  const [bahan, setBahan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA DARI SUPABASE ---
  const fetchLaporanBahan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stok_bahan')
        .select('*')
        .order('nama_bahan', { ascending: true });

      if (error) throw error;
      setBahan(data || []);
    } catch (error: any) {
      console.error("Error fetching report:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanBahan();
  }, []);

  // --- FILTER SEARCH ---
  const filteredBahan = bahan.filter(b => 
    b.nama_bahan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIKA STATUS & KALKULASI ---
  const stokMenipis = bahan.filter(b => b.stok_sisa > 0 && b.stok_sisa < 5).length;
  const stokKosong = bahan.filter(b => b.stok_sisa <= 0).length;
  const totalPemakaian = bahan.reduce((acc, curr) => acc + (curr.stok_keluar || 0), 0);

  const getStatusInfo = (sisa: number) => {
    if (sisa <= 0) return { label: "Habis", class: "bg-[#F5E4E2] text-[#F54336]" };
    if (sisa < 5) return { label: "Menipis", class: "bg-[#FFF4E5] text-[#FFB020]" };
    return { label: "Aman", class: "bg-[#CEECD6] text-[#34C759]" };
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#161616]">Laporan Stok & Bahan</h1>
            <p className="text-[13px] text-zinc-400 mt-1">Pantau perputaran stok material reparasi dan cuci</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-[13px] font-bold hover:bg-zinc-800 transition-all shadow-none">
            <Download size={18} /> Ekspor Data Stok
          </button>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard 
            title="Total Jenis Bahan" 
            value={bahan.length} 
            sub="/ Jenis" 
            trend="Data real-time" 
            isNeutral
            icon={<Package size={18} />} 
          />
          <StatCard 
            title="Pemakaian Stok" 
            value={totalPemakaian} 
            sub="/ Item Keluar" 
            trend="Kumulatif penggunaan" 
            icon={<History size={18} />} 
          />
          <StatCard 
            title="Stok Menipis" 
            value={stokMenipis} 
            sub="/ Perlu Order" 
            trend="Segera cek gudang" 
            isNeutral 
            icon={<AlertTriangle size={18} />} 
          />
          <StatCard 
            title="Stok Kosong" 
            value={stokKosong} 
            sub="/ Habis" 
            trend="Restock segera!" 
            icon={<XCircle size={18} />} 
          />
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-none w-full overflow-hidden">
          
          <div className="p-6 pb-4 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-zinc-50">
            <div className="relative w-full lg:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari nama bahan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 text-[13px] focus:outline-none focus:border-zinc-400 shadow-none"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button 
                onClick={fetchLaporanBahan}
                className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50">
                Urutkan <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="py-20 text-center text-zinc-400 text-[13px]">Memuat laporan stok...</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-zinc-400 text-[13px] font-medium bg-zinc-50/30">
                    <th className="py-4 px-6 border-b border-zinc-50">Nama Bahan</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Masuk</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Keluar</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Sisa Stok</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Status</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredBahan.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-zinc-400 italic text-[13px]">Data laporan tidak ditemukan.</td></tr>
                  ) : filteredBahan.map((item) => {
                    const status = getStatusInfo(item.stok_sisa);
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="py-5 px-6">
                          <p className="text-[14px] font-bold text-zinc-800 tracking-tight">{item.nama_bahan}</p>
                          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-tighter">ID: {item.id.substring(0, 8)}</p>
                        </td>
                        <td className="py-5 px-6 text-center text-[14px] text-zinc-600 font-medium">{item.stok_masuk} {item.satuan}</td>
                        <td className="py-5 px-6 text-center text-[14px] text-zinc-600 font-medium">{item.stok_keluar} {item.satuan}</td>
                        <td className="py-5 px-6 text-center text-[14px] font-extrabold text-zinc-900">{item.stok_sisa} {item.satuan}</td>
                        <td className="py-5 px-6 text-center">
                          <span className={`px-4 py-1 rounded-full text-[11px] font-bold ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                            <MoreHorizontal size={20} className="text-zinc-400 group-hover:text-zinc-800" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}