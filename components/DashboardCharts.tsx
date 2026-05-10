"use client";

import React, { useEffect, useState } from "react";
import { 
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, 
  Tooltip, CartesianGrid, Cell 
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- HEADER CHART DENGAN DROPDOWN DINAMIS ---
const ChartHeader = ({ 
  title, subtitle, options, value, onChange 
}: { title: string, subtitle: string, options: any[], value: string, onChange: any }) => (
  <div className="flex justify-between items-start mb-6">
    <div className="space-y-0.5">
      <h3 className="font-bold text-lg text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none flex items-center gap-2 text-xs font-medium border border-zinc-200 rounded-lg px-3 py-1.5 pr-8 text-zinc-600 bg-white hover:bg-zinc-50 transition-colors outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.val} value={opt.val}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
    </div>
  </div>
);

// --- 1. AREA CHART (DINAMIS DENGAN FILTER WAKTU) ---
export function TransactionAreaChart() {
  const [data, setData] = useState<any[]>([]);
  const [range, setRange] = useState("7"); // Default 7 hari terakhir
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - parseInt(range));

      const { data: trans, error } = await supabase
        .from('transaksi')
        .select('tanggal, total_bayar')
        .gte('tanggal', dateLimit.toISOString())
        .order('tanggal', { ascending: true });

      if (!error && trans) {
        // Grouping data berdasarkan tanggal
        const grouped = trans.reduce((acc: any, curr: any) => {
          const dateLabel = new Date(curr.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          acc[dateLabel] = (acc[dateLabel] || 0) + Number(curr.total_bayar);
          return acc;
        }, {});

        const formattedData = Object.keys(grouped).map(key => ({
          name: key,
          value: grouped[key]
        }));
        setData(formattedData);
      }
      setLoading(false);
    };

    fetchTransactionData();
  }, [range]);

  return (
    <div className="w-full">
      <ChartHeader 
        title="Aktivitas Transaksi" 
        subtitle="Tren transaksi dan pendapatan toko" 
        value={range}
        onChange={setRange}
        options={[
          { label: "7 Hari Terakhir", val: "7" },
          { label: "30 Hari Terakhir", val: "30" },
          { label: "Bulan Ini", val: "31" }
        ]}
      />
      
      <div className="h-[220px] w-full mt-16 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="animate-spin text-zinc-300" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#a1a1aa'}} dy={10} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              formatter={(val: any) => [`Rp ${Number(val || 0).toLocaleString('id-ID')}`, 'Pendapatan']}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.4} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. BAR CHART (DINAMIS DENGAN FILTER STATUS STOK) ---
export function StockBarChart() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      let query = supabase.from('stok_bahan').select('nama_bahan, stok_sisa').order('stok_sisa', { ascending: true });

      if (filter === "critical") {
        query = query.lt('stok_sisa', 5);
      }

      const { data: stocks, error } = await query.limit(6);

      if (!error && stocks) {
        const formatted = stocks.map(s => ({
          name: s.nama_bahan,
          value: s.stok_sisa
        }));
        setData(formatted);
      }
      setLoading(false);
    };

    fetchStockData();
  }, [filter]);

  return (
    <div className="w-full h-full">
      <ChartHeader 
        title="Daftar Stok Bahan" 
        subtitle="Daftar bahan yang perlu ditambah" 
        value={filter}
        onChange={setFilter}
        options={[
          { label: "Semua Kategori", val: "all" },
          { label: "Stok Kritis (<5)", val: "critical" }
        ]}
      />
      
      <div className="flex justify-end gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Menipis
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Habis
        </div>
      </div>

      <div className="h-[220px] w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="animate-spin text-zinc-300" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#71717a'}} dy={10} />
            <Tooltip 
              cursor={{fill: '#f8fafc'}} 
              contentStyle={{ borderRadius: '12px', border: 'none' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value === 0 ? '#ef4444' : entry.value < 5 ? '#fb923c' : '#cbd5e1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}