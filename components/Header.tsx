import { Bell, Calendar } from "lucide-react";

interface HeaderProps {
  role: 'admin' | 'kasir';
  name: string;
}

export default function Header({ role, name }: HeaderProps) {
  // Mendapatkan tanggal hari ini dalam format Indonesia
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-zinc-200">
      {/* Bagian Kiri: Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Selamat Pagi, {name}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Kelola transaksi, monitor reparasi, dan lihat performa toko hari ini.
        </p>
      </div>

      {/* Bagian Kanan: Notifications, Date, & Role */}
      <div className="flex items-center gap-4">
        {/* Tombol Notifikasi */}
        <div className="bg-white p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer">
          <Bell size={20} />
        </div>

        {/* Display Tanggal */}
        <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 flex items-center gap-2 text-sm text-zinc-600">
          <Calendar size={16} /> 
          {currentDate}
        </div>

        {/* Badge Role */}
        <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-900 font-semibold text-sm capitalize">
          {role}
        </div>
      </div>
    </header>
  );
}