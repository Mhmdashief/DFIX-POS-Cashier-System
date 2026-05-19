"use client";

import React, { useEffect, useState } from "react";
import {
  Receipt, Clock, CheckCircle2, Search, Filter, ChevronDown, XCircle, Loader2, ShieldAlert
} from "lucide-react";
import { getTransactions } from "@/app/actions/transaction";

// ─── LOCAL STAT CARD (read-only display) ─────────────────────────────────────
function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-start h-[120px] w-full font-sans shadow-sm">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[13px] font-bold text-[#161616] tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-[#161616] leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-1.5 font-bold ${isNeutral ? "text-zinc-400" : "text-[#34C759]"}`}>
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

export default function AdminTransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

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

  const filteredData = transactions.filter(t => {
    const matchesSearch =
      (t.customer?.name || t.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || "").toString().includes(searchQuery) ||
      (t.invoiceCode || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" ? true : (t.orderStatus || "Diproses") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Order" value={transactions.length} sub="Order" trend="Update real-time" icon={<Receipt size={20} />} />
        <StatCard title="Selesai" value={transactions.filter(t => t.orderStatus === "Selesai").length} sub="Order" trend="Siap diambil" icon={<CheckCircle2 size={20} />} />
        <StatCard title="Diproses" value={transactions.filter(t => !t.orderStatus || t.orderStatus === "Diproses").length} sub="Order" trend="Dikerjakan" isNeutral icon={<Clock size={20} />} />
        <StatCard title="Dibatalkan" value={transactions.filter(t => t.orderStatus === "Dibatalkan").length} sub="Order" trend="Gagal/Batal" icon={<XCircle size={20} />} />
      </div>


      {/* MAIN TABLE */}
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-fit">
            <h1 className="text-[18px] font-bold text-zinc-900">Transaksi Reparasi</h1>
            <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Riwayat Pengerjaan Customer — Read Only</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative flex-1 md:w-64 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
              <input
                type="text"
                placeholder="Cari pelanggan / invoice..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FILTER STATUS */}
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

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-50 bg-zinc-50/30">
                <th className="py-4 px-6">Kode Order</th>
                <th className="py-4 px-6">Nama Pelanggan</th>
                <th className="py-4 px-6">Kategori &amp; Jasa</th>
                <th className="py-4 px-6 text-center">Status Transaksi</th>
                <th className="py-4 px-6 text-center">Status Pembayaran</th>
                <th className="py-4 px-6">Tanggal Masuk</th>
                <th className="py-4 px-6 text-right">Sisa Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#2D4F53]" size={28} />
                      <p className="text-zinc-400 font-bold text-[12px] tracking-widest uppercase">Memuat Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <p className="text-zinc-400 font-bold text-sm">Tidak ada transaksi yang ditemukan.</p>
                  </td>
                </tr>
              ) : filteredData.map((item) => {
                const sisaTagihan = Number(item.totalAmount || 0) - Number(item.dpAmount || 0);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-[#2D4F53] text-[13px] font-mono">
                      {item.invoiceCode || `TRX-${item.id.slice(0, 8)}`}
                    </td>
                    <td className="py-5 px-6 font-bold text-[14px] text-zinc-800">
                      {item.customer?.name || item.customerName || "Umum"}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-zinc-700">{item.category || "—"}</span>
                        <span className="text-[11px] text-zinc-400 font-bold uppercase italic tracking-tight">{item.serviceName || "—"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                        item.orderStatus === "Selesai"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : item.orderStatus === "Dibatalkan"
                          ? "bg-red-50 text-red-500 border-red-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {item.orderStatus || "Diproses"}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                        item.paymentStatus === "LUNAS"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-blue-50 text-blue-500 border-blue-100"
                      }`}>
                        {item.paymentStatus === "LUNAS" ? "LUNAS" : "DP BAYAR"}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-zinc-500 font-bold text-[12px]">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className={`py-5 px-6 text-right font-black text-[13px] ${sisaTagihan > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      Rp {sisaTagihan.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}