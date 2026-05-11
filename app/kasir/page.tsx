"use client";

import React, { useEffect, useState } from "react";
import { 
  Receipt, Clock, CheckCircle2, MoreHorizontal, 
  ArrowUpRight, Users, RefreshCw, Eye, Edit3, Trash2, ChevronLeft 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TransactionAreaChart, StockBarChart } from "@/components/DashboardCharts";

// --- KOMPONEN DROPDOWN AKSI ---
function ActionDropdown({ item, onRefresh }: { item: any, onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setShowStatusOptions(false);
    };
    if (isOpen) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ status: newStatus })
        .eq('id', item.id);
      if (error) throw error;
      onRefresh();
      setIsOpen(false);
    } catch (err) {
      alert("Gagal mengubah status");
    }
  };

  const handleDelete = async () => {
    if (confirm("Hapus data reparasi ini?")) {
      const { error } = await supabase.from('transaksi').delete().eq('id', item.id);
      if (!error) onRefresh();
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent active:border-zinc-200">
        <MoreHorizontal size={18} className="text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-zinc-100 z-[99] py-1.5 overflow-hidden animate-in fade-in zoom-in duration-100 text-left">
          {!showStatusOptions ? (
            <>
              <button onClick={() => router.push(`/admin/transaksi/${item.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                <Eye size={16} className="text-zinc-400" /> Detail Transaksi
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowStatusOptions(true); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Edit3 size={16} className="text-zinc-400" /> Ubah Status Pengerjaan
                </div>
                <ChevronLeft size={14} className="text-zinc-300 rotate-180" />
              </button>
              <div className="h-[1px] bg-zinc-50 my-1" />
              <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-medium">
                <Trash2 size={16} /> Hapus
              </button>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-2 duration-200">
              <button onClick={(e) => { e.stopPropagation(); setShowStatusOptions(false); }} className="w-full flex items-center gap-2 px-4 py-2 border-b border-zinc-50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider hover:bg-zinc-50">
                <ChevronLeft size={14} /> Kembali
              </button>
              {['Diproses', 'Selesai', 'Dibatalkan'].map((status) => (
                <button key={status} onClick={() => handleUpdateStatus(status)} className={`w-full text-left px-11 py-2.5 text-[13px] hover:bg-zinc-50 transition-colors ${status === 'Dibatalkan' ? 'text-red-500' : 'text-zinc-600'}`}>
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- STAT CARD COMPONENT ---
export function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-100 flex justify-between items-start h-[135px] w-full shadow-sm">
      <div className="flex flex-col h-full justify-between text-left">
        <p className="text-[13px] font-bold text-zinc-800 tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-zinc-900 leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-green-500'}`}>
            {!isNeutral && <ArrowUpRight size={14} strokeWidth={3} />} {trend}
          </p>
        </div>
      </div>
      <div className="p-2.5 rounded-lg border border-zinc-50 bg-white flex items-center justify-center text-amber-400 shadow-sm">
        {icon}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0, completedOrders: 0, totalUsers: 0 });
  const [activeRepairs, setActiveRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Ambil Semua Data Transaksi untuk Statistik
      const { data: allTrans, error: transError } = await supabase
        .from('transaksi')
        .select('total_bayar, status');

      if (transError) throw transError;

      // 2. Ambil Total Pelanggan
      const { count: userCount } = await supabase
        .from('pelanggan')
        .select('*', { count: 'exact', head: true });

      if (allTrans) {
        // Kalkulasi Statistik Dinamis
        const totalIncome = allTrans.reduce((acc, curr) => acc + Number(curr.total_bayar || 0), 0);
        
        // Pesanan Aktif (Status yang bukan Selesai atau Dibatalkan/Diambil)
        const pending = allTrans.filter(t => t.status !== 'Selesai' && t.status !== 'Diambil' && t.status !== 'Dibatalkan').length;
        
        // Reparasi Selesai (Hanya yang statusnya Selesai)
        const completed = allTrans.filter(t => t.status === 'Selesai').length;

        setStats({
          totalSales: totalIncome,
          pendingOrders: pending,
          completedOrders: completed,
          totalUsers: userCount || 0
        });
      }

      // 3. Ambil 5 Data Terbaru untuk Tabel
      const { data: repairs } = await supabase
        .from('transaksi')
        .select('*')
        .neq('status', 'Diambil')
        .order('tanggal', { ascending: false })
        .limit(5);
      
      if (repairs) setActiveRepairs(repairs);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full space-y-6">
        {/* HEADER */}
        {/* <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-[22px] font-bold text-zinc-900">Dashboard Ringkasan</h1>
            <p className="text-[13px] text-zinc-400 mt-1">Pantau performa toko dan progres reparasi secara real-time</p>
          </div>
          <button onClick={fetchDashboardData} disabled={loading} className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all bg-white shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div> */}

        {/* STATS DINAMIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard 
            title="Total Pendapatan" 
            value={stats.totalSales >= 1000000 ? `Rp ${(stats.totalSales/1000000).toFixed(1)}jt` : `Rp ${stats.totalSales.toLocaleString('id-ID')}`} 
            sub="/ Akumulasi" 
            trend="Pendapatan kotor" 
            icon={<Receipt size={18} />} 
          />
          <StatCard 
            title="Pesanan Aktif" 
            value={stats.pendingOrders} 
            sub="/ Unit" 
            trend="Sedang dikerjakan" 
            isNeutral 
            icon={<Clock size={18} />} 
          />
          <StatCard 
            title="Reparasi Selesai" 
            value={stats.completedOrders} 
            sub="/ Unit" 
            trend="Siap diambil" 
            icon={<CheckCircle2 size={18} />} 
          />
          <StatCard 
            title="Total Pelanggan" 
            value={stats.totalUsers} 
            sub="/ Orang" 
            trend="Database member" 
            icon={<Users size={18} />} 
          />
        </div>

        {/* CHARTS */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="bg-white p-6 rounded-xl border border-zinc-100 min-h-[400px] flex flex-col text-left shadow-sm">
            <h3 className="text-[15px] font-bold mb-4">Grafik Penjualan</h3>
            <div className="flex-1 w-full"><TransactionAreaChart /></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-100 min-h-[400px] flex flex-col text-left shadow-sm">
            <h3 className="text-[15px] font-bold mb-4">Stok Bahan Terendah</h3>
            <div className="flex-1 w-full"><StockBarChart /></div>
          </div>
        </div> */}

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm w-full">
          <div className="p-6 border-b border-zinc-50 flex justify-between items-center text-left">
            <div className="space-y-1">
              <h3 className="text-[16px] font-bold text-zinc-900">Status Reparasi Aktif</h3>
              <p className="text-[12px] text-zinc-400">5 transaksi terbaru yang sedang diproses</p>
            </div>
            <button onClick={() => router.push('/admin/transaksi')} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-50">
                  <th className="py-4 px-6">Kode Order</th>
                  <th className="py-4 px-6">Nama Pelanggan</th>
                  <th className="py-4 px-6">Kategori & Jasa</th>
                  <th className="py-4 px-6">Status Transaksi</th>
                  <th className="py-4 px-6">Status Pembayaran</th>
                  <th className="py-4 px-6">Waktu Masuk</th>
                  <th className="py-4 px-6 text-right">Sisa Tagihan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-10 text-center text-zinc-300 text-sm italic">Memuat data...</td></tr>
                ) : activeRepairs.map((item) => {
                  const sisaTagihan = Number(item.total_bayar || 0) - Number(item.dp_dibayar || 0);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-bold text-zinc-800">{item.invoice_code || `#${item.id}`}</td>
                      <td className="py-4 px-6 text-[13px] font-bold text-zinc-700">{item.nama_pelanggan || "Umum"}</td>
                      <td className="py-4 px-6 text-[13px] text-zinc-600 font-medium">
                        <div className="flex flex-col">
                          <span>{item.kategori || "—"}</span>
                          <span className="text-[11px] text-zinc-400">{item.jenis_jasa || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                          item.status === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' : 
                          item.status === 'Dibatalkan' ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {item.status || 'Proses'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                          item.status_pembayaran === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {item.status_pembayaran || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[12px] text-zinc-500 font-medium">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-4 px-6 text-right text-[13px] font-bold text-zinc-900">Rp {sisaTagihan.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-6 text-right">
                        <ActionDropdown item={item} onRefresh={fetchDashboardData} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}