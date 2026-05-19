"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, CreditCard, Calendar, FileText,
  Wrench, Package, CheckCircle2, AlertTriangle, HelpCircle, Landmark
} from "lucide-react";
import { getTransactionById } from "@/app/actions/transaction";

const formatIDR = (n: number) => {
  if (n === undefined || n === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
};

export default function DetailLaporanPage() {
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
        console.error("Error fetching:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#2D4F53] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-bold text-[12px] uppercase tracking-widest animate-pulse">Menghubungkan Data...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="p-20 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-red-500 font-black text-xl mb-2">Laporan Tidak Ditemukan</h1>
      <p className="text-zinc-500 text-sm mb-6">Data transaksi dengan ID tersebut tidak tersedia atau sudah dihapus.</p>
      <button
        onClick={() => router.push('/admin/laporan-transaksi')}
        className="px-6 py-3 bg-[#2D4F53] text-white rounded-2xl text-[13px] font-bold hover:bg-[#1e3639] transition-all"
      >
        Kembali ke Laporan
      </button>
    </div>
  );

  const unpaidAmount = Math.max(0, data.totalAmount - (data.dpAmount || 0));
  const isLunas = data.paymentStatus === 'LUNAS' || unpaidAmount === 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans text-[#161616] animate-in fade-in duration-500">
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/laporan-transaksi')}
        className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-8 uppercase tracking-widest hover:text-[#2D4F53] transition-all"
      >
        <ArrowLeft size={16} /> Kembali ke Laporan
      </button>

      {/* Top Invoice Card */}
      <div className="bg-white rounded-[32px] border border-zinc-100 p-8 md:p-10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-[#2D4F53] tracking-tighter">
                {data.invoiceCode || `TRX-${data.id.slice(0, 8)}`}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 mt-3 text-sm font-bold">
              <Calendar size={15} className="text-zinc-300" />
              <span>{new Date(data.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
            </div>
          </div>

          {/* Badges container */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Status Pengerjaan Badge */}
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase italic border tracking-wider
              ${data.orderStatus === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' :
                data.orderStatus === 'Dibatalkan' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              Reparasi: {data.orderStatus || 'Diproses'}
            </span>

            {/* Status Pembayaran Badge */}
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border
              ${isLunas ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {isLunas ? 'LUNAS' : 'DP / BELUM LUNAS'}
            </span>

            {/* Payment Method Badge */}
            {data.paymentMethod && (
              <span className="px-4 py-2 bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Landmark size={12} className="text-zinc-400" />
                {data.paymentMethod.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Customer & Service info card */}
          <div className="bg-white rounded-[32px] border border-zinc-100 p-8 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Customer Info */}
            <section className="space-y-5">
              <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
                <User size={16} className="text-zinc-300" /> Informasi Pelanggan
              </h2>
              <div className="space-y-2">
                <p className="text-xl font-black text-zinc-800">{data.customer?.name || data.customerName || 'Umum'}</p>
                {data.customer?.phone && (
                  <p className="text-zinc-500 font-bold text-sm bg-zinc-50 px-3 py-1.5 rounded-xl inline-block">
                    {data.customer.phone}
                  </p>
                )}
                <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                  {data.customer?.address || 'Tidak ada alamat terdaftar.'}
                </p>
              </div>
            </section>

            {/* Service / Jasa Info */}
            <section className="space-y-5 border-t md:border-t-0 md:border-l border-zinc-50 pt-10 md:pt-0 md:pl-10">
              <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
                <Wrench size={16} className="text-zinc-300" /> Detail Layanan
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-400 font-black uppercase tracking-wider">Kategori Jasa</p>
                  <p className="text-base font-bold text-zinc-700 mt-0.5">{data.category || 'Hardware'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-black uppercase tracking-wider">Nama Jasa / Deskripsi</p>
                  <p className="text-base font-bold text-zinc-700 mt-0.5">{data.serviceName || 'Layanan Reparasi'}</p>
                </div>
              </div>
            </section>

          </div>

          {/* Materials Used Card */}
          <div className="bg-white rounded-[32px] border border-zinc-100 p-8 md:p-10 shadow-sm space-y-6">
            <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
              <Package size={16} /> Bahan / Material yang Digunakan
            </h2>

            {data.materials && data.materials.length > 0 ? (
              <div className="overflow-hidden border border-zinc-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                      <th className="py-4 px-5">Nama Bahan</th>
                      <th className="py-4 px-5">Kategori / Varian</th>
                      <th className="py-4 px-5 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-[13px] text-zinc-600 font-bold">
                    {data.materials.map((mat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 transition-all">
                        <td className="py-4 px-5 font-black text-[#2D4F53]">{mat.name}</td>
                        <td className="py-4 px-5">
                          {mat.category || '-'} {mat.variant ? `(${mat.variant})` : ''}
                        </td>
                        <td className="py-4 px-5 text-right font-black text-zinc-800">{mat.qty} Pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-zinc-50/50 border border-dashed border-zinc-100 rounded-2xl p-8 text-center">
                <p className="text-zinc-400 text-xs font-bold">Tidak menggunakan bahan/material inventaris dalam transaksi ini.</p>
              </div>
            )}
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-[32px] border border-zinc-100 p-8 md:p-10 shadow-sm space-y-4">
            <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
              <FileText size={16} /> Catatan Tambahan
            </h2>
            <div className="bg-zinc-50/30 rounded-2xl p-5 border border-zinc-50">
              <p className="text-zinc-600 italic text-sm leading-relaxed">
                {data.notes ? `"${data.notes}"` : '"Tidak ada catatan khusus untuk pengerjaan ini."'}
              </p>
            </div>
          </div>

        </div>

        {/* Right column (1/3 width - receipt/summary card) */}
        <div>
          <div className="bg-gradient-to-br from-[#2D4F53] to-[#1e3639] rounded-[32px] p-8 md:p-10 text-white shadow-xl space-y-8 sticky top-6">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-60">
                <CreditCard size={15} /> Ringkasan Pembayaran
              </h2>
              <p className="text-[11px] opacity-40 font-bold uppercase tracking-wider">Struk Keuangan Transaksi</p>
            </div>

            <div className="space-y-4 border-t border-b border-white/10 py-6">
              <div className="flex justify-between text-sm">
                <span className="opacity-70 font-semibold">Total Tagihan</span>
                <span className="font-bold">{formatIDR(data.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="opacity-70 font-semibold">Uang Muka (DP)</span>
                <span className="font-bold text-emerald-300">{formatIDR(data.dpAmount || 0)}</span>
              </div>

              {data.paymentMethod && (
                <div className="flex justify-between text-xs pt-2">
                  <span className="opacity-50">Metode Bayar</span>
                  <span className="font-bold opacity-80 uppercase">{data.paymentMethod.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1.5">Sisa Tagihan / Pembayaran</p>
                <p className={`text-3xl font-black tracking-tight ${unpaidAmount === 0 ? "text-emerald-300" : "text-amber-300"}`}>
                  {formatIDR(unpaidAmount)}
                </p>
              </div>

              {/* Status stamp/notice */}
              {isLunas ? (
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-black text-emerald-200 uppercase tracking-wider">Lunas & Selesai</p>
                    <p className="text-[10px] opacity-70 mt-0.5 leading-relaxed">Seluruh tagihan transaksi ini telah diselesaikan sepenuhnya.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4 flex items-center gap-3">
                  <HelpCircle className="text-amber-400 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-black text-amber-200 uppercase tracking-wider">Belum Lunas / DP</p>
                    <p className="text-[10px] opacity-70 mt-0.5 leading-relaxed">Terdapat sisa pembayaran sebesar {formatIDR(unpaidAmount)} yang harus dilunasi.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}