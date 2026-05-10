"use client";

import { Bell, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  role: 'admin' | 'kasir';
  name: string;
}

// Konfigurasi judul dan deskripsi berdasarkan path
const routeConfig: Record<string, { title: string; desc: string }> = {
  "/kasir/dashboard": { title: "Dashboard Kasir", desc: "Pantau ringkasan transaksi dan aktivitas toko hari ini." },
  "/kasir/transaksi-reparasi": { title: "Transaksi Reparasi", desc: "Monitoring seluruh transaksi reparasi pelanggan." },
  "/kasir/riwayat-transaksi": { title: "Riwayat Transaksi", desc: "Lihat laporan lengkap transaksi yang telah selesai." },
  "/kasir/data-pelanggan": { title: "Data Pelanggan", desc: "Kelola informasi dan daftar pelanggan." },
  "/admin/manajemen-pengguna": { title: "Manajemen Pengguna", desc: "Atur akun pegawai dan hak akses sistem." },
  "/admin/data-jasa": { title: "Data Jasa Reparasi", desc: "Kelola daftar jenis layanan reparasi." },
  "/admin/data-bahan": { title: "Manajemen Bahan", desc: "Pantau stok dan kelola data bahan." },
};

export default function Header({ role, name }: HeaderProps) {
  const pathname = usePathname();
  
  // Ambil config berdasarkan path, jika tidak ada pakai default
  const pageInfo = routeConfig[pathname] || { 
    title: `Selamat Datang, ${name}`, 
    desc: "Selamat bekerja, pastikan data toko selalu up-to-date." 
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-zinc-200">
      {/* Bagian Kiri: Dynamic Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{pageInfo.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{pageInfo.desc}</p>
      </div>

      {/* Bagian Kanan: Notifications, Date, & Role */}
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer">
          <Bell size={20} />
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 flex items-center gap-2 text-sm text-zinc-600">
          <Calendar size={16} /> 
          {currentDate}
        </div>

        <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-900 font-semibold text-sm capitalize">
          {role}
        </div>
      </div>
    </header>
  );
}