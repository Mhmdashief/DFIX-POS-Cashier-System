"use client";

import React, { useEffect, useState } from "react";
import { 
  User, FileText, LayoutList, CreditCard, 
  Package, Edit3, Calendar, Clock, ChevronLeft 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    minimumFractionDigits: 0 
  }).format(n).replace("Rp", "Rp");

export default function DetailTransaksiView({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const { data: res } = await supabase
        .from('transaksi')
        .select('*')
        .eq('id', id)
        .single();
      setData(res);
      setLoading(false);
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-pulse font-bold text-zinc-400 uppercase tracking-widest">Memuat Detail...</div>
    </div>
  );
  
  if (!data) return <div className="p-20 text-center text-red-500 font-bold">Data tidak ditemukan</div>;

  return (
    <div className="w-full bg-[#FDFDFD] min-h-screen">
      
      {/* HEADER DETAIL (Sub-header di bawah Navbar Utama) */}
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-[#161616]">Detail Transaksi</h2>
        <p className="text-[13px] text-zinc-400 font-medium">
          menampilkan informasi lengkap transaksi serta menyediakan aksi lanjutan seperti pencetakan nota
        </p>
      </div>

      {/* 1. TOP INFO BAR (Horizontal Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm items-center">
        <div className="flex items-center gap-4 border-r border-zinc-50">
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-100">
            <User size={20} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#161616]">{data.nama_pelanggan}</p>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">Reparasi • {data.kategori}</p>
          </div>
        </div>
        
        <div className="flex flex-col justify-center px-4 border-r border-zinc-50">
          <p className="text-[11px] text-zinc-400 font-bold uppercase mb-1">Kode</p>
          <p className="text-[14px] font-bold text-[#161616]">TRX-{data.id}</p>
        </div>

        <div className="flex flex-col justify-center px-4 border-r border-zinc-50">
          <p className="text-[11px] text-zinc-400 font-bold uppercase mb-1">Kategori & Jasa</p>
          <p className="text-[14px] font-bold text-[#161616]">{data.kategori} • {data.jenis_jasa}</p>
        </div>

        <div className="flex flex-col justify-center px-4">
          <p className="text-[11px] text-zinc-400 font-bold uppercase mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                {data.status || 'Diproses'}
            </span>
            <span className="text-zinc-200">•</span>
            <span className="px-3 py-1 bg-[#E0F2FE] text-[#00A9F1] rounded-full text-[10px] font-black uppercase tracking-wider italic">
                DP Bayar
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        
        {/* KOLOM KIRI */}
        <div className="space-y-8">
          {/* Section: Informasi Umum */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-7 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3 font-bold text-[15px]">
                <FileText size={18} className="text-[#2D4F53]" /> Informasi Umum
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 border border-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all">
                <Edit3 size={13} /> Edit Information
              </button>
            </div>
            
            <div className="space-y-5 text-[13px] border-b border-zinc-50 pb-8 mb-8">
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Tanggal Masuk</span><span className="font-bold text-[#161616]">: {data.tanggal}</span></div>
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Estimasi Selesai</span><span className="font-bold text-[#161616]">: {data.tanggal}</span></div>
               <div className="flex justify-between items-center"><span className="text-zinc-400 font-bold tracking-wide">Status Pengerjaan</span><span className="font-bold text-yellow-500 italic">: {data.status || 'Diproses'}</span></div>
            </div>

            <div className="flex items-center gap-3 font-bold text-[15px] mb-6">
                <User size={18} className="text-[#2D4F53]" /> Data Pelanggan
            </div>
            <div className="space-y-5 text-[13px]">
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Nama</span><span className="font-bold text-[#161616]">: {data.nama_pelanggan}</span></div>
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">No HP</span><span className="font-bold text-[#161616]">: {data.nomor_hp}</span></div>
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Alamat</span><span className="font-bold text-[#161616]">: {data.alamat}</span></div>
            </div>
          </div>

          {/* Section: Bahan Digunakan */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-7 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3 font-bold text-[15px]">
                <Package size={18} className="text-[#2D4F53]" /> Bahan Digunakan
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 border border-zinc-100 px-4 py-2 rounded-xl">
                <Edit3 size={13} /> Edit Information
              </button>
            </div>
            <div className="space-y-5 text-[13px]">
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide uppercase text-[11px]">Bahan/Material</span><span className="font-bold text-[#161616]">Qty</span></div>
               <div className="flex justify-between"><span className="font-bold text-zinc-500 italic">Otomatis dari sistem...</span><span className="font-bold text-[#161616]">-</span></div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-8">
          
          {/* Section: Layanan */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-7 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3 font-bold text-[15px]">
                <LayoutList size={18} className="text-[#2D4F53]" /> Layanan
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 border border-zinc-100 px-4 py-2 rounded-xl">
                <Edit3 size={13} /> Edit Information
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-[14px] font-bold text-[#161616]">1. {data.kategori} - {data.jenis_jasa}</p>
                  <p className="text-[12px] text-zinc-400 font-bold italic ml-4 leading-relaxed max-w-[280px]">
                    {data.kendala || 'Tidak ada catatan kerusakan spesifik'}
                  </p>
                </div>
                <span className="text-[15px] font-black text-[#161616]">{formatIDR(data.total_bayar)}</span>
              </div>
            </div>
          </div>

          {/* Section: Pembayaran */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-7 shadow-sm">
            <div className="flex items-center gap-3 font-bold text-[15px] mb-8">
                <CreditCard size={18} className="text-[#2D4F53]" /> Pembayaran
            </div>
            
            <div className="space-y-5 text-[13px] border-b border-zinc-50 pb-8 mb-8">
               <div className="flex justify-between items-center">
                 <span className="text-zinc-400 font-bold tracking-wide">Status Transaksi</span>
                 <span className="px-4 py-1.5 bg-[#E0F2FE] text-[#00A9F1] rounded-xl text-[10px] font-black uppercase italic tracking-wider">DP Bayar</span>
               </div>
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Metode Pembayaran</span><span className="font-bold text-[#161616]">: Transfer</span></div>
            </div>

            <div className="space-y-5 text-[13px]">
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">Total Harga</span><span className="font-black text-[#161616] tracking-tight">{formatIDR(data.total_bayar)}</span></div>
               <div className="flex justify-between"><span className="text-zinc-400 font-bold tracking-wide">DP Dibayar</span><span className="font-black text-[#161616] tracking-tight">{formatIDR(data.dp_dibayar)}</span></div>
            </div>

            <div className="mt-10 flex justify-between items-center pt-8 border-t-2 border-dashed border-zinc-50">
               <span className="text-[16px] font-black uppercase tracking-tighter text-[#161616]">Total Sisa Tagihan</span>
               <span className="text-[22px] font-black text-[#EB3232] tracking-tight">
                 {formatIDR(data.total_bayar - data.dp_dibayar)}
               </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}