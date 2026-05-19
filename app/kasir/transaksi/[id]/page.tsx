"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, User, FileText,
  CreditCard, Package, Printer, CheckCircle2, X, Wallet
} from "lucide-react";
import { getTransactionById, updatePaymentStatusAction } from "@/app/actions/transaction";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: any) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export default function DetailTransaksiKasirPage() {
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
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Nota - ${data?.invoiceCode || data?.id}</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 24px; color: #161616; max-width: 380px; }
        .logo-box { background: #e53935; color: white; font-weight: 900; font-size: 22px; padding: 6px 14px; border-radius: 8px; display: inline-block; font-style: italic; }
        h2 { font-size: 16px; font-weight: 700; margin: 12px 0 2px; }
        p { margin: 2px 0; font-size: 13px; color: #555; }
        hr { border: none; border-top: 1px solid #eee; margin: 12px 0; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
        .bold { font-weight: 700; }
        .section-title { font-weight: 700; font-size: 13px; margin: 14px 0 6px; }
      </style></head><body>${printContent}</body></html>
    `);
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


  return (
    <div className="w-full font-sans text-[#161616] relative">
      {/* BACK */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-6 hover:text-zinc-700 transition-colors">
        <ArrowLeft size={15} /> KEMBALI
      </button>

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-[22px] font-black tracking-tight">Detail Transaksi</h1>
        <p className="text-[12px] text-zinc-400 font-medium mt-0.5">Menampilkan informasi lengkap transaksi serta menyediakan aksi lanjutan seperti pencetakan nota</p>
      </div>

      {/* TOP INFO CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-sm">
            {nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-[14px] leading-tight">{nama}</p>
            <p className="text-[11px] text-zinc-400 font-medium">{data?.category} • {data?.serviceName}</p>
          </div>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Kode</p>
          <p className="font-black text-[14px] text-[#2D4F53]">{invoiceCode}</p>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Status Pengerjaan</p>
          <p className="text-[12px] text-zinc-500">{data?.category} • {data?.serviceName}</p>
          <span className={`mt-1 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            data?.orderStatus === "Selesai" ? "bg-green-50 text-green-600 border-green-100" :
            data?.orderStatus === "Dibatalkan" ? "bg-red-50 text-red-500 border-red-100" :
            "bg-blue-50 text-blue-500 border-blue-100"
          }`}>{data?.orderStatus || "Diproses"}</span>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            isLunas ? "bg-green-50 text-green-600 border-green-100" : "bg-blue-50 text-blue-500 border-blue-100"
          }`}>{data?.paymentStatus === "LUNAS" ? "LUNAS" : "DP BAYAR"}</span>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="space-y-5">

          {/* INFORMASI UMUM */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Informasi Umum</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400 font-medium">Tanggal Masuk</span>
                <span className="font-bold text-zinc-700">: {formatDate(data?.createdAt)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400 font-medium">Status Pengerjaan</span>
                <span className={`font-black text-[12px] ${
                  data?.orderStatus === "Selesai" ? "text-green-600" :
                  data?.orderStatus === "Dibatalkan" ? "text-red-500" : "text-orange-500"
                }`}>: {data?.orderStatus || "Diproses"}</span>
              </div>
            </div>
          </div>

          {/* DATA PELANGGAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Data Pelanggan</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Nama", val: nama },
                { label: "No HP", val: hp },
                { label: "Alamat", val: alamat },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-[13px]">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="font-bold text-zinc-700 text-right max-w-[60%]">: {row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BAHAN DIGUNAKAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Package size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Bahan Digunakan</h2>
            </div>
            {data?.materials && data.materials.length > 0 ? (
              <div className="space-y-2">
                {data.materials.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 font-medium">{m.name} ({m.variant || "-"})</span>
                    <span className="font-bold text-zinc-700">: {m.qty} Pcs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-zinc-300 italic">Tidak ada data bahan tercatat</p>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-5">

          {/* LAYANAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Layanan</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-[13px] pb-3 border-b border-zinc-50">
                <div>
                  <p className="font-bold text-zinc-800">{data?.serviceName || "-"}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{data?.notes || "Tidak ada catatan"}</p>
                </div>
                <span className="font-black text-[#2D4F53] whitespace-nowrap ml-4">{formatIDR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-zinc-400">
                <span>Kategori</span>
                <span className="font-bold">{data?.category || "-"}</span>
              </div>
            </div>
          </div>

          {/* PEMBAYARAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Pembayaran</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400">Status Transaksi</span>
                <span className={`font-black text-[12px] ${isLunas ? "text-green-600" : "text-blue-500"}`}>
                  : {data?.paymentStatus || "Belum Bayar"}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400">Metode Pembayaran</span>
                <span className="font-bold text-zinc-700">: {data?.paymentMethod || "-"}</span>
              </div>
              <div className="border-t border-zinc-50 pt-3 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400">Total Harga</span>
                  <span className="font-bold">{formatIDR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400">DP Dibayar</span>
                  <span className="font-bold text-blue-500">{formatIDR(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-black border-t border-zinc-50 pt-2">
                  <span className="text-zinc-700">Total Sisa Tagihan</span>
                  <span className={sisa > 0 ? "text-red-500" : "text-green-600"}>{formatIDR(sisa)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-zinc-200 text-zinc-700 rounded-2xl text-[13px] font-bold hover:bg-zinc-50 transition-all active:scale-95"
            >
              <Printer size={16} /> Cetak Nota
            </button>
            {!isLunas ? (
              <button
                onClick={() => setShowPayPanel(true)}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#2D4F53] text-white rounded-2xl text-[13px] font-bold hover:bg-[#1e3639] transition-all active:scale-95 shadow-lg shadow-[#2D4F53]/20"
              >
                <CheckCircle2 size={16} /> Lunasi Pembayaran
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3.5 bg-green-50 text-green-600 rounded-2xl text-[13px] font-bold border border-green-100">
                <CheckCircle2 size={16} /> Sudah Lunas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT SIDE PANEL */}
      {showPayPanel && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setShowPayPanel(false)} />
          <div className="w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col gap-5 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-black">Lunasi Pembayaran</h3>
                <p className="text-[12px] text-zinc-400">Bayar sisa tagihan yang ada</p>
              </div>
              <button onClick={() => setShowPayPanel(false)} className="p-2 rounded-full hover:bg-zinc-50">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Total Harga</p>
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[12px] font-black text-orange-500">Rp</span>
                  <span className="text-[14px] font-black text-zinc-700">{totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sudah Dibayar</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-[12px] font-black text-orange-500">Rp</span>
                    <span className="text-[13px] font-bold text-zinc-500">{dpAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sisa Tagihan</p>
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[12px] font-black text-orange-500">Rp</span>
                    <span className="text-[13px] font-bold text-red-500">{sisa.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Pilih Metode Pembayaran</p>
                <div className="relative">
                  <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-xl text-[13px] font-bold appearance-none focus:outline-none focus:border-[#2D4F53]"
                  >
                    <option value="">Pilih Metode Pembayarannya</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button onClick={() => setShowPayPanel(false)} className="py-3 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-500 hover:bg-zinc-50 transition-all">
                Batal
              </button>
              <button onClick={handleLunasi} disabled={paying} className="py-3 bg-[#2D4F53] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e3639] transition-all disabled:opacity-50">
                {paying ? "Memproses..." : "Konfirmasi Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT TEMPLATE (hidden) */}
      <div ref={printRef} style={{ display: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="logo-box">D'fix</div>
          <h2 style={{ marginTop: 10 }}>Toko Reparasi D'fix</h2>
          <p>{invoiceCode} &nbsp; {new Date(data?.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <hr />
        <div className="row"><span>ID Transaksi</span><span className="bold">: {invoiceCode}</span></div>
        <div className="row"><span>Pelanggan</span><span className="bold">: {nama}</span></div>
        <div className="row"><span>Tanggal</span><span className="bold">: {new Date(data?.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
        <hr />
        <div className="section-title">Layanan</div>
        <div className="row"><span>{data?.serviceName}</span><span className="bold">: {formatIDR(totalAmount)}</span></div>
        
        <div className="section-title">Bahan Digunakan</div>
        {data?.materials && data.materials.length > 0 ? (
          data.materials.map((m: any, i: number) => (
            <div className="row" key={i}>
              <span>- {m.name} {m.variant ? `(${m.variant})` : ''}</span>
              <span className="bold">: {m.qty} Pcs</span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 13, color: "#555", fontStyle: "italic", margin: "2px 0" }}>Tidak ada bahan digunakan</p>
        )}
        
        <hr />
        <div className="row bold"><span>Total harga</span><span>: {formatIDR(totalAmount)}</span></div>
        <hr />
        <div className="section-title">Pembayaran</div>
        <div className="row"><span>DP</span><span className="bold">: {formatIDR(dpAmount)}</span></div>
        <div className="row"><span>Sisa</span><span className="bold">: {formatIDR(sisa)}</span></div>
        <div className="row"><span>Metode</span><span className="bold">: {data?.paymentMethod || "-"}</span></div>
        <div className="row"><span>Status</span><span className="bold">: {data?.paymentStatus || "-"}</span></div>
        <hr />
        <div className="section-title">Catatan</div>
        <p style={{ fontSize: 13, color: "#555" }}>{data?.notes || "Tidak ada catatan"}</p>
      </div>
    </div>
  );
}