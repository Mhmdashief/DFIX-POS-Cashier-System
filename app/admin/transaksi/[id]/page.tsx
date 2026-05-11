"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, FileText, LayoutList, CreditCard, ArrowLeft, Boxes } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function DetailTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [pelangganReal, setPelangganReal] = useState<any>(null); // State khusus data pelanggan
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullData = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        // 1. Ambil data transaksi
        const { data: trx, error: trxErr } = await supabase
          .from('transaksi')
          .select(`*, pelanggan:id_pelanggan (*)`)
          .eq('id', params.id)
          .single();

        if (trxErr) throw trxErr;
        setData(trx);

        // 2. LOGIKA PENGAMBILAN DATA PELANGGAN
        if (trx.pelanggan) {
          // Jika Join Berhasil (id_pelanggan terisi)
          setPelangganReal(trx.pelanggan);
        } else if (trx.nama_pelanggan) {
          // Jika Join Gagal (id_pelanggan kosong), cari manual berdasarkan NAMA
          const { data: pFound } = await supabase
            .from('pelanggan')
            .select('*')
            .eq('nama', trx.nama_pelanggan)
            .maybeSingle();
          
          if (pFound) setPelangganReal(pFound);
        }

      } catch (err: any) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [params.id]);

  if (loading) return <div className="p-20 text-center font-sans animate-pulse">Menghubungkan Database...</div>;
  if (!data) return <div className="p-20 text-center font-sans text-red-500">Transaksi tidak ditemukan</div>;

  // Variabel tampilan (Mengutamakan data dari tabel pelanggan)
  const nama = pelangganReal?.nama || data.nama_pelanggan || "Umum";
  const hp = pelangganReal?.hp || pelangganReal?.telepon || data.nomor_hp || "-";
  const alamat = pelangganReal?.alamat || data.alamat || "Alamat tidak tersedia";

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-[#161616]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-8">
        <ArrowLeft size={16} /> KEMBALI
      </button>

      {/* HEADER STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 py-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center font-black text-zinc-500">
            {nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-[15px]">{nama}</h3>
            <p className="text-[12px] text-zinc-400">{data.kategori} • {data.jenis_jasa}</p>
          </div>
        </div>
        <div className="md:border-l pl-8">
          <p className="text-[11px] text-zinc-400 font-bold uppercase">No. HP Pelanggan</p>
          <p className="font-bold text-[15px]">{hp}</p>
        </div>
        <div className="md:border-l pl-8">
          <p className="text-[11px] text-zinc-400 font-bold uppercase">ID Transaksi</p>
          <p className="font-bold text-[15px]">TRX-{data.id}</p>
        </div>
        <div className="md:border-l pl-8">
          <p className="text-[11px] text-zinc-400 font-bold uppercase">Status</p>
          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[11px] font-black uppercase italic">
            {data.status || 'PROSES'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* KIRI */}
        <div className="space-y-12">
          <section>
            <h2 className="flex items-center gap-2 font-black uppercase text-[12px] tracking-widest mb-6">
              <User size={16} className="text-zinc-400" /> Data Pelanggan
            </h2>
            <div className="space-y-4 ml-6 text-[14px]">
              <div className="grid grid-cols-3">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Nama</span>
                <span className="col-span-2 font-bold">{nama}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Kontak</span>
                <span className="col-span-2 font-bold">{hp}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Alamat</span>
                <span className="col-span-2 text-zinc-600 font-medium">{alamat}</span>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-zinc-100">
             <h2 className="flex items-center gap-2 font-black uppercase text-[12px] tracking-widest mb-6 text-[#2D4F53]">
              <FileText size={16} /> Catatan Kerusakan
            </h2>
            <p className="ml-6 text-[14px] text-zinc-500 italic font-medium">
              "{data.catatan || 'Tidak ada catatan tambahan'}"
            </p>
          </section>
        </div>

        {/* KANAN */}
        <div className="space-y-12">
          <section className="bg-[#2D4F53] text-white p-8 rounded-[32px] shadow-2xl shadow-[#2D4F53]/20">
            <h2 className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest mb-8 opacity-70">
              <CreditCard size={16} /> Rincian Biaya
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="opacity-60">Total Tagihan</span>
                <span className="font-bold">{formatIDR(data.total_bayar)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="opacity-60">DP / Bayar</span>
                <span className="font-bold text-emerald-400">{formatIDR(data.dp_dibayar || 0)}</span>
              </div>
              <div className="pt-6 border-t border-white/10 mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Sisa Pembayaran</p>
                <p className="text-[36px] font-black tracking-tighter">
                  {formatIDR(data.total_bayar - (data.dp_dibayar || 0))}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}