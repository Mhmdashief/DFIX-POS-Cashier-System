"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, Search, Filter, MoreHorizontal, 
  ArrowUpRight, TrendingUp, CreditCard, 
  Wallet, FileText, ChevronDown, RefreshCw 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- SUB-COMPONENT: StatCard (Local agar tidak error build) ---
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

export default function LaporanTransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA DARI SUPABASE ---
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
      console.error("Error fetching transactions:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- KALKULASI STATISTIK ---
  const totalOmzet = transactions.reduce((acc, curr) => acc + Number(curr.total_bayar), 0);
  const totalTunai = transactions.filter(t => t.metode_pembayaran === 'Tunai').length;
  const totalQRIS = transactions.filter(t => t.metode_pembayaran === 'QRIS').length;

  // --- FILTER SEARCH ---
  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#161616]">Laporan Transaksi</h1>
            <p className="text-[13px] text-zinc-400 mt-1">Rekapitulasi omzet dan metode pembayaran secara real-time</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-[13px] font-bold hover:bg-zinc-800 transition-all shadow-none">
            <Download size={18} /> Ekspor Laporan
          </button>
        </div>

        {/* --- STATS SECTION: Hasil Kalkulasi Dinamis --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard 
            title="Total Omzet" 
            value={`Rp ${(totalOmzet / 1000000).toFixed(1)}jt`} 
            sub={`/ Rp ${totalOmzet.toLocaleString('id-ID')}`} 
            trend="Total bruto" 
            icon={<TrendingUp size={18} />} 
          />
          <StatCard 
            title="Metode Tunai" 
            value={totalTunai} 
            sub="/ Transaksi" 
            trend="Cash in hand" 
            icon={<Wallet size={18} />} 
          />
          <StatCard 
            title="Metode QRIS" 
            value={totalQRIS} 
            sub="/ Transaksi" 
            trend="Digital payment" 
            isNeutral 
            icon={<CreditCard size={18} />} 
          />
          <StatCard 
            title="Total Nota" 
            value={transactions.length} 
            sub="/ Lembar" 
            trend="Transaksi sukses" 
            icon={<FileText size={18} />} 
          />
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-none w-full overflow-hidden">
          
          <div className="p-6 pb-4 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-zinc-50">
            <div className="relative w-full lg:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari ID transaksi atau nama..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 text-[13px] focus:outline-none focus:border-zinc-400 shadow-none"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button onClick={fetchTransactions} className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all shadow-none">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            {loading ? (
                <div className="py-20 text-center text-zinc-400 text-[13px]">Memuat laporan transaksi...</div>
            ) : (
                <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    <tr className="text-zinc-400 text-[13px] font-medium bg-zinc-50/30">
                    <th className="py-4 px-6 border-b border-zinc-50">ID Transaksi</th>
                    <th className="py-4 px-6 border-b border-zinc-50">Tanggal</th>
                    <th className="py-4 px-6 border-b border-zinc-50">Pelanggan</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Metode</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-center">Status</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-right">Total</th>
                    <th className="py-4 px-6 border-b border-zinc-50 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center text-zinc-400 italic text-sm">Tidak ada riwayat transaksi.</td></tr>
                    ) : filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="py-5 px-6 text-[14px] font-bold text-zinc-800 tracking-tight">{item.id}</td>
                        <td className="py-5 px-6 text-[13px] text-zinc-500 font-medium">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-5 px-6 text-[14px] font-bold text-zinc-700">{item.nama_pelanggan || 'Umum'}</td>
                        <td className="py-5 px-6 text-center">
                            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">{item.metode_pembayaran}</span>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#CEECD6] text-[#34C759]">
                            {item.status_pembayaran}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right text-[14px] font-extrabold text-zinc-900">
                          Rp {Number(item.total_bayar).toLocaleString('id-ID')}
                        </td>
                        <td className="py-5 px-6 text-right">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                            <MoreHorizontal size={20} className="text-zinc-400 group-hover:text-zinc-800" />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}