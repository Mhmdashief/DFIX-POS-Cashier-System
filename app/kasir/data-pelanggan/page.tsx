"use client";

import { Search, Plus, Filter, MoreHorizontal, User } from "lucide-react";

// Komponen Card Statistik
const StatCard = ({ title, value, sub, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm text-zinc-500">{title}</h3>
      <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
        <Icon size={18} />
      </div>
    </div>
    <div className="mb-2">
      <span className="text-2xl font-bold text-zinc-900">{value}</span>
      <span className="text-sm text-zinc-400 ml-1">/Pelanggan</span>
    </div>
    <p className="text-xs text-green-600 font-medium">{sub}</p>
  </div>
);

const pelangganData = [
  { no: "01", nama: "Bintang Sakti", hp: "08976257489", alamat: "Jl. Patriot no 26 Kepuh", total: 5, terakhir: "07 Feb 2026 09:12" },
  { no: "02", nama: "Bintang Sakti", hp: "08976257489", alamat: "Jl. Patriot no 26 Kepuh", total: 50, terakhir: "07 Feb 2026 09:12" },
  { no: "03", nama: "Bintang Sakti", hp: "08976257489", alamat: "Jl. Patriot no 26 Kepuh", total: 70, terakhir: "07 Feb 2026 09:12" },
];

export default function DataPelanggan() {
  return (
    <div className="space-y-6 p-6">
      {/* 1. Statistik Pelanggan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pelanggan" value="50" sub="↗ Bertambah +2 dari kemaren" icon={User} />
        <StatCard title="Pelanggan Baru" value="10" sub="↗ Bertambah +2 dari kemaren" icon={User} />
        <StatCard title="Pelanggan Aktif" value="10" sub="↗ Bertambah +2 dari kemaren" icon={User} />
      </section>

      {/* 2. Tabel Data Pelanggan */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
              <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

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
              {pelangganData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-600">{row.no}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.hp}</td>
                  <td className="py-4 text-zinc-600">{row.alamat}</td>
                  <td className="py-4 text-zinc-600">{row.total}</td>
                  <td className="py-4 text-zinc-600">{row.terakhir}</td>
                  <td className="py-4 text-right text-zinc-400 hover:text-zinc-900 cursor-pointer">
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