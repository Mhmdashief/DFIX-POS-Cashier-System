"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, User, FileText,
  CreditCard, Package, Printer, CheckCircle2, X,
  Wallet, Clock, Tag, Phone, MapPin, Hash, Calendar
} from "lucide-react";
import { getTransactionById, updatePaymentStatusAction } from "@/app/actions/transaction";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: any) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

function InfoRow({ label, value, icon: Icon, valueClass = "" }: any) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-zinc-50 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={13} className="text-zinc-300 shrink-0" />}
        <span className="text-[12px] text-zinc-400 font-medium truncate">{label}</span>
      </div>
      <span className={`text-[13px] font-bold text-right max-w-[55%] ${valueClass || "text-zinc-700"}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-50">
        <div className="w-6 h-6 rounded-lg bg-[#2D4F53]/10 flex items-center justify-center">
          <Icon size={13} className="text-[#2D4F53]" />
        </div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-600">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DetailTransaksiPage() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!params?.id) { setErrorMsg("ID tidak ditemukan"); setLoading(false); return; }
    setLoading(true);
    try {
      const trx = await getTransactionById(params.id as string);
      if (!trx) throw new Error("Transaksi tidak ditemukan");
      setData(trx);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleLunasi = async () => {
    if (!payMethod) { alert("Pilih metode pembayaran terlebih dahulu"); return; }
    setPaying(true);
    try {
      const res = await updatePaymentStatusAction(data.id, "LUNAS", payMethod) as { success: boolean; error?: string };
      if (!res.success) throw new Error(res.error);
      await fetchData();
      setShowPayPanel(false);
      setPayMethod("");
    } catch (e: any) {
      alert("Gagal melunasi: " + e.message);
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Nota - ${data?.invoiceCode || data?.id}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #161616; max-width: 380px; }
        .brand { background: #2D4F53; color: white; font-weight: 900; font-size: 20px; padding: 6px 14px; border-radius: 8px; display: inline-block; letter-spacing: -0.5px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin: 5px 0; }
        .bold { font-weight: 700; }
        .section { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 14px 0 6px; }
        hr { border: none; border-top: 1px dashed #ddd; margin: 12px 0; }
        .total { font-size: 15px; font-weight: 900; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .lunas { background: #d1fae5; color: #059669; }
        .dp { background: #dbeafe; color: #3b82f6; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#2D4F53]" size={36} />
      <p className="text-sm font-medium text-zinc-400 tracking-widest">MEMUAT DATA...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
      <AlertCircle className="text-red-400" size={36} />
      <p className="text-red-500 font-bold">{errorMsg}</p>
      <button onClick={() => router.back()} className="text-zinc-400 underline text-sm">Kembali</button>
    </div>
  );

  const nama = data?.customer?.name || data?.customerName || "Umum";
  const hp = data?.customer?.phone || "-";
  const alamat = data?.customer?.address || "-";
  const invoiceCode = data?.invoiceCode || `TRX-${data?.id?.slice(0, 8)}`;
  const totalAmount = data?.totalAmount || 0;
  const dpAmount = data?.dpAmount || 0;
  const sisa = totalAmount - dpAmount;
  const isLunas = data?.paymentStatus === "LUNAS";

  const statusOrderColor =
    data?.orderStatus === "Selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
    data?.orderStatus === "Dibatalkan" ? "bg-red-50 text-red-500 border-red-100" :
    "bg-blue-50 text-blue-500 border-blue-100";

  return (
    <div className="w-full font-sans text-[#161616] relative">
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-6 hover:text-zinc-700 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Kembali
      </button>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-black tracking-tight">Detail Transaksi</h1>
          <p className="text-[12px] text-zinc-400 font-medium mt-0.5">
            Informasi lengkap & manajemen pembayaran
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-[12px] font-bold hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Printer size={14} /> Cetak Nota
          </button>
          {!isLunas ? (
            <button
              onClick={() => setShowPayPanel(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2D4F53] text-white rounded-xl text-[12px] font-bold hover:bg-[#1e3639] transition-all active:scale-95 shadow-md shadow-[#2D4F53]/20"
            >
              <CheckCircle2 size={14} /> Lunasi Pembayaran
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[12px] font-bold border border-emerald-100">
              <CheckCircle2 size={14} /> Lunas
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-sm shrink-0">
            {nama.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Pelanggan</p>
            <p className="font-black text-[13px] leading-tight truncate">{nama}</p>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Invoice</p>
          <p className="font-black text-[13px] text-[#2D4F53]">{invoiceCode}</p>
          <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{fmtDate(data?.createdAt).split(" pukul")[0]}</p>
        </div>

        {/* Status Order */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Status Pengerjaan</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusOrderColor}`}>
            <Clock size={10} />
            {data?.orderStatus || "Diproses"}
          </span>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Status Pembayaran</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${isLunas ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-500 border-blue-100"}`}>
            <CreditCard size={10} />
            {isLunas ? "LUNAS" : "DP BAYAR"}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT — 3 cols */}
        <div className="lg:col-span-3 space-y-4">

          {/* Data Pelanggan */}
          <SectionCard title="Data Pelanggan" icon={User}>
            <InfoRow icon={User} label="Nama Lengkap" value={nama} />
            <InfoRow icon={Phone} label="No. Handphone" value={hp} />
            <InfoRow icon={MapPin} label="Alamat" value={alamat} />
          </SectionCard>

          {/* Informasi Layanan */}
          <SectionCard title="Informasi Layanan" icon={FileText}>
            <InfoRow icon={Tag} label="Jenis Jasa" value={data?.serviceName || "-"} valueClass="text-[#2D4F53] font-black" />
            <InfoRow icon={Package} label="Kategori Barang" value={data?.category || "-"} />
            <InfoRow icon={Calendar} label="Tanggal Masuk" value={fmtDate(data?.createdAt)} />
            {data?.notes && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Catatan Customer</p>
                <p className="text-[12px] text-zinc-600">{data.notes}</p>
              </div>
            )}
          </SectionCard>

          {/* Bahan Digunakan */}
          <SectionCard title="Bahan Digunakan" icon={Package}>
            {data?.materials && data.materials.length > 0 ? (
              <div className="space-y-1.5">
                {data.materials.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
                    <div>
                      <p className="text-[13px] font-bold text-zinc-700">{m.name}</p>
                      {m.variant && <p className="text-[11px] text-zinc-400">{m.variant}</p>}
                    </div>
                    <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[12px] font-black text-zinc-600">{m.qty} pcs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-zinc-300 italic text-center py-4">Tidak ada data bahan tercatat</p>
            )}
          </SectionCard>
        </div>

        {/* RIGHT — 2 cols */}
        <div className="lg:col-span-2 space-y-4">

          {/* Ringkasan Pembayaran */}
          <SectionCard title="Ringkasan Pembayaran" icon={CreditCard}>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Metode Bayar" value={data?.paymentMethod || "-"} />
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-zinc-400 font-medium">Total Harga</span>
                <span className="font-bold text-zinc-700">{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-zinc-400 font-medium">DP Dibayar</span>
                <span className="font-bold text-blue-500">{fmt(dpAmount)}</span>
              </div>
              <div className="h-px bg-zinc-100 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-zinc-700">Sisa Tagihan</span>
                <span className={`text-[15px] font-black ${sisa > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {fmt(sisa)}
                </span>
              </div>
            </div>

            {isLunas && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <p className="text-[12px] font-bold text-emerald-600">Pembayaran telah lunas</p>
              </div>
            )}
          </SectionCard>

          {/* Progress */}
          {!isLunas && (
            <div className="bg-gradient-to-br from-[#2D4F53] to-[#1a3235] rounded-2xl p-5 text-white shadow-lg shadow-[#2D4F53]/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Progress Pembayaran</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[22px] font-black">{fmt(dpAmount)}</span>
                <span className="text-[12px] text-white/60 font-bold">/ {fmt(totalAmount)}</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${totalAmount > 0 ? Math.min(100, (dpAmount / totalAmount) * 100) : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-white/60 mt-2 font-bold">
                Sisa {fmt(sisa)} lagi untuk lunas
              </p>
              <button
                onClick={() => setShowPayPanel(true)}
                className="mt-4 w-full py-2.5 bg-white text-[#2D4F53] rounded-xl text-[12px] font-black hover:bg-white/90 transition-all active:scale-95"
              >
                Lunasi Sekarang →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT SIDE PANEL */}
      {showPayPanel && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowPayPanel(false)} />
          <div className="w-full max-w-[360px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <div>
                <h3 className="text-[16px] font-black text-zinc-900">Lunasi Pembayaran</h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">Konfirmasi pelunasan sisa tagihan</p>
              </div>
              <button
                onClick={() => setShowPayPanel(false)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Invoice info */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Invoice</p>
                <p className="font-black text-[14px] text-[#2D4F53]">{invoiceCode}</p>
                <p className="text-[12px] text-zinc-500 font-medium mt-0.5">{nama}</p>
              </div>

              {/* Payment breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[12px] text-zinc-400 font-bold">Total Harga</span>
                  <span className="text-[13px] font-black text-zinc-700">{fmt(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[12px] text-blue-500 font-bold">Sudah Dibayar (DP)</span>
                  <span className="text-[13px] font-black text-blue-600">{fmt(dpAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-[12px] text-red-500 font-bold">Sisa Tagihan</span>
                  <span className="text-[15px] font-black text-red-600">{fmt(sisa)}</span>
                </div>
              </div>

              {/* Method selection */}
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Metode Pembayaran Pelunasan</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Transfer", "QRIS"].map(m => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                        payMethod === m
                          ? "bg-[#2D4F53] border-[#2D4F53] text-white"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-[#2D4F53]/40"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {!payMethod && (
                  <p className="text-[11px] text-amber-500 font-bold mt-1.5 ml-0.5">* Pilih metode pembayaran</p>
                )}
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t border-zinc-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPayPanel(false)}
                className="py-3 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleLunasi}
                disabled={paying || !payMethod}
                className="py-3 bg-[#2D4F53] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e3639] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {paying ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT TEMPLATE (hidden) */}
      <div ref={printRef} style={{ display: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="brand">D'fix</div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Toko Reparasi Profesional</p>
        </div>
        <hr />
        <div className="section">Informasi Transaksi</div>
        <div className="row"><span>Invoice</span><span className="bold">{invoiceCode}</span></div>
        <div className="row"><span>Pelanggan</span><span className="bold">{nama}</span></div>
        <div className="row"><span>No. HP</span><span className="bold">{hp}</span></div>
        <div className="row"><span>Tanggal</span><span className="bold">{fmtDate(data?.createdAt)}</span></div>
        <hr />
        <div className="section">Layanan</div>
        <div className="row"><span>Jenis Jasa</span><span className="bold">{data?.serviceName || "-"}</span></div>
        <div className="row"><span>Kategori</span><span className="bold">{data?.category || "-"}</span></div>
        <div className="row"><span>Catatan</span><span className="bold">{data?.notes || "-"}</span></div>
        <hr />
        <div className="section">Pembayaran</div>
        <div className="row"><span>Total Harga</span><span className="bold">{fmt(totalAmount)}</span></div>
        <div className="row"><span>DP Dibayar</span><span className="bold">{fmt(dpAmount)}</span></div>
        <div className="row"><span>Sisa Tagihan</span><span className="bold">{fmt(sisa)}</span></div>
        <div className="row"><span>Metode</span><span className="bold">{data?.paymentMethod || "-"}</span></div>
        <div className="row total">
          <span>Status</span>
          <span className={`badge ${isLunas ? "lunas" : "dp"}`}>{isLunas ? "LUNAS" : "DP BAYAR"}</span>
        </div>
        <hr />
        <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 16 }}>
          Terima kasih atas kepercayaan Anda — D'fix
        </p>
      </div>
    </div>
  );
}