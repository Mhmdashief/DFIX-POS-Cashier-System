"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MoreHorizontal, ChevronDown, Loader2,
  Calendar, Check, ArrowRight, Clock, FileText
} from "lucide-react";
import { getTransactions } from "@/app/actions/transaction";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

// ─── Custom Select ────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, icon: Icon }: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-2xl border text-[12px] font-bold transition-all whitespace-nowrap min-w-[155px]
          ${open ? "border-[#2D4F53] bg-[#2D4F53]/5 text-[#2D4F53]" : "border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-200"}`}
      >
        <Icon size={14} className={open ? "text-[#2D4F53]" : "text-zinc-400"} />
        <span className="flex-1 text-left">{selected?.label || "Pilih"}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180 text-[#2D4F53]" : "text-zinc-400"}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 min-w-[190px] bg-white border border-zinc-100 rounded-2xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-150">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors
                ${value === opt.value ? "text-[#2D4F53]" : "text-zinc-600"}`}>
              {opt.label}
              {value === opt.value && <Check size={13} className="text-[#2D4F53]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RiwayatTransaksiKasirPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [periode, setPeriode] = useState("semua");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Database Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Period filter ──
  const now = new Date();
  const periodFiltered = transactions.filter(item => {
    const d = new Date(item.createdAt);
    if (periode === "minggu") {
      const from = new Date(now); from.setDate(now.getDate() - 7);
      return d >= from;
    }
    if (periode === "bulan") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (periode === "custom") {
      const from = customStart ? new Date(customStart) : null;
      const to = customEnd ? new Date(customEnd) : null;
      if (to) to.setHours(23, 59, 59);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    }
    return true;
  });

  // ── Search ──
  const filtered = periodFiltered.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.invoiceCode?.toLowerCase() || "").includes(q) ||
      (item.customer?.name?.toLowerCase() || "").includes(q) ||
      (item.customerName?.toLowerCase() || "").includes(q)
    );
  });

  const periodeOptions = [
    { value: "semua", label: "Semua Periode" },
    { value: "minggu", label: "7 Hari Terakhir" },
    { value: "bulan", label: "Bulan Ini" },
    { value: "custom", label: "Rentang Bebas" },
  ];

  const statusColor = (status: string) => {
    if (status === "Selesai") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "Dibatalkan") return "bg-red-50 text-red-500 border-red-100";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  const payColor = (status: string) => {
    if (status === "LUNAS") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "DP_BAYAR") return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-zinc-100 text-zinc-500 border-zinc-200";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 w-full font-sans">
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-visible">

        {/* ── Header ── */}
        <div className="p-6 md:p-8 pb-5 border-b border-zinc-50">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-[22px] font-black text-[#2D4F53] uppercase tracking-tight">Riwayat Transaksi</h1>
                <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Data penjualan kasir</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="pl-9 pr-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-[12px] font-bold outline-none focus:border-[#2D4F53] focus:bg-white transition-all w-[200px] placeholder:text-zinc-300"
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Periode */}
                <CustomSelect
                  value={periode}
                  onChange={v => { setPeriode(v); if (v !== "custom") { setCustomStart(""); setCustomEnd(""); } }}
                  options={periodeOptions}
                  icon={Calendar}
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {periode === "custom" && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-50/60 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#2D4F53] shrink-0" />
                  <span className="text-[12px] font-black text-zinc-500 uppercase tracking-wider">Rentang Tanggal</span>
                </div>
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-zinc-400">Dari</label>
                    <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 text-[12px] font-bold text-zinc-700 focus:outline-none focus:border-[#2D4F53] transition-colors bg-white cursor-pointer" />
                  </div>
                  <span className="text-zinc-300 font-bold">—</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-zinc-400">Hingga</label>
                    <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 text-[12px] font-bold text-zinc-700 focus:outline-none focus:border-[#2D4F53] transition-colors bg-white cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-zinc-400 text-[10px] font-black bg-zinc-50/60 uppercase tracking-widest border-b border-zinc-50">
                <th className="py-4 px-6 md:px-8">Tanggal</th>
                <th className="py-4 px-6 md:px-8">No. Invoice</th>
                <th className="py-4 px-6 md:px-8">Pelanggan</th>
                <th className="py-4 px-6 md:px-8">Status</th>
                <th className="py-4 px-6 md:px-8 text-right">Total</th>
                <th className="py-4 px-6 md:px-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#2D4F53]" size={28} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                        <FileText size={26} className="text-zinc-200" />
                      </div>
                      <p className="text-[14px] font-bold text-zinc-400">
                        {periode === "custom" && (customStart || customEnd)
                          ? "Tidak ada transaksi di rentang tanggal ini"
                          : "Belum ada riwayat transaksi"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item.id}
                  onClick={() => router.push(`/kasir/riwayat-transaksi/${item.id}`)}
                  className="hover:bg-zinc-50/80 transition-colors cursor-pointer group">
                  <td className="py-5 px-6 md:px-8 text-[13px] font-medium text-zinc-500 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <span className="text-[13px] font-black text-[#2D4F53] group-hover:underline whitespace-nowrap">
                      {item.invoiceCode || `TRX-${item.id.slice(0, 8)}`}
                    </span>
                  </td>
                  <td className="py-5 px-6 md:px-8 text-[13px] font-bold text-zinc-800">
                    {item.customer?.name || item.customerName || "Umum"}
                  </td>
                  <td className="py-5 px-6 md:px-8">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border w-fit ${statusColor(item.orderStatus)}`}>
                        <Clock size={9} />
                        {item.orderStatus || "Diproses"}
                      </span>
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border w-fit ${payColor(item.paymentStatus)}`}>
                        {item.paymentStatus === "LUNAS" ? "Lunas" : item.paymentStatus === "DP_BAYAR" ? "DP Bayar" : "Belum Bayar"}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 md:px-8 text-right">
                    <span className="text-[14px] font-black text-[#2D4F53] whitespace-nowrap">
                      {formatIDR(item.totalAmount || 0)}
                    </span>
                  </td>
                  <td className="py-5 px-6 md:px-8 text-right">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-[#2D4F53] flex items-center justify-center ml-auto transition-colors">
                      <ArrowRight size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 md:px-8 py-4 border-t border-zinc-50">
            <p className="text-[12px] text-zinc-400 font-medium">
              Menampilkan <span className="font-black text-zinc-600">{filtered.length}</span> dari{" "}
              <span className="font-black text-zinc-600">{transactions.length}</span> transaksi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}