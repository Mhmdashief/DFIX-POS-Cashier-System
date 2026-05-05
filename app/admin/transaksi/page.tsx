"use client";

import { Receipt, Clock, CheckCircle2, Search, Plus, Calendar, MoreHorizontal, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard"; // Pastikan path ini sesuai dengan project Anda

// Helper untuk Badge Status Transaksi
const getStatusBadge = (status: string) => {
  if (status === "Diproses") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "Selesai") return "bg-green-50 text-green-700 border-green-200";
  return "bg-zinc-50 text-zinc-700";
};

// Helper untuk Badge Status Pembayaran
const getPaymentBadge = (payment: string) => {
  if (payment === "Lunas") return "bg-green-50 text-green-700 border-green-200";
  if (payment === "DP Bayar") return "bg-blue-50 text-blue-700 border-blue-200";
  if (payment === "Belum Bayar") return "bg-red-50 text-red-700 border-red-200";
  return "bg-zinc-50 text-zinc-700";
};

const transaksiData = [
  { id: "DFX-24031", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", status: "Diproses", bayar: "DP Bayar", waktu: "11:40" },
  { id: "DFX-24032", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", status: "Diproses", bayar: "DP Bayar", waktu: "11:40" },
  { id: "DFX-24033", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", status: "Diproses", bayar: "DP Bayar", waktu: "11:40" },
  { id: "DFX-24034", nama: "Budi Santoso", jasa: "Custom • Tas", extra: "+2", status: "Selesai", bayar: "Lunas", waktu: "25 Maret 2026" },
  { id: "DFX-24035", nama: "Budi Santoso", jasa: "Custom • Tas", extra: "+2", status: "Selesai", bayar: "Lunas", waktu: "25 Maret 2026" },
  { id: "DFX-24036", nama: "Budi Santoso", jasa: "Custom • Tas", extra: "+2", status: "Selesai", bayar: "Lunas", waktu: "25 Maret 2026" },
  { id: "DFX-24037", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", status: "Diproses", bayar: "Belum Bayar", waktu: "24 Maret 2026" },
];

export default function TransaksiReparasiPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transaksi" value="24" sub="+5 dibanding kemarin" icon={Receipt} colorClass="text-blue-500 bg-blue-50" />
        <StatCard title="Transaksi Diproses" value="3" sub="+3 dibanding kemarin" icon={Clock} colorClass="text-yellow-500 bg-yellow-50" />
        <StatCard title="Transaksi Selesai" value="5" sub="+2 dibanding kemarin" icon={CheckCircle2} colorClass="text-green-500 bg-green-50" />
        <StatCard title="Transaksi Dibatalkan" value="2" sub="+1 dibanding kemarin" icon={XCircle} colorClass="text-red-500 bg-red-50" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-900">Transaksi Reparasi Customer</h2>
            <p className="text-sm text-zinc-500">Daftar seluruh transaksi reparasi yang sedang berjalan dan dapat dikelola oleh kasir</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                <Plus size={18} /> Tambah Pelanggan
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                <Calendar size={18} /> Filter
            </button>
        </div>
      </section>

      {/* 3. Table Section */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="pb-4 font-medium">Kode Order</th>
                <th className="pb-4 font-medium">Nama Pelanggan</th>
                <th className="pb-4 font-medium">Kategori & Jasa</th>
                <th className="pb-4 font-medium">Status Transaksi</th>
                <th className="pb-4 font-medium">Status Pembayaran</th>
                <th className="pb-4 font-medium">Waktu Masuk</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transaksiData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 font-semibold text-zinc-900">{row.id}</td>
                  <td className="py-4 text-zinc-600">{row.nama}</td>
                  <td className="py-4 text-zinc-600 flex items-center gap-2">
                    {row.jasa}
                    <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-medium">{row.extra}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadge(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPaymentBadge(row.bayar)}`}>{row.bayar}</span>
                  </td>
                  <td className="py-4 text-zinc-500">{row.waktu}</td>
                  <td className="py-4 text-right text-zinc-400">
                    <MoreHorizontal size={18} className="inline cursor-pointer hover:text-zinc-600"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}