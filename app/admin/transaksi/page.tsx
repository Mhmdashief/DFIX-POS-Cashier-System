"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt, Clock, CheckCircle2, Search, Plus,
  MoreHorizontal, ChevronDown, XCircle, Filter
} from "lucide-react";
import { getTransactions, updateTransactionStatusAction, deleteTransactionAction, updatePaymentStatusAction } from "@/app/actions/transaction";
import ModalTransaksiBaru from "@/components/ModalTransaksiBaru";



function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-start h-[135px] w-full font-sans shadow-sm">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[13px] font-bold text-[#161616] tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-[#161616] leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-[#34C759]'}`}>
            {trend}
          </p>
        </div>
      </div>
      <div className="p-2.5 rounded-xl border border-zinc-50 bg-white flex items-center justify-center text-[#F2C94C]">
        {icon}
      </div>
    </div>
  );
}

export default function RiwayatTransaksiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");


  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Gagal ambil data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updateTransactionStatusAction(id, newStatus);
      if (!result.success) throw new Error(result.error);
      fetchTransactions();
      setActiveMenu(null);
    } catch (error: any) {
      alert("Gagal update status");
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updatePaymentStatusAction(id, newStatus);
      if (!result.success) throw new Error(result.error);
      fetchTransactions();
      setActiveMenu(null);
    } catch (error: any) {
      alert("Gagal update status pembayaran");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        const result = await deleteTransactionAction(id);
        if (!result.success) throw new Error(result.error);
        fetchTransactions();
        setActiveMenu(null);
      } catch (error: any) {
        alert("Gagal menghapus data");
      }
    }
  };

  const filteredData = transactions.filter(t => {
    const matchesSearch = (t.nama_pelanggan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || "").toString().includes(searchQuery);
    const matchesStatus = statusFilter === "Semua" ? true : (t.status || "Diproses") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Order" value={transactions.length} sub="Order" trend="Update real-time" icon={<Receipt size={20} />} />
        <StatCard title="Selesai" value={transactions.filter(t => t.orderStatus === 'Selesai').length} sub="Order" trend="Siap diambil" icon={<CheckCircle2 size={20} />} />
        <StatCard title="Proses" value={transactions.filter(t => !t.orderStatus || t.orderStatus === 'Diproses').length} sub="Order" trend="Dikerjakan" isNeutral icon={<Clock size={20} />} />
        <StatCard title="Batal" value={transactions.filter(t => t.orderStatus === 'Dibatalkan').length} sub="Order" trend="Gagal" icon={<XCircle size={20} />} />
      </div>

      {/* MAIN TABLE BOX */}
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm relative z-0">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-fit">
            <h1 className="text-[18px] font-bold">Transaksi Reparasi</h1>
            <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-wider">Riwayat Pengerjaan Customer</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[13px] font-bold focus:outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>



            <div className="relative min-w-[150px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Filter size={14} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[13px] font-bold text-zinc-600 appearance-none focus:outline-none cursor-pointer hover:bg-zinc-100 transition-all"
              >
                <option value="Semua">Semua Status</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-50">
                <th className="py-5 px-6">Kode Order</th>
                <th className="py-5 px-6">Nama Pelanggan</th>
                <th className="py-5 px-6">Kategori & Jasa</th>
                <th className="py-5 px-6 text-center">Status Transaksi</th>
                <th className="py-5 px-6 text-center">Status Pembayaran</th>
                <th className="py-5 px-6">Waktu Masuk</th>
                <th className="py-5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center text-zinc-400 animate-pulse font-bold">Memuat data...</td></tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="py-6 px-6 font-bold text-[#2D4F53] text-[13px]">{item.invoiceCode || `TRX-${item.id.slice(0, 8)}`}</td>
                  <td className="py-6 px-6 font-bold text-[14px]">{item.customer?.name || item.customerName}</td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-zinc-700">{item.category}</span>
                      <span className="text-[11px] text-zinc-400 font-bold uppercase italic tracking-tight">{item.serviceName}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase 
                      ${item.orderStatus === 'Selesai' ? 'bg-[#CEECD6] text-[#34C759]' :
                        item.orderStatus === 'Dibatalkan' ? 'bg-red-50 text-red-500' : 'bg-[#E0F2FE] text-[#00A9F1]'}`}>
                      {item.orderStatus || "Diproses"}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase 
                          ${item.paymentStatus === 'LUNAS' ? 'bg-[#CEECD6] text-[#34C759]' : 'bg-blue-50 text-blue-500'}`}>
                      {item.paymentStatus === 'LUNAS' ? 'LUNAS' : 'DP BAYAR'}
                    </span>

                  </td>
                  <td className="py-6 px-6 text-zinc-500 font-bold text-[12px]">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="py-6 px-6 text-right relative">
                    <button onClick={() => { setActiveMenu(activeMenu === item.id ? null : item.id); setShowStatusOptions(false); setShowPaymentOptions(false); }} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                      <MoreHorizontal size={20} className="text-zinc-400" />
                    </button>

                    {activeMenu === item.id && (
                      <div className="absolute right-6 top-14 w-52 bg-white border border-zinc-100 rounded-2xl z-[100] py-2 shadow-xl animate-in fade-in zoom-in duration-200">
                        {/* PINDAH KE HALAMAN BARU */}
                        <button
                          onClick={() => router.push(`/admin/transaksi/${item.id}`)}
                          className="w-full px-5 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          Detail Transaksi
                        </button>

                        <div className="border-y border-zinc-50">
                          <button
                            onClick={() => { setShowStatusOptions(!showStatusOptions); setShowPaymentOptions(false); }}
                            className="w-full px-5 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex justify-between items-center"
                          >
                            Ubah Status <ChevronDown size={14} className={showStatusOptions ? 'rotate-180' : ''} />
                          </button>
                          {showStatusOptions && (
                            <div className="bg-zinc-50 py-1 border-t border-zinc-50">
                              {['Diproses', 'Selesai', 'Dibatalkan'].map(s => (
                                <button key={s} onClick={() => updateStatus(item.id, s)} className="w-full px-8 py-2 text-left text-[12px] font-black text-zinc-400 hover:text-[#2D4F53] uppercase">{s}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTransaction(item.id)}
                          className="w-full px-5 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50"
                        >
                          Hapus Transaksi
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
  );
}