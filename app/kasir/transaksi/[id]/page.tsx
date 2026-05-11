"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, FileText, CreditCard, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function DetailTransaksiPage() {
  const params = useParams(); // Mengambil ID dari nama folder [id]
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [pelangganReal, setPelangganReal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullData = async () => {
      // 1. Cek apakah params.id terbaca dari folder [id]
      if (!params?.id) {
        setErrorMsg("ID Transaksi tidak terdeteksi di URL folder [id]");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setErrorMsg(null);

      try {
        // 2. Ambil data transaksi
        // Kita gunakan params.id langsung
        const { data: trx, error: trxErr } = await supabase
          .from('transaksi')
          .select('*')
          .eq('id', params.id) 
          .single();

        if (trxErr) {
          throw new Error("Data tidak ditemukan di database: " + trxErr.message);
        }
        
        setData(trx);

        // 3. Ambil data pelanggan (Manual Join)
        if (trx.id_pelanggan) {
          const { data: pData } = await supabase
            .from('pelanggan')
            .select('*')
            .eq('id', trx.id_pelanggan)
            .maybeSingle();
          if (pData) setPelangganReal(pData);
        } else if (trx.nama_pelanggan) {
          const { data: pFound } = await supabase
            .from('pelanggan')
            .select('*')
            .eq('nama', trx.nama_pelanggan)
            .maybeSingle();
          if (pFound) setPelangganReal(pFound);
        }

      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [params.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-zinc-400" size={40} />
      <p className="text-sm font-medium text-zinc-500 tracking-widest">MEMUAT DATA...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <AlertCircle className="text-red-500" size={40} />
      <p className="text-red-500 font-bold max-w-sm">{errorMsg}</p>
      <button onClick={() => router.push('/kasir/transaksi')} className="text-zinc-500 underline text-sm">Kembali ke Daftar</button>
    </div>
  );

  // Variabel tampilan
  const nama = pelangganReal?.nama || data?.nama_pelanggan || "Umum";
  const hp = pelangganReal?.hp || data?.nomor_hp || "-";
  const alamat = pelangganReal?.alamat || data?.alamat || "Alamat tidak tersedia";

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-[#161616]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-8 hover:text-zinc-600 transition-colors">
        <ArrowLeft size={16} /> KEMBALI
      </button>

      {/* HEADER STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 py-6 border-b border-zinc-100 text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-lg shadow-sm">
            {nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-zinc-900 leading-tight">{nama}</h3>
            <p className="text-[12px] text-zinc-400 font-medium">{data?.kategori || 'Service'} • {data?.jenis_jasa || 'Hardware'}</p>
          </div>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-8">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">WhatsApp</p>
          <p className="font-bold text-[15px]">{hp}</p>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-8">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">No. Invoice</p>
          <p className="font-bold text-[15px] text-blue-600">{data?.invoice_code || `TRX-${data?.id}`}</p>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-8">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Status</p>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic border ${
            data?.status === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {data?.status || 'PROSES'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-left">
        <div className="space-y-12">
          <section>
            <h2 className="flex items-center gap-2 font-black uppercase text-[11px] tracking-[0.2em] mb-8 text-zinc-400">
              <User size={16} /> Identitas Pelanggan
            </h2>
            <div className="space-y-5 ml-2">
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Nama</span>
                <span className="col-span-2 font-bold text-zinc-800">{nama}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Kontak</span>
                <span className="col-span-2 font-bold text-zinc-800">{hp}</span>
              </div>
              <div className="grid grid-cols-3 items-start">
                <span className="text-zinc-400 font-bold uppercase text-[10px] mt-1">Alamat</span>
                <span className="col-span-2 text-zinc-600 font-medium leading-relaxed">{alamat}</span>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-zinc-50">
             <h2 className="flex items-center gap-2 font-black uppercase text-[11px] tracking-[0.2em] mb-6 text-[#2D4F53]">
              <FileText size={16} /> Detail Kerusakan
            </h2>
            <div className="ml-2 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[14px] text-zinc-600 italic font-medium leading-relaxed">
                  "{data?.catatan || 'Tidak ada catatan pengerjaan'}"
                </p>
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section className="bg-[#2D4F53] text-white p-10 rounded-[40px] shadow-2xl shadow-[#2D4F53]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard size={120} />
            </div>
            
            <h2 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] mb-10 opacity-60">
              <CreditCard size={16} /> Informasi Biaya
            </h2>
            
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between text-[15px]">
                <span className="opacity-60 font-medium">Biaya Total</span>
                <span className="font-bold tracking-tight">{formatIDR(data?.total_bayar || 0)}</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="opacity-60 font-medium">Uang Muka (DP)</span>
                <span className="font-bold text-emerald-400 tracking-tight">{formatIDR(data?.dp_dibayar || 0)}</span>
              </div>
              
              <div className="pt-8 border-t border-white/10 mt-8 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Pelunasan</p>
                <p className="text-[42px] font-black tracking-tighter leading-none">
                  {formatIDR((data?.total_bayar || 0) - (data?.dp_dibayar || 0))}
                </p>
                <div className="mt-6 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${data?.status_pembayaran === 'Selesai' ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'}`}></div>
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">
                        {data?.status_pembayaran === 'Selesai' ? 'Sudah Lunas' : 'Belum Lunas'}
                    </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}