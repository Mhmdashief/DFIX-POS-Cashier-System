"use client";

import { FileText, Clock, Wallet, CheckCircle, Plus, Search, MoreHorizontal } from "lucide-react";

// Komponen StatCard (Ringkasan Kasir)
const StatCard = ({ title, value, icon: Icon, colorClass, sub }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-zinc-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-xs text-green-600 mt-4 font-medium">{sub}</p>
  </div>
);

export default function DashboardKasir() {
  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Kasir */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transaksi" value="128" sub="+5 dibanding kemarin" icon={FileText} colorClass="text-zinc-600 bg-zinc-100" />
        <StatCard title="Transaksi Diproses" value="156" sub="+5 dibanding kemarin" icon={Clock} colorClass="text-amber-600 bg-amber-50" />
        <StatCard title="Menunggu Pelunasan" value="10" sub="+5 dibanding kemarin" icon={Wallet} colorClass="text-blue-600 bg-blue-50" />
        <StatCard title="Pendapatan Hari Ini" value="Rp 2.300.000" sub="+10% dari kemarin" icon={CheckCircle} colorClass="text-green-600 bg-green-50" />
      </section>

      {/* 2. Daftar Transaksi Terbaru */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Transaksi Terbaru</h2>
            <p className="text-sm text-zinc-500">Pantau dan akses transaksi terbaru untuk melanjutkan pekerjaan dengan lebih cepat.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
            <Plus size={18} /> Tambah Transaksi
          </button>
        </div>

        {/* Tabel Transaksi */}
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
              {/* Contoh Data Baris */}
              <tr className="hover:bg-zinc-50">
                <td className="py-4 font-medium">DFX-24031</td>
                <td className="py-4 text-zinc-600">Budi Santoso</td>
                <td className="py-4 text-zinc-600">Reparasi • Sepatu <span className="bg-zinc-100 text-[10px] px-1 rounded">+2</span></td>
                <td className="py-4"><span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">Diproses</span></td>
                <td className="py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">DP Bayar</span></td>
                <td className="py-4 text-zinc-500">11:40</td>
                <td className="py-4 text-right text-zinc-400"><MoreHorizontal size={18} className="inline cursor-pointer" /></td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="py-4 font-medium">DFX-24032</td>
                <td className="py-4 text-zinc-600">Siti Aminah</td>
                <td className="py-4 text-zinc-600">Custom • Tas <span className="bg-zinc-100 text-[10px] px-1 rounded">+2</span></td>
                <td className="py-4"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">Selesai</span></td>
                <td className="py-4"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">Lunas</span></td>
                <td className="py-4 text-zinc-500">25 Maret 2026</td>
                <td className="py-4 text-right text-zinc-400"><MoreHorizontal size={18} className="inline cursor-pointer" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}