"use client";

import { 
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, 
  Tooltip, CartesianGrid 
} from "recharts";
import { ChevronDown } from "lucide-react";

// Header Chart yang lebih presisi
const ChartHeader = ({ title, subtitle, dropdownLabel }: { title: string, subtitle: string, dropdownLabel: string }) => (
  <div className="flex justify-between items-start mb-6">
    <div className="space-y-0.5">
      <h3 className="font-bold text-lg text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
    <button className="flex items-center gap-2 text-xs font-medium border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-600 bg-white hover:bg-zinc-50 transition-colors">
      {dropdownLabel} <ChevronDown size={14} className="text-zinc-400" />
    </button>
  </div>
);

// --- 1. AREA CHART (Telah ditingkatkan margin-top-nya agar lebih turun) ---
export function TransactionAreaChart() {
  const data = [
    { name: 'Sun', value: 20 }, { name: 'Mon', value: 30 },
    { name: 'Tue', value: 32 }, { name: 'Wed', value: 44 },
    { name: 'Thu', value: 35 }, { name: 'Fri', value: 42 },
    { name: 'Sat', value: 48 },
  ];

  return (
    <div className="w-full">
      <ChartHeader 
        title="Aktivitas Transaksi" 
        subtitle="Tren transaksi dan pendapatan toko" 
        dropdownLabel="08 Jan 2026" 
      />
      
      {/* Menggunakan mt-12 untuk mendorong grafik lebih ke bawah */}
      <div className="h-[220px] w-full mt-16">
        <ResponsiveContainer width="100%" height="100%">
          {/* Margin 'top' di sini juga bisa ditambah jika ingin lebih turun lagi */}
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#a1a1aa'}} dy={10} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.4} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. BAR CHART (Disesuaikan agar lebih lebar & rapi) ---
export function StockBarChart() {
  const data = [
    { name: 'Lem', value: 1 }, { name: 'Benang', value: 3 },
    { name: 'Sol', value: 4 }, { name: 'Karet', value: 3 }, { name: 'Sikat', value: 1 },
  ];

  return (
    <div className="w-full h-full">
      <ChartHeader title="Daftar Stok Bahan" subtitle="Daftar bahan yang perlu ditambah" dropdownLabel="Kategori" />
      
      <div className="flex justify-end gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Menipis
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Habis
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#71717a'}} dy={10} />
            <Bar dataKey="value" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}