"use client";

import { Download, Search, Filter, FilterIcon, Package, AlertTriangle, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard"; 

// Helper untuk Badge Status
const getStatusBadge = (status: string) => {
  if (status === "Masuk") return "bg-green-50 text-green-700 border-green-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Keluar
};

const laporanBahanData = [
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Masuk", qty: "+10 Pcs", ref: "RESTOCK-01" },
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Masuk", qty: "+10 Pcs", ref: "RESTOCK-01" },
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Masuk", qty: "+10 Pcs", ref: "RESTOCK-01" },
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Keluar", qty: "-10 Pcs", ref: "TRX-01" },
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Keluar", qty: "-10 Pcs", ref: "TRX-02" },
  { tanggal: "26 Maret 2026", bahan: "Lem A", varian: "Perekat", kategori: "Resleting", type: "Keluar", qty: "-10 Pcs", ref: "TRX-03" },
];

export default function LaporanBahanPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Stok Menipis" value="6" sub="Jumlah transaksi dalam periode yang dipilih" icon={AlertTriangle} colorClass="text-amber-600 bg-amber-50" />
        <StatCard title="Stok Habis" value="6" sub="Bahan yang sudah tidak tersedia di gudang" icon={XCircle} colorClass="text-rose-600 bg-rose-50" />
        <StatCard title="Total Bahan" value="15" sub="Jumlah jenis bahan yang terdaftar di sistem" icon={Package} colorClass="text-zinc-600 bg-zinc-100" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900">Laporan Penggunaan Bahan</h2>
            <p className="text-sm text-zinc-500">Menampilkan data bahan sebagai dasar evaluasi</p>
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
                <th className="pb-4 font-medium">Bahan</th>
                <th className="pb-4 font-medium">Varian</th>
                <th className="pb-4 font-medium">Kategori</th>
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 font-medium">Qty</th>
                <th className="pb-4 font-medium">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {laporanBahanData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.tanggal}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.bahan}</td>
                  <td className="py-4 text-zinc-600">{row.varian}</td>
                  <td className="py-4 text-zinc-600">{row.kategori}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(row.type)}`}>
                        {row.type}
                    </span>
                  </td>
                  <td className={`py-4 font-semibold ${row.type === 'Masuk' ? 'text-green-600' : 'text-rose-600'}`}>
                    {row.qty}
                  </td>
                  <td className="py-4 text-zinc-600 font-medium">{row.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}