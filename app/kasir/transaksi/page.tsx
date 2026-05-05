"use client";

import { Search, Plus, Filter, MoreHorizontal, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard"; // Pastikan Anda memiliki komponen ini

// Helper untuk Badge Status Transaksi
const getStatusTrans = (status: string) => {
  if (status === "Selesai") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Diproses") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Dibatalkan
};

// Helper untuk Badge Status Pembayaran
const getStatusBayar = (status: string) => {
  if (status === "Lunas") return "bg-green-50 text-green-700 border-green-200";
  if (status === "DP Bayar") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Belum Bayar
};

const transaksiData = [
  { kode: "DFX-24031", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", statusT: "Diproses", statusP: "DP Bayar", waktu: "11:40" },
  { kode: "DFX-24032", nama: "Budi Santoso", jasa: "Custom • Tas", extra: "+2", statusT: "Selesai", statusP: "Lunas", waktu: "25 Maret 2026" },
  { kode: "DFX-24033", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", extra: "+2", statusT: "Diproses", statusP: "Belum Bayar", waktu: "24 Maret 2026" },
];

export default function TransaksiReparasiKasir() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Section (Ringkasan Kasir) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transaksi" value="24" sub="+5 dibanding kemarin" icon={FileText} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Transaksi Diproses" value="3" sub="+3 dibanding kemarin" icon={Clock} colorClass="text-amber-600 bg-amber-50" />
        <StatCard title="Transaksi Selesai" value="5" sub="+2 dibanding kemarin" icon={CheckCircle} colorClass="text-green-600 bg-green-50" />
        <StatCard title="Transaksi Dibatalkan" value="2" sub="+1 dibanding kemarin" icon={XCircle} colorClass="text-rose-600 bg-rose-50" />
      </section>

      {/* 2. Controls & Table Section */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Transaksi Reparasi Customer</h2>
            <p className="text-sm text-zinc-500">Daftar seluruh transaksi reparasi yang sedang berjalan dan dapat dikelola oleh kasir</p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                <Filter size={18} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={18} /> Tambah Pelanggan
            </button>
          </div>
        </div>

        {/* Tabel Data */}
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
                  <td className="py-4 font-medium text-zinc-900">{row.kode}</td>
                  <td className="py-4 text-zinc-600">{row.nama}</td>
                  <td className="py-4 text-zinc-600 flex items-center gap-2">
                    {row.jasa}
                    <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-medium">{row.extra}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusTrans(row.statusT)}`}>
                        {row.statusT}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBayar(row.statusP)}`}>
                        {row.statusP}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-500">{row.waktu}</td>
                  <td className="py-4 text-right text-zinc-400 cursor-pointer hover:text-zinc-900">
                    <MoreHorizontal size={18} />
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