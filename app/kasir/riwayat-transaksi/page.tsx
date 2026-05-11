"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Download, Search, MoreHorizontal, 
  Filter, ChevronDown, FileSpreadsheet,
  FileDown, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const formatIDR = (n: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function RiwayatTransaksiKasirPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<any>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Database Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Logika click outside abaikan dulu agar ringkas)

  const filteredTransactions = transactions.filter(item => {
    const search = searchQuery.toLowerCase();
    return (item.invoice_code?.toLowerCase() || "").includes(search) || 
           (item.nama_pelanggan?.toLowerCase() || "").includes(search);
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 w-full font-sans">
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-black text-[#2D4F53] uppercase">Riwayat Transaksi</h1>
            <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest">Data penjualan kasir</p>
          </div>
          <div className="relative w-[250px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-[13px] font-bold outline-none" 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-400 text-[10px] font-black bg-zinc-50/50 uppercase tracking-widest border-b border-zinc-50">
                <th className="py-5 px-8">Tanggal</th>
                <th className="py-5 px-8">No. Invoice</th>
                <th className="py-5 px-8">Pelanggan</th>
                <th className="py-5 px-8 text-right">Total</th>
                <th className="py-5 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#2D4F53]"/></td></tr>
              ) : filteredTransactions.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 border-b border-zinc-50 last:border-0">
                  <td className="py-6 px-8 text-[13px] font-bold text-zinc-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-6 px-8 text-[13px] font-black">{item.invoice_code}</td>
                  <td className="py-6 px-8 text-[13px] font-bold">{item.nama_pelanggan || 'Umum'}</td>
                  <td className="py-6 px-8 text-right text-[13px] font-black text-[#2D4F53]">{formatIDR(item.total_bayar || 0)}</td>
                  <td className="py-6 px-8 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}>
                      <MoreHorizontal size={20} className="text-zinc-300 cursor-pointer" />
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-12 top-14 w-[160px] bg-white border border-zinc-100 rounded-[20px] z-[50] py-2 shadow-2xl">
                        {/* DISINI PERBAIKANNYA: Sesuai nama folder baru */}
                        <button 
                          onClick={() => router.push(`/kasir/riwayat-transaksi/${item.id}`)} 
                          className="block w-full text-left px-5 py-2.5 text-[12px] font-black text-zinc-700 hover:bg-zinc-50 uppercase"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}