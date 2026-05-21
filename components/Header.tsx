"use client";

import { Calendar, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  role: 'admin' | 'kasir';
  name: string;
  onOpenSidebar?: () => void;
}

// Konfigurasi judul dan deskripsi berdasarkan path
const routeConfig: Record<string, { title: string; desc: string }> = {
  "/kasir/dashboard": { title: "Dashboard Kasir", desc: "Pantau ringkasan transaksi dan aktivitas toko hari ini." },
  "/kasir/transaksi-reparasi": { title: "Transaksi Reparasi", desc: "Monitoring seluruh transaksi reparasi pelanggan." },
  "/kasir/data-pelanggan": { title: "Data Pelanggan", desc: "Kelola informasi dan daftar pelanggan." },
  "/admin/manajemen-pengguna": { title: "Manajemen Pengguna", desc: "Atur akun pegawai dan hak akses sistem." },
  "/admin/data-jasa": { title: "Data Jasa Reparasi", desc: "Kelola daftar jenis layanan reparasi." },
  "/admin/data-bahan": { title: "Manajemen Bahan", desc: "Pantau stok dan kelola data bahan." },
};

export default function Header({ role, name, onOpenSidebar }: HeaderProps) {
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
    <header className="flex flex-col lg:flex-row justify-between lg:items-center px-4 lg:px-8 py-4 lg:py-6 bg-white border-b border-zinc-200 gap-4 lg:gap-0 sticky top-0 z-20">
      
      {/* Mobile Top Bar (Hamburger + Role) */}
      <div className="flex justify-between items-center w-full lg:hidden">
        <button 
          onClick={onOpenSidebar} 
          className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg border border-zinc-900 font-semibold text-xs capitalize">
          {role}
        </div>
      </div>

      {/* Bagian Kiri: Dynamic Greeting */}
      <div className="mt-2 lg:mt-0">
        <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 leading-tight">{pageInfo.title}</h1>
        <p className="text-xs lg:text-sm text-zinc-500 mt-1">{pageInfo.desc}</p>
      </div>

      {/* Bagian Kanan: Notifications, Date, & Role (Desktop) */}
      <div className="hidden lg:flex items-center gap-4">
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