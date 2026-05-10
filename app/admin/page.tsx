"use client";

import React, { useEffect, useState } from "react";
import { 
  Receipt, Clock, CheckCircle2, MoreHorizontal, 
  ArrowUpRight, Users, RefreshCw 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TransactionAreaChart, StockBarChart } from "@/components/DashboardCharts";

// --- NAMED EXPORT: StatCard ---
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Ambil 5 Transaksi Terbaru
      const { data: trans } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false })
        .limit(5);
      
      if (trans) setRecentTransactions(trans);

      // 2. Ambil Semua Transaksi untuk Hitung Total Pendapatan
      const { data: allTrans } = await supabase.from('transaksi').select('total_bayar, status_pembayaran');
      const totalIncome = allTrans?.reduce((acc, curr) => acc + Number(curr.total_bayar), 0) || 0;
      const completed = allTrans?.filter(t => t.status_pembayaran === 'Selesai').length || 0;

      // 3. Ambil Jumlah Pelanggan
      const { count: userCount } = await supabase
        .from('pelanggan')
        .select('*', { count: 'exact', head: true });

      // 4. Hitung Barang yang Hampir Habis (Dummy untuk stat pending/pending context)
      // Di sini kita asumsikan 'pending' adalah transaksi yang butuh perhatian
      setStats({
        totalSales: totalIncome,
        pendingOrders: 0, // Bisa dihubungkan ke status khusus jika ada
        completedOrders: completed,
        totalUsers: userCount || 0,
      });

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-bold text-[#161616]">Dashboard Ringkasan</h1>
            <p className="text-[13px] text-zinc-400 mt-1">Pantau performa toko dan aktivitas pengguna hari ini</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard 
            title="Total Pendapatan" 
            value={stats.totalSales >= 1000000 
              ? `Rp ${(stats.totalSales/1000000).toFixed(1)}jt` 
              : `Rp ${stats.totalSales.toLocaleString('id-ID')}`
            } 
            sub="/ Akumulasi" 
            trend="Update real-time" 
            icon={<Receipt size={18} />} 
          />
          <StatCard 
            title="Pesanan Pending" 
            value={stats.pendingOrders} 
            sub="/ Perlu proses" 
            trend="Antrean layanan" 
            isNeutral 
            icon={<Clock size={18} />} 
          />
          <StatCard 
            title="Pesanan Selesai" 
            value={stats.completedOrders} 
            sub="/ Transaksi sukses" 
            trend="Total nota masuk" 
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

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-none h-[400px]">
            <h3 className="text-[15px] font-bold mb-4 tracking-tight">Grafik Penjualan</h3>
            <TransactionAreaChart />
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-none h-[400px]">
            <h3 className="text-[15px] font-bold mb-4 tracking-tight">Stok Barang Terendah</h3>
            <StockBarChart />
          </div>
        </div>

        {/* --- RECENT TRANSACTIONS TABLE --- */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-none w-full">
          <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-[#161616]">Transaksi Terbaru</h3>
            <button className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wider">
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 text-[13px] font-medium border-b border-zinc-50">
                  <th className="py-4 px-6">ID Transaksi</th>
                  <th className="py-4 px-6">Pelanggan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Total</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-zinc-300 text-sm italic">Memuat data transaksi...</td></tr>
                ) : recentTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-zinc-300 text-sm italic">Belum ada transaksi terbaru.</td></tr>
                ) : recentTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 text-[14px] font-bold text-zinc-800">#{item.id.toString().slice(0, 8)}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-600 font-medium">{item.nama_pelanggan || "Umum"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${item.status_pembayaran === 'Selesai' ? 'bg-[#CEECD6] text-[#34C759]' : 'bg-zinc-100 text-zinc-400'}`}>
                        {item.status_pembayaran || 'Selesai'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-[14px] font-extrabold text-zinc-900">
                      Rp {Number(item.total_bayar).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
                        <MoreHorizontal size={18} className="text-zinc-400" />
                      </button>
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