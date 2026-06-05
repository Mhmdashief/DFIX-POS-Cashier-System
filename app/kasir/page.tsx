"use client";

import { useEffect, useState } from "react";
import {
  Receipt, Clock, CheckCircle2,
  Users, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getDashboardStats,
} from "@/app/actions/transaction";
import { StatCard } from "@/components/StatCard";



export default function KasirDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0, completedOrders: 0, totalUsers: 0 });
  const [activeRepairs, setActiveRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();

      if (data) {
        setStats({
          totalSales: data.totalIncome,
          pendingOrders: data.pending,
          completedOrders: data.completed,
          totalUsers: data.customerCount
        });
        setActiveRepairs(data.latestTransactions);
      }
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
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-[22px] font-bold text-zinc-900">Dashboard Kasir</h1>
            <p className="text-[13px] text-zinc-400 mt-1">Pantau progres reparasi dan transaksi secara real-time</p>
          </div>
          <button onClick={fetchDashboardData} disabled={loading} className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all bg-white shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* STATS DINAMIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard
            title="Total Pendapatan"
            value={stats.totalSales >= 1000000 ? `Rp ${(stats.totalSales / 1000000).toFixed(1)}jt` : `Rp ${stats.totalSales.toLocaleString('id-ID')}`}
            sub="/ Bulan Ini"
            trend="Reset tiap tanggal 1"
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

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm w-full">
          <div className="p-6 border-b border-zinc-50 flex justify-between items-center text-left">
            <div className="space-y-1">
              <h3 className="text-[16px] font-bold text-zinc-900">Status Reparasi Aktif</h3>
              <p className="text-[12px] text-zinc-400">5 transaksi terbaru yang sedang diproses</p>
            </div>
            <button onClick={() => router.push('/kasir/transaksi')} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">Lihat Semua</button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-10 text-center text-zinc-300 text-sm italic">Memuat data...</td></tr>
                ) : activeRepairs.map((item) => {
                  const sisaTagihan = Number(item.totalAmount || 0) - Number(item.dpAmount || 0);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => router.push(`/kasir/transaksi/${item.id}`)}>
                        {item.invoiceCode || `#${item.id.slice(0, 8)}`}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-bold text-zinc-700">{item.customer?.name || item.customerName || "Umum"}</td>
                      <td className="py-4 px-6 text-[13px] text-zinc-600 font-medium">
                        {item.items && item.items.length > 0 ? (() => {
                          const uniqueServices = [...new Set(item.items.map((it: any) => it.serviceName).filter(Boolean))];
                          const uniqueCategories = [...new Set(item.items.map((it: any) => it.category).filter(Boolean))];
                          return (
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-700">{uniqueServices.length > 0 ? uniqueServices.join(", ") : "—"}</span>
                              <span className="text-[11px] text-zinc-400">{uniqueCategories.length > 0 ? uniqueCategories.join(", ") : `${item.items.length} barang`}</span>
                            </div>
                          );
                        })() : (
                          <div className="flex flex-col">
                            <span>{item.category || "—"}</span>
                            <span className="text-[11px] text-zinc-400">{item.serviceName || "—"}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${item.orderStatus === 'SELESAI' ? 'bg-green-50 text-green-600 border-green-100' :
                            item.orderStatus === 'BATAL' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          {item.orderStatus || 'DIPROSES'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${item.paymentStatus === 'LUNAS' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                          {item.paymentStatus || 'BELUM BAYAR'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[12px] text-zinc-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-4 px-6 text-right text-[13px] font-bold text-zinc-900">Rp {sisaTagihan.toLocaleString('id-ID')}</td>
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