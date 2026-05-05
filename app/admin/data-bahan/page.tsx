"use client";

import { Package, ShieldCheck, AlertTriangle, XCircle, Search, Plus, Calendar, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard"; // Pastikan path benar

// Helper untuk Badge Status Bahan
const getStatusBadge = (status: string) => {
  if (status === "Aman") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Menipis") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Habis
};

const dataBahan = [
  { no: "01", nama: "Lem Sepatu", varian: "Perekat", kategori: "Resleting", stok: "15 Botol", status: "Aman", update: "07 Feb 2026" },
  { no: "02", nama: "Ring D", varian: "Gold - 2 cm", kategori: "Aksesoris", stok: "12 Pcs", status: "Aman", update: "10 Feb 2026" },
  { no: "03", nama: "Lem Kuning", varian: "-", kategori: "Lem", stok: "3 Pcs", status: "Menipis", update: "11 Feb 2026" },
  { no: "04", nama: "Ring D", varian: "Gold - 2 cm", kategori: "Aksesoris", stok: "12 Pcs", status: "Habis", update: "10 Feb 2026" },
  { no: "05", nama: "Lem Kuning", varian: "-", kategori: "Lem", stok: "3 Pcs", status: "Menipis", update: "11 Feb 2026" },
];

export default function DataBahanPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Bahan" value="24" sub="Stok bahan" icon={Package} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Stok Aman" value="18" sub="Stok tersedia" icon={ShieldCheck} colorClass="text-green-600 bg-green-50" />
        <StatCard title="Stok Menipis" value="4" sub="Perlu restock" icon={AlertTriangle} colorClass="text-amber-600 bg-amber-50" />
        <StatCard title="Stok Habis" value="2" sub="Segera tambah" icon={XCircle} colorClass="text-rose-600 bg-rose-50" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900">Manajemen Bahan</h2>
            <p className="text-sm text-zinc-500">Mengatur stock bahan pada toko</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={18} /> Tambah Bahan
            </button>
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
            </div>
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
                <th className="pb-4 font-medium">No</th>
                <th className="pb-4 font-medium">Nama Bahan</th>
                <th className="pb-4 font-medium">Varian</th>
                <th className="pb-4 font-medium">Kategori</th>
                <th className="pb-4 font-medium">Stok/Satuan</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Update</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {dataBahan.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.no}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.varian}</td>
                  <td className="py-4 text-zinc-600">{row.kategori}</td>
                  <td className="py-4 text-zinc-600">{row.stok}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(row.status)}`}>
                        {row.status}
                    </span>
                  </td>
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