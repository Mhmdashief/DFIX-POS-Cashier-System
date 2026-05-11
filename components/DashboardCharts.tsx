"use client";

import React, { useEffect, useState } from "react";
import { 
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell 
} from "recharts";
import { Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- HEADER CHART ---
const ChartHeader = ({ 
  title, subtitle, options, value, onChange 
}: { title: string, subtitle: string, options: any[], value: string, onChange: any }) => (
  <div className="flex justify-between items-start mb-2">
    <div className="space-y-0.5 text-left">
      <h3 className="font-extrabold text-[16px] text-[#161616] tracking-tight">{title}</h3>
      <p className="text-[12px] text-zinc-400 font-medium">{subtitle}</p>
    </div>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-[11px] font-bold border border-zinc-100 rounded-lg px-3 py-1.5 pr-8 text-zinc-500 bg-zinc-50/50 hover:bg-zinc-100 transition-colors outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.val} value={opt.val}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
    </div>
  </div>
);

// --- 1. AREA CHART (AKTIVITAS TRANSAKSI) ---
export function TransactionAreaChart() {
  const [data, setData] = useState<any[]>([]);
  const [range, setRange] = useState("7");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(range));

        const { data: trans } = await supabase
          .from('transaksi')
          .select('tanggal, total_bayar')
          .gte('tanggal', dateLimit.toISOString())
          .order('tanggal', { ascending: true });

        if (trans) {
          const grouped = trans.reduce((acc: any, curr: any) => {
            const dateLabel = new Date(curr.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            acc[dateLabel] = (acc[dateLabel] || 0) + Number(curr.total_bayar);
            return acc;
          }, {});

          setData(Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionData();
  }, [range]);

  return (
    <div className="w-full h-full flex flex-col">
      <ChartHeader 
        title="Aktivitas Transaksi" 
        subtitle="Tren pendapatan harian" 
        value={range}
        onChange={setRange}
        options={[{ label: "7 Hari", val: "7" }, { label: "30 Hari", val: "30" }]}
      />
      
      <div className="flex-1 w-full relative mt-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-zinc-200" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={10} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Total']}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. BAR CHART (STOK BAHAN) ---
export function StockBarChart() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('stok_bahan')
          .select('nama_bahan, stok_bahan')
          .order('stok_bahan', { ascending: true });

        if (filter === "critical") query = query.lt('stok_bahan', 5);
        
        const { data: stocks } = await query.limit(6);

        if (stocks) {
          setData(stocks.map(s => ({ name: s.nama_bahan, value: s.stok_bahan })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [filter]);

  return (
    <div className="w-full h-full flex flex-col">
      <ChartHeader 
        title="Stok Bahan Terendah" 
        subtitle="Item yang harus segera dibeli" 
        value={filter}
        onChange={setFilter}
        options={[{ label: "Semua Bahan", val: "all" }, { label: "Kritis", val: "critical" }]}
      />
      
      <div className="flex justify-start gap-4 mt-1 mb-4">
        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Habis
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Menipis
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-zinc-200" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={10} />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: '#f1f5f9', opacity: 0.4}}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value === 0 ? '#ef4444' : entry.value < 5 ? '#fb923c' : '#e2e8f0'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}