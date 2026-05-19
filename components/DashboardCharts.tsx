"use client";

import React, { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
} from "recharts";
import { Loader2, TrendingUp, Package, Zap } from "lucide-react";
import { getTransactionChartData } from "@/app/actions/transaction";
import { getStockChartData } from "@/app/actions/material";

// --- CUSTOM TOOLTIP ---
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 text-left animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.1em] mb-1">{label}</p>
        <p className="text-[16px] font-black text-[#1E1E1E]">
          Rp {Number(payload[0].value).toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const status = val === 0 ? "Habis" : val < 5 ? "Menipis" : "Aman";
    const colorClass = val === 0 ? "text-rose-500" : val < 5 ? "text-amber-500" : "text-emerald-500";
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 text-left animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
           <p className={`text-[18px] font-black ${colorClass}`}>{val}</p>
           <p className="text-[12px] font-bold text-zinc-400">Unit</p>
        </div>
        <p className={`text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-md inline-block ${val === 0 ? "bg-rose-50" : val < 5 ? "bg-amber-50" : "bg-emerald-50"}`}>
          {status}
        </p>
      </div>
    );
  }
  return null;
};

// --- EMPTY STATE ---
const EmptyChart = ({ message, icon: Icon }: { message: string, icon: any }) => (
  <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
    <div className="w-14 h-14 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-200">
      <Icon size={24} />
    </div>
    <p className="text-[13px] text-zinc-400 font-bold max-w-[150px] leading-relaxed">{message}</p>
  </div>
);

// --- 1. AREA CHART (Fixed 7 Days) ---
export function TransactionAreaChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chartData = await getTransactionChartData(7);
        setData(chartData || []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalValue = data.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div className="w-full flex flex-col h-full font-sans">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-[15px] text-[#1E1E1E] leading-tight">Aktivitas Transaksi</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Grafik pendapatan 7 hari terakhir</p>
          </div>
        </div>
      </div>


      {!loading && data.length > 0 && (
        <div className="mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-black text-[#1E1E1E] tracking-tighter">
              Rp {totalValue >= 1000000 ? `${(totalValue / 1000000).toFixed(1)}jt` : totalValue.toLocaleString("id-ID")}
            </span>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">
              <Zap size={10} fill="currentColor" />
              <span className="text-[10px] font-black">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 220 }} className="w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-400" size={24} />
          </div>
        ) : data.length === 0 ? (
          <EmptyChart message="Belum ada data transaksi dalam 7 hari ini" icon={TrendingUp} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fill: "#94a3b8", fontWeight: 800 }}
                dy={12}
              />
              <YAxis hide />
              <Tooltip content={<CustomAreaTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorIndigo)"
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 3, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 4, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// --- 2. BAR CHART ---
export function StockBarChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chartData = await getStockChartData("all");
        setData(chartData || []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const habisCount = data.filter(d => d.value === 0).length;
  const menipisCount = data.filter(d => d.value > 0 && d.value < 5).length;

  return (
    <div className="w-full flex flex-col h-full font-sans">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
            <Package size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-[15px] text-[#1E1E1E] leading-tight">Status Inventori</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Monitoring ketersediaan bahan</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[11px] font-bold text-rose-600">Habis: <span className="font-black ml-1">{habisCount}</span></span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-bold text-amber-600">Menipis: <span className="font-black ml-1">{menipisCount}</span></span>
        </div>
      </div>

      <div style={{ height: 220 }} className="w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-400" size={24} />
          </div>
        ) : data.length === 0 ? (
          <EmptyChart message="Semua stok bahan dalam kondisi aman dan tersedia" icon={Package} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fill: "#94a3b8", fontWeight: 800 }}
                dy={12}
              />
              <YAxis hide />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc", radius: 12 }} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {data.map((entry, index) => {
                    const color = entry.value === 0 ? "#f43f5e" : entry.value < 5 ? "#fbbf24" : "#10b981";
                    return (
                        <Cell
                            key={`cell-${index}`}
                            fill={color}
                            className="transition-all duration-300 hover:opacity-80"
                        />
                    );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}