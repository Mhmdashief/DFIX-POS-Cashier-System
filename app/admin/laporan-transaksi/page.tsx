"use client";

import { Download, Search, Filter, FilterIcon, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard";

// Helper untuk Badge Status
const getStatusPembayaran = (status: string) => {
  if (status === "Lunas") return "bg-green-50 text-green-700 border-green-200";
  if (status === "DP Bayar") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Belum Bayar
};

const getStatusPengerjaan = (status: string) => {
  if (status === "Selesai") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Diproses") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Dibatalkan
};

const laporanData = [
  { tanggal: "26 Maret 2026", kode: "TRX-001", nama: "Budi", kategori: "Reparasi • Sepatu", extra: "+2", harga: "Rp150.000", bayar: "DP Bayar", proses: "Selesai" },
  { tanggal: "26 Maret 2026", kode: "TRX-001", nama: "Budi", kategori: "Reparasi • Sepatu", extra: "+2", harga: "Rp150.000", bayar: "Lunas", proses: "Diproses" },
  { tanggal: "26 Maret 2026", kode: "TRX-001", nama: "Budi", kategori: "Reparasi • Sepatu", extra: "+2", harga: "Rp150.000", bayar: "Belum Bayar", proses: "Diproses" },
  { tanggal: "26 Maret 2026", kode: "TRX-001", nama: "Budi", kategori: "Reparasi • Sepatu", extra: "+2", harga: "Rp150.000", bayar: "Lunas", proses: "Diproses" },
  { tanggal: "26 Maret 2026", kode: "TRX-001", nama: "Budi", kategori: "Reparasi • Sepatu", extra: "+2", harga: "Rp150.000", bayar: "Belum Bayar", proses: "Dibatalkan" },
];

export default function LaporanTransaksiPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transaksi" value="128" sub="+12 dibanding Periode Lalu" icon={Filter} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Total Pendapatan" value="Rp125.000" sub="+12 dibanding Periode Lalu" icon={Filter} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Belum Lunas" value="15" sub="+12 dibanding Periode Lalu" icon={Filter} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Transaksi Selesai" value="20" sub="+10% dari bulan lalu" icon={Filter} colorClass="text-zinc-600 bg-zinc-100" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900">Laporan Penggunaan Transaksi</h2>
            <p className="text-sm text-zinc-500">Menampilkan data transaksi sebagai dasar evaluasi</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                <FilterIcon size={18} /> Status
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                <FilterIcon size={18} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Download size={18} /> Export Laporan
            </button>
        </div>
      </section>

      {/* 3. Table Section */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="pb-4 font-medium">Tanggal</th>
                <th className="pb-4 font-medium">Kode Transaksi</th>
                <th className="pb-4 font-medium">Nama Pelanggan</th>
                <th className="pb-4 font-medium">Kategori & Jasa</th>
                <th className="pb-4 font-medium">Total Harga</th>
                <th className="pb-4 font-medium">Status Pembayaran</th>
                <th className="pb-4 font-medium">Status Pengerjaan</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {laporanData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.tanggal}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.kode}</td>
                  <td className="py-4 text-zinc-600">{row.nama}</td>
                  <td className="py-4 text-zinc-600 flex items-center gap-2">
                    {row.kategori}
                    <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-medium">{row.extra}</span>
                  </td>
                  <td className="py-4 font-medium text-zinc-900">{row.harga}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusPembayaran(row.bayar)}`}>
                        {row.bayar}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusPengerjaan(row.proses)}`}>
                        {row.proses}
                    </span>
                  </td>
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