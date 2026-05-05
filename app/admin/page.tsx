"use client";

import { Receipt, Clock, CheckCircle2, MoreHorizontal } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TransactionAreaChart, StockBarChart } from "@/components/DashboardCharts";

// Helper untuk Badge warna yang akurat sesuai desain
const getStatusBadge = (status: string) => {
  if (status === "Diproses") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "Selesai") return "bg-green-50 text-green-700 border-green-200";
  return "bg-zinc-50 text-zinc-700";
};

const getPaymentBadge = (payment: string) => {
  if (payment === "Lunas") return "bg-green-50 text-green-700 border-green-200";
  if (payment === "DP Bayar") return "bg-blue-50 text-blue-700 border-blue-200";
  if (payment === "Belum Bayar") return "bg-red-50 text-red-700 border-red-200";
  return "bg-zinc-50 text-zinc-700";
};

const transaksiData = [
  { id: "DFX-24031", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", status: "Diproses", bayar: "DP Bayar", waktu: "11:40", tagihan: "Rp.100.000" },
  { id: "DFX-24032", nama: "Budi Santoso", jasa: "Custom • Tas", status: "Diproses", bayar: "Lunas", waktu: "25 Maret 2026", tagihan: "Rp0" },
  { id: "DFX-24033", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", status: "Diproses", bayar: "Belum Bayar", waktu: "24 Maret 2026", tagihan: "Rp.200.000" },
  { id: "DFX-24034", nama: "Budi Santoso", jasa: "Custom • Tas", status: "Selesai", bayar: "Lunas", waktu: "23 Maret 2026", tagihan: "Rp0" },
  { id: "DFX-24035", nama: "Budi Santoso", jasa: "Reparasi • Sepatu", status: "Diproses", bayar: "DP Bayar", waktu: "22 Maret 2026", tagihan: "Rp.100.000" },
];

export default function AdminDashboard() {
  return (
    // Tidak ada p-8 di sini, space-y-6 untuk jarak antar section
    <div className="space-y-6">
      
      {/* 1. Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transaksi" value="24" sub="+12% dibanding kemarin" icon={Receipt} colorClass="text-blue-500 bg-blue-50" />
        <StatCard title="Pendapatan Hari Ini" value="Rp 1.250.000" sub="-12% dibanding kemarin" icon={Receipt} colorClass="text-amber-500 bg-amber-50" />
        <StatCard title="Transaksi Proses" value="23" sub="+5 transaksi baru hari ini" icon={Clock} colorClass="text-yellow-500 bg-yellow-50" />
        <StatCard title="Transaksi Selesai" value="10" sub="+5 transaksi baru hari ini" icon={CheckCircle2} colorClass="text-green-500 bg-green-50" />
      </section>

      {/* 2. Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Aktivitas (Lebih lebar: 7 kolom) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-200">
          <TransactionAreaChart />
        </div>
        
        {/* Chart Stok (5 kolom) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200">
          <StockBarChart />
        </div>
      </section>

      {/* 3. Table Section */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Status Reparasi Aktif</h3>
          <button className="text-sm text-orange-500 font-medium hover:underline">Lihat Semua →</button>
        </div>
        
        {/* Tambahkan overflow-x-auto agar tabel responsif di layar kecil */}
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
                <th className="pb-4 font-medium">Sisa Tagihan</th>
                <th className="pb-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transaksiData.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 font-semibold text-zinc-900">{row.id}</td>
                  <td className="py-4 text-zinc-600">{row.nama}</td>
                  <td className="py-4 text-zinc-600">{row.jasa}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadge(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPaymentBadge(row.bayar)}`}>{row.bayar}</span>
                  </td>
                  <td className="py-4 text-zinc-500">{row.waktu}</td>
                  <td className="py-4 font-semibold text-zinc-900">{row.tagihan}</td>
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