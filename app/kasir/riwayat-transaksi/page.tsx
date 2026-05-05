"use client";

import { Search, Filter, MoreHorizontal, ChevronDown } from "lucide-react";

// Helper untuk warna badge status pembayaran
const getStatusPayColor = (status: string) => {
  switch (status) {
    case "Lunas":
      return "bg-green-50 text-green-700 border-green-200";
    case "DP Bayar":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Belum Bayar":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
};

// Data contoh (Mock Data)
const riwayatData = [
  { nama: "Budi Santoso", jasa: "Reparasi • Sepatu", statusT: "Selesai", statusP: "DP Bayar", waktu: "11:40", tagihan: "Rp100.000" },
  { nama: "Budi Santoso", jasa: "Custom • Tas", statusT: "Selesai", statusP: "Lunas", waktu: "25 Maret 2026", tagihan: "Rp0" },
  { nama: "Budi Santoso", jasa: "Reparasi • Sepatu", statusT: "Selesai", statusP: "Belum Bayar", waktu: "24 Maret 2026", tagihan: "Rp200.000" },
  { nama: "Budi Santoso", jasa: "Custom • Tas", statusT: "Selesai", statusP: "Lunas", waktu: "23 Maret 2026", tagihan: "Rp0" },
];

export default function RiwayatTransaksiKasir() {
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Transaksi Reparasi Customer</h2>
            <p className="text-sm text-zinc-500">Daftar seluruh transaksi reparasi yang sedang berjalan dan dapat dikelola oleh kasir</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 w-full md:w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50">
              <Filter size={18} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50">
              Status <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="pb-4 font-medium">Nama Pelanggan</th>
                <th className="pb-4 font-medium">Jasa & Barang</th>
                <th className="pb-4 font-medium">Status Transaksi</th>
                <th className="pb-4 font-medium">Status Pembayaran</th>
                <th className="pb-4 font-medium">Waktu Masuk</th>
                <th className="pb-4 font-medium">Sisa Tagihan</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {riwayatData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.jasa}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                      {row.statusT}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusPayColor(row.statusP)}`}>
                      {row.statusP}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-500">{row.waktu}</td>
                  <td className="py-4 font-semibold text-zinc-900">{row.tagihan}</td>
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