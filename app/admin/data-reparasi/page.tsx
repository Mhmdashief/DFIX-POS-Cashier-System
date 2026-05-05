"use client";

import { Wrench, Search, Plus, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard"; // Pastikan path benar

const jasaData = [
  { no: "01", nama: "Reparasi", kategori: "Sepatu, Tas, Jaket", extra: "+2", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
  { no: "02", nama: "Customisasi", kategori: "Sepatu, Tas, Jaket", extra: "+2", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
  { no: "03", nama: "Re-Coloring", kategori: "Sepatu, Tas, Jaket", extra: "+2", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
  { no: "04", nama: "Laundry SPA", kategori: "Sepatu, Tas, Jaket", extra: "+2", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
  { no: "05", nama: "Chrome Barang", kategori: "Sepatu, Tas, Jaket", extra: "+2", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
  { no: "06", nama: "Duplikat Kunci", kategori: "Kunci", extra: "", status: "Aktif", dibuat: "10 Feb 2026", update: "10 Feb 2026" },
];

export default function DataJasaPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Jenis Jasa" value="6" sub="Total jenis layanan tersedia" icon={Wrench} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Jasa Aktif" value="5" sub="Layanan dapat dipilih kasir" icon={Wrench} colorClass="text-green-600 bg-green-50" />
        <StatCard title="Jasa Nonaktif" value="1" sub="Layanan tidak tersedia" icon={Wrench} colorClass="text-amber-600 bg-amber-50" />
      </section>

      {/* 2. Header & Controls Section */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">Tabel Data Jasa</h2>
        <p className="text-sm text-zinc-500">Section ini menampilkan seluruh daftar jenis jasa reparasi yang tersedia</p>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
            <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={18} /> Tambah Jasa
            </button>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
            </div>
        </div>
      </section>

      {/* 3. Table Section */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="pb-4 font-medium">No</th>
                <th className="pb-4 font-medium">Nama Jasa</th>
                <th className="pb-4 font-medium">Kategori</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Dibuat</th>
                <th className="pb-4 font-medium">Update</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {jasaData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.no}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600 flex items-center gap-2">
                    {row.kategori}
                    {row.extra && <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-medium">{row.extra}</span>}
                  </td>
                  <td className="py-4">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                        {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-500">{row.dibuat}</td>
                  <td className="py-4 text-zinc-500">{row.update}</td>
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