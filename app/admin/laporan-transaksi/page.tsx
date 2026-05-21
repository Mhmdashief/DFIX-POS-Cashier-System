"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Download, Search, TrendingUp, FileText, CheckCircle2, Clock,
  Calendar, ChevronDown, FileSpreadsheet, FileDown, Check, ArrowRight
} from "lucide-react";
import { getTransactions } from "@/app/actions/transaction";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-2xl border text-[12px] font-bold transition-all whitespace-nowrap min-w-[150px]
          ${open ? "border-[#2D4F53] bg-[#2D4F53]/5 text-[#2D4F53]" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"}`}
      >
        <Icon size={14} className={open ? "text-[#2D4F53]" : "text-zinc-400"} />
        <span className="flex-1 text-left">{selected?.label || "Pilih"}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180 text-[#2D4F53]" : "text-zinc-400"}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 min-w-[180px] bg-white border border-zinc-100 rounded-2xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-150">
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, trend, icon, color = "text-amber-400", isPositive = true }: any) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-zinc-100 flex justify-between items-start h-[140px] w-full text-left shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{title}</p>
        <div>
          <span className="text-[24px] font-black text-[#161616] tracking-tighter">{value}</span>
          <p className={`text-[11px] mt-1 font-bold ${isPositive ? "text-emerald-500" : "text-rose-400"}`}>{trend}</p>
        </div>
      </div>
      <div className={`p-3 rounded-2xl bg-zinc-50 border border-zinc-100 ${color}`}>{icon}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LaporanTransaksiPage() {
  const router = useRouter();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openExport, setOpenExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Filters
  const [periode, setPeriode] = useState("semua");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(false);
      setAllTransactions(data || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setOpenExport(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Core: only LUNAS + Selesai ──
  const laporanBase = allTransactions.filter(
    t => t.paymentStatus === "LUNAS" && t.orderStatus === "Selesai"
  );

  // ── Period filter ──
  const now = new Date();
  const periodFiltered = laporanBase.filter(item => {
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
    return true; // "semua"
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

  // ── Stats ──
  const countTransaksiSelesai = filtered.length;
  const totalPendapatan = filtered.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

  const getTrendText = () => {
    if (periode === "semua") return "Semua transaksi selesai";
    if (periode === "minggu") return "7 hari terakhir";
    if (periode === "bulan") return "Bulan ini";
    if (periode === "custom") {
      if (customStart && customEnd) {
        return `${formatDate(customStart)} - ${formatDate(customEnd)}`;
      }
      if (customStart) return `Sejak ${formatDate(customStart)}`;
      if (customEnd) return `Hingga ${formatDate(customEnd)}`;
      return "Rentang kustom";
    }
    return "Lunas + Selesai";
  };

  // ── Export ──
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan Transaksi Selesai", 14, 15);
    doc.setFontSize(9);
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);
    autoTable(doc, {
      head: [["Tanggal", "Kode", "Pelanggan", "Kategori & Jasa", "Total"]],
      body: filtered.map(item => [
        formatDate(item.createdAt),
        item.invoiceCode || `TRX-${item.id.slice(0, 8)}`,
        item.customer?.name || item.customerName || "Umum",
        `${item.category || ""} - ${item.serviceName || ""}`,
        formatIDR(item.totalAmount || 0),
      ]),
      foot: [["", "", "", "Total Pendapatan", formatIDR(totalPendapatan)]],
      footStyles: {
        fillColor: [45, 79, 83], // #2D4F53
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      startY: 28,
    });
    doc.save(`Laporan_Transaksi_Selesai.pdf`);
    setOpenExport(false);
  };

  const exportToExcel = () => {
    const excelData = filtered.map((item, index) => ({
      "No.": index + 1,
      Tanggal: formatDate(item.createdAt),
      "Kode Transaksi": item.invoiceCode || `TRX-${item.id.slice(0, 8)}`,
      "Nama Pelanggan": item.customer?.name || item.customerName || "Umum",
      Kategori: item.category || "",
      Jasa: item.serviceName || "",
      Nominal: item.totalAmount || 0,
    }));

    // Add empty row for spacing
    excelData.push({
      "No.": "" as any,
      Tanggal: "",
      "Kode Transaksi": "",
      "Nama Pelanggan": "",
      Kategori: "",
      Jasa: "",
      Nominal: "" as any,
    });

    // Add Total Row
    excelData.push({
      "No.": "TOTAL PENDAPATAN" as any,
      Tanggal: "",
      "Kode Transaksi": "",
      "Nama Pelanggan": "",
      Kategori: "",
      Jasa: "",
      Nominal: totalPendapatan as any,
    });

    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-fit column widths (with a minimum baseline)
    const max_widths = [5, 12, 16, 18, 12, 15, 15]; // index 0 to 6
    filtered.forEach((item, index) => {
      const rowNum = (index + 1).toString();
      const dateStr = formatDate(item.createdAt);
      const invoiceStr = item.invoiceCode || `TRX-${item.id.slice(0, 8)}`;
      const customerStr = item.customer?.name || item.customerName || "Umum";
      const catStr = item.category || "";
      const serviceStr = item.serviceName || "";
      const nominalStr = formatIDR(item.totalAmount || 0);

      if (rowNum.length > max_widths[0]) max_widths[0] = rowNum.length;
      if (dateStr.length > max_widths[1]) max_widths[1] = dateStr.length;
      if (invoiceStr.length > max_widths[2]) max_widths[2] = invoiceStr.length;
      if (customerStr.length > max_widths[3]) max_widths[3] = customerStr.length;
      if (catStr.length > max_widths[4]) max_widths[4] = catStr.length;
      if (serviceStr.length > max_widths[5]) max_widths[5] = serviceStr.length;
      if (nominalStr.length > max_widths[6]) max_widths[6] = nominalStr.length;
    });
    ws["!cols"] = max_widths.map(w => ({ wch: w + 4 })); // add padding

    // Merge A to F (No., Tanggal, Kode Transaksi, Nama Pelanggan, Kategori, Jasa) for the total row
    ws["!merges"] = [
      { s: { r: filtered.length + 2, c: 0 }, e: { r: filtered.length + 2, c: 5 } }
    ];

    // Apply currency formatting to the Nominal column (Column G, index 6)
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 6 });
      const cell = ws[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.t = 'n';
        cell.z = '"Rp"#,##0'; // Excel custom IDR format: Rp 20.000.000
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Selesai");
    XLSX.writeFile(wb, `Laporan_Transaksi_Selesai.xlsx`);
    setOpenExport(false);
  };

  const periodeOptions = [
    { value: "semua", label: "Semua Periode" },
    { value: "minggu", label: "7 Hari Terakhir" },
    { value: "bulan", label: "Bulan Ini" },
    { value: "custom", label: "Rentang Bebas" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-8 w-full font-sans text-[#161616]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
          <StatCard title="Transaksi Selesai" value={countTransaksiSelesai} trend={getTrendText()}
            icon={<CheckCircle2 size={20} />} color="text-[#2D4F53]" />
          <StatCard title="Total Pendapatan" value={formatIDR(totalPendapatan)} trend={getTrendText()}
            icon={<TrendingUp size={20} />} color="text-indigo-600" />
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[24px] border border-zinc-100 w-full shadow-sm">

          {/* Header */}
          <div className="p-6 md:p-8 pb-5 border-b border-zinc-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <h1 className="text-[20px] font-black tracking-tight text-[#2D4F53]">Laporan Transaksi Selesai</h1>
                <p className="text-[12px] text-zinc-400 mt-0.5 font-medium">
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" placeholder="Cari kode / nama..."
                    className="pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-[12px] font-medium focus:outline-none focus:border-[#2D4F53] transition-all w-full sm:w-[185px] placeholder:text-zinc-300"
                    onChange={e => setSearchQuery(e.target.value)} />
                </div>

                {/* Periode */}
                <CustomSelect value={periode} onChange={v => { setPeriode(v); if (v !== "custom") { setCustomStart(""); setCustomEnd(""); } }}
                  options={periodeOptions} icon={Calendar} />

                {/* Export */}
                <div className="relative w-full sm:w-auto" ref={exportRef}>
                  <button onClick={() => setOpenExport(o => !o)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D4F53] text-white rounded-2xl text-[12px] font-bold hover:bg-[#1e3a3d] transition-all active:scale-95 shadow-sm shadow-[#2D4F53]/20 w-full sm:w-auto">
                    <Download size={14} /> Export
                  </button>
                  {openExport && (
                    <div className="absolute right-0 top-[calc(100%+6px)] w-[190px] bg-white border border-zinc-100 rounded-2xl z-[100] py-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      <button onClick={exportToPDF} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-[12px] font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0"><FileDown size={13} className="text-rose-500" /></div>
                        Export PDF
                      </button>
                      <button onClick={exportToExcel} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-[12px] font-bold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><FileSpreadsheet size={13} className="text-emerald-600" /></div>
                        Export Excel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Date Range — hanya muncul jika periode === "custom" */}
            {periode === "custom" && (
              <div className="mt-4 flex flex-wrap items-center gap-3 p-4 bg-zinc-50/60 rounded-2xl border border-zinc-100">
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

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-black bg-zinc-50/60 uppercase tracking-widest">
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6">Kode Transaksi</th>
                  <th className="py-3.5 px-6">Nama Pelanggan</th>
                  <th className="py-3.5 px-6">Kategori & Jasa</th>
                  <th className="py-3.5 px-6 text-right">Total</th>
                  <th className="py-3.5 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-24 text-center text-zinc-300 text-sm italic">Memuat data laporan...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                          <CheckCircle2 size={28} className="text-zinc-200" />
                        </div>
                        <p className="text-[14px] font-bold text-zinc-400">
                          {periode === "custom" && (customStart || customEnd) ? "Tidak ada laporan di rentang tanggal ini" : "Belum ada transaksi yang selesai"}
                        </p>
                        <p className="text-[12px] text-zinc-300 max-w-[260px] leading-relaxed text-center">
                          Laporan hanya muncul ketika transaksi berstatus Lunas dan Selesai
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(item => (
                  <tr key={item.id}
                    onClick={() => router.push(`/admin/laporan-transaksi/${item.id}`)}
                    className="hover:bg-zinc-50/80 transition-colors cursor-pointer group">
                    <td className="py-5 px-6 text-[13px] text-zinc-500 font-medium">{formatDate(item.createdAt)}</td>
                    <td className="py-5 px-6">
                      <span className="text-[13px] font-black text-[#2D4F53] group-hover:underline">
                        {item.invoiceCode || `TRX-${item.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-[13px] text-zinc-800 font-bold">
                      {item.customer?.name || item.customerName || "Umum"}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-zinc-700">{item.category || "-"}</span>
                        <span className="text-[11px] text-zinc-400 italic">{item.serviceName || "-"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <span className="text-[14px] font-black text-[#2D4F53]">{formatIDR(item.totalAmount || 0)}</span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-[#2D4F53] flex items-center justify-center ml-auto transition-colors">
                        <ArrowRight size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-zinc-50/50 border-t-2 border-zinc-100 font-bold">
                    <td colSpan={4} className="py-4 px-6 text-[13px] text-zinc-500 text-right uppercase tracking-wider font-black">
                      Total Pendapatan ({periodeOptions.find(o => o.value === periode)?.label || "Semua"})
                    </td>
                    <td className="py-4 px-6 text-right text-[15px] text-[#2D4F53] font-black">
                      {formatIDR(totalPendapatan)}
                    </td>
                    <td className="py-4 px-6"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer */}
          {!loading && (
            <div className="px-8 py-4 border-t border-zinc-50 flex items-center justify-between">
              <p className="text-[12px] text-zinc-400 font-medium">
                Menampilkan <span className="font-black text-zinc-600">{filtered.length}</span> dari{" "}
                <span className="font-black text-zinc-600">{laporanBase.length}</span> laporan selesai
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}