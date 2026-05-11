"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, CreditCard, Calendar, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function DetailLaporanPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ambil ID dari folder [detail]
  const transactionId = params?.detail;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!transactionId) return;
      setLoading(true);
      try {
        const { data: trx, error } = await supabase
          .from('transaksi')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (error) throw error;
        setData(trx);
      } catch (err: any) {
        console.error("Error fetching:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [transactionId]);

  if (loading) return <div className="p-20 text-center font-bold animate-pulse">Menghubungkan Data...</div>;

  if (!data) return (
    <div className="p-20 text-center">
      <h1 className="text-red-500 font-bold">Laporan Tidak Ditemukan</h1>
      <button onClick={() => router.push('/admin/laporan-transaksi')} className="mt-4 text-blue-500 underline">Kembali</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-[#161616]">
      <button 
        onClick={() => router.push('/admin/laporan-transaksi')} 
        className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-8 uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Kembali ke Laporan
      </button>

      <div className="bg-white rounded-[32px] border border-zinc-100 p-10 shadow-sm space-y-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-[#2D4F53] tracking-tighter">
              {data.invoice_code || `TRX-${data.id}`}
            </h1>
            <div className="flex items-center gap-2 text-zinc-400 mt-2 text-sm font-medium">
              <Calendar size={14} />
              {new Date(data.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </div>
          </div>
          <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
            {data.status_pembayaran || 'Selesai'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-zinc-50">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300">
              <User size={16} /> Informasi Pelanggan
            </h2>
            <div>
              <p className="text-xl font-black">{data.nama_pelanggan || 'Umum'}</p>
              <p className="text-zinc-500 text-sm">{data.nomor_hp || '-'}</p>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{data.alamat || 'Tidak ada alamat'}</p>
            </div>
          </section>

          <section className="bg-[#2D4F53] p-8 rounded-[24px] text-white space-y-6">
            <h2 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-50">
              <CreditCard size={16} /> Ringkasan Biaya
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-70">
                <span>Total Tagihan</span>
                <span>{formatIDR(data.total_bayar)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-400 font-bold">
                <span>DP / Dibayar</span>
                <span>{formatIDR(data.dp_dibayar || 0)}</span>
              </div>
              <div className="pt-4 border-t border-white/10 mt-4">
                <p className="text-[10px] font-black opacity-50 uppercase mb-1">Sisa Pembayaran</p>
                <p className="text-3xl font-black">{formatIDR(data.total_bayar - (data.dp_dibayar || 0))}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="pt-8 border-t border-zinc-50">
           <h2 className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-300 mb-4">
              <FileText size={16} /> Catatan Tambahan
            </h2>
            <p className="text-zinc-500 italic text-sm">"{data.catatan || 'Tidak ada catatan khusus'}"</p>
        </section>
      </div>
    </div>
  );
}