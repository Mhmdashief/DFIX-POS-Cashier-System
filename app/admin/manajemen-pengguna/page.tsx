"use client";

import { User, UserCheck, UserX, Users, Search, Plus, Calendar, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard";

// Helper untuk Badge Status
const getStatusBadge = (status: string) => {
  if (status === "Aktif") return "bg-green-50 text-green-700 border-green-200";
  return "bg-rose-50 text-rose-700 border-rose-200"; // Nonaktif
};

const userData = [
  { no: "01", nama: "Bintang Sakti", username: "bintang", role: "Admin", login: "07 Feb 2026 09:12", status: "Aktif" },
  { no: "02", nama: "Bintang Sakti", username: "bintang", role: "Kasir", login: "07 Feb 2026 09:12", status: "Nonaktif" },
  { no: "03", nama: "Bintang Sakti", username: "bintang", role: "Admin", login: "07 Feb 2026 09:12", status: "Aktif" },
  { no: "04", nama: "Bintang Sakti", username: "bintang", role: "Kasir", login: "07 Feb 2026 09:12", status: "Nonaktif" },
];

export default function ManajemenPenggunaPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pengguna" value="6" sub="Akun terdaftar" icon={User} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Akun Aktif" value="5" sub="Dapat login sistem" icon={UserCheck} colorClass="text-green-600 bg-green-50" />
        <StatCard title="Akun Nonaktif" value="0" sub="Akses diblokir" icon={UserX} colorClass="text-rose-600 bg-rose-50" />
        <StatCard title="Total Kasir" value="4" sub="Petugas operasional" icon={Users} colorClass="text-blue-600 bg-blue-50" />
      </section>

      {/* 2. Controls Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900">Manajemen Pengguna</h2>
            <p className="text-sm text-zinc-500">Mengatur akun pegawai dan hak akses sistem kasir</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={18} /> Tambah Pengguna
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
                <th className="pb-4 font-medium">Username</th>
                <th className="pb-4 font-medium">Role</th>
                <th className="pb-4 font-medium">Terakhir Login</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {userData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-zinc-500">{row.no}</td>
                  <td className="py-4 font-medium text-zinc-900">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.username}</td>
                  <td className="py-4 text-zinc-600">{row.role}</td>
                  <td className="py-4 text-zinc-500">{row.login}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(row.status)}`}>
                        {row.status}
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