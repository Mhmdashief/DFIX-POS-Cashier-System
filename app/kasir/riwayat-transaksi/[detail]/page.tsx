"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, CreditCard, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function DetailRiwayatPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tetap pakai params.detail karena folder kamu namanya [detail]
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
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [transactionId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#2D4F53]" size={32} />
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center font-bold text-red-500">Data Tidak Ditemukan</div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigasi balik diperbaiki ke riwayat-transaksi */}
        <button 
          onClick={() => router.push('/kasir/riwayat-transaksi')} 
          className="flex items-center gap-2 text-zinc-400 font-black text-[10px] mb-8 uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Kembali ke Riwayat
        </button>

        <div className="bg-white rounded-[40px] border border-zinc-100 p-10 shadow-sm space-y-10">
          <h1 className="text-4xl font-black text-[#2D4F53] tracking-tighter">
            {data.invoice_code}
          </h1>
          {/* ... sisa UI sama seperti sebelumnya ... */}
          <div className="grid grid-cols-2 gap-8 border-t pt-8">
             <div>
                <p className="text-[10px] font-black text-zinc-300 uppercase mb-2">Pelanggan</p>
                <p className="text-xl font-bold">{data.nama_pelanggan || 'Umum'}</p>
             </div>
             <div>
                <p className="text-[10px] font-black text-zinc-300 uppercase mb-2">Total Bayar</p>
                <p className="text-xl font-black text-[#2D4F53]">{formatIDR(data.total_bayar || 0)}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}