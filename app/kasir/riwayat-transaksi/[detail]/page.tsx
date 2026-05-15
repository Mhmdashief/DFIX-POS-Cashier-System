"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, CreditCard, Calendar, FileText, Loader2,
  Wrench, Package, CheckCircle2, Clock, Tag
} from "lucide-react";
import { getTransactionById } from "@/app/actions/transaction";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function DetailRiwayatPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = params?.detail;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!transactionId) return;
      setLoading(true);
      try {
        const trx = await getTransactionById(transactionId as string);
        setData(trx);
      } catch (err: any) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [transactionId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-sans bg-[#FDFDFD]">
      <Loader2 className="animate-spin text-[#2D4F53]" size={32} />
      <p className="text-[13px] text-zinc-400 font-bold">Menghubungkan data...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans bg-[#FDFDFD]">
      <p className="text-[16px] font-bold text-red-500">Data Tidak Ditemukan</p>
      <button onClick={() => router.push("/kasir/riwayat-transaksi")} className="text-[13px] text-[#2D4F53] font-bold underline">
        Kembali ke Riwayat
      </button>
    </div>
  );

  const sisa = (data.totalAmount || 0) - (data.dpAmount || 0);
  const isLunas = data.paymentStatus === "LUNAS";
  const isSelesai = data.orderStatus === "Selesai";

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-10 font-sans text-[#161616]">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => router.push("/kasir/riwayat-transaksi")}
          className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-8 uppercase tracking-widest hover:text-[#2D4F53] transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Riwayat
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-[32px] border border-zinc-100 p-8 md:p-10 shadow-sm space-y-10">

          {/* Invoice Header */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-[36px] font-black text-[#2D4F53] tracking-tighter leading-none">
                {data.invoiceCode || `TRX-${data.id.slice(0, 8)}`}
              </h1>
              <div className="flex items-center gap-2 text-zinc-400 mt-2 text-[13px] font-medium">
                <Calendar size={14} />
                {new Date(data.createdAt).toLocaleDateString("id-ID", { dateStyle: "full" })}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border
                ${isLunas ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                {isLunas ? "LUNAS" : "DP BAYAR"}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border
                ${isSelesai ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                {data.orderStatus || "Diproses"}
              </span>
            </div>
          </div>

          {/* Info Jasa */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-zinc-50/60 rounded-2xl border border-zinc-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
                <Wrench size={11} /> Jenis Jasa
              </p>
              <p className="text-[14px] font-bold text-zinc-800">{data.serviceName || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
                <Tag size={11} /> Kategori
              </p>
              <p className="text-[14px] font-bold text-zinc-800">{data.category || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
                <Package size={11} /> Metode Bayar
              </p>
              <p className="text-[14px] font-bold text-zinc-800">{data.paymentMethod || "-"}</p>
            </div>
          </div>

          {/* Customer + Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-50">

            {/* Left: Customer Info */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
                <User size={14} /> Informasi Pelanggan
              </h2>
              <div>
                <p className="text-[20px] font-black text-zinc-900 leading-tight">
                  {data.customer?.name || data.customerName || "Umum"}
                </p>
                {data.customer?.phone && (
                  <p className="text-[14px] text-zinc-500 font-medium mt-1">{data.customer.phone}</p>
                )}
                {data.customer?.address && (
                  <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">{data.customer.address}</p>
                )}
                {!data.customer?.phone && !data.customer?.address && (
                  <p className="text-[13px] text-zinc-300 italic mt-2">Tidak ada info kontak</p>
                )}
              </div>
            </section>

            {/* Right: Billing Summary */}
            <section className="bg-[#2D4F53] p-7 rounded-[24px] text-white space-y-5">
              <h2 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-50">
                <CreditCard size={14} /> Ringkasan Biaya
              </h2>
              <div className="space-y-2.5">
                <div className="flex justify-between text-[14px] opacity-70">
                  <span>Total Tagihan</span>
                  <span className="font-bold">{formatIDR(data.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-emerald-400 font-bold">
                  <span>DP / Dibayar</span>
                  <span>{formatIDR(data.dpAmount || 0)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1.5">Sisa Pembayaran</p>
                <p className={`text-[32px] font-black leading-none ${sisa <= 0 ? "text-emerald-400" : "text-white"}`}>
                  {formatIDR(Math.max(0, sisa))}
                </p>
              </div>
            </section>
          </div>

          {/* Catatan */}
          <section className="pt-6 border-t border-zinc-50">
            <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300 mb-3">
              <FileText size={14} /> Catatan Tambahan
            </h2>
            <p className="text-zinc-500 italic text-[14px] leading-relaxed">
              "{data.notes || "Tidak ada catatan khusus"}"
            </p>
          </section>

          {/* Status Timeline */}
          <section className="pt-6 border-t border-zinc-50">
            <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300 mb-4">
              <Clock size={14} /> Riwayat Status
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Dibuat", done: true },
                { label: "Diproses", done: true },
                { label: "Selesai", done: isSelesai },
                { label: "Lunas", done: isLunas },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black
                    ${step.done ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-100"}`}>
                    {step.done ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {step.label}
                  </div>
                  {i < 3 && <div className={`h-px w-4 ${step.done ? "bg-emerald-200" : "bg-zinc-100"}`} />}
                </React.Fragment>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}