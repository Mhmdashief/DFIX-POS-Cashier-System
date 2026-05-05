"use client";

import { User, Users, UserPlus, Search, Plus, Calendar, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const customerData = [
  { no: "01", nama: "Bintang Sakti", hp: "08976257489", alamat: "Jl. Patriot no 26 Kepuh", transaksi: "5", terakhir: "07 Feb 2026 09:12" },
  { no: "02", nama: "Budi Santoso", hp: "08123456789", alamat: "Jl. Merdeka no 10", transaksi: "50", terakhir: "07 Feb 2026 09:12" },
  { no: "03", nama: "Andi Wijaya", hp: "08567890123", alamat: "Perum Indah B-12", transaksi: "12", terakhir: "06 Feb 2026 14:00" },
  { no: "04", nama: "Siti Aminah", hp: "08112233445", alamat: "Jl. Bunga Melati no 5", transaksi: "8", terakhir: "05 Feb 2026 10:30" },
];

export default function DataPelangganPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pelanggan" value="50" sub="Total pelanggan terdaftar" icon={Users} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Pelanggan Baru" value="10" sub="Baru pertama transaksi" icon={UserPlus} colorClass="text-blue-600 bg-blue-50" />
        <StatCard title="Pelanggan Aktif" value="10" sub="Sedang melakukan transaksi" icon={User} colorClass="text-green-600 bg-green-50" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900">Data Seluruh Pelanggan</h2>
            <p className="text-sm text-zinc-500">Mengatur Seluruh Data Pelanggan</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={18} /> Tambah Pelanggan
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
                <th className="pb-4 font-medium">Nama</th>
                <th className="pb-4 font-medium">No Hp</th>
                <th className="pb-4 font-medium">Alamat</th>
                <th className="pb-4 font-medium">Total Transaksi</th>
                <th className="pb-4 font-medium">Terakhir Transaksi</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customerData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.no}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.hp}</td>
                  <td className="py-4 text-zinc-600">{row.alamat}</td>
                  <td className="py-4 text-zinc-600">{row.transaksi}</td>
                  <td className="py-4 text-zinc-500">{row.terakhir}</td>
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