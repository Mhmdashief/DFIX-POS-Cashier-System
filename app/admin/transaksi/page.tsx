"use client";

import React, { useEffect, useState } from "react";
import { 
  Receipt, Clock, CheckCircle2, Search, Plus, 
  MoreHorizontal, XCircle, ChevronDown, Eye, RefreshCw, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ModalTambahTransaksi } from "@/components/ModalTambahTransaksi";

function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex justify-between items-start h-[135px] w-full font-sans">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[13px] font-bold text-[#161616] tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-[#161616] leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-[#34C759]'}`}>
             {trend}
          </p>
        </div>
      </div>
      <div className="p-2.5 rounded-xl border border-zinc-50 bg-white flex items-center justify-center text-[#F2C94C] shadow-sm">
        {icon}
      </div>
    </div>
  );
}

export default function RiwayatTransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Ambil Data dari Database
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('id', { ascending: false }); // TRX terbaru akan muncul paling atas

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Gagal mengambil data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // 2. Fungsi Update Status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchTransactions(); // Refresh data setelah update
      setActiveMenu(null);
    } catch (error: any) {
      alert("Gagal update status: " + error.message);
    }
  };

  // 3. Fungsi Hapus
  const deleteTransaksi = async (id: string) => {
    if(confirm(`Hapus transaksi ${id}?`)) {
      const { error } = await supabase.from('transaksi').delete().eq('id', id);
      if (!error) fetchTransactions();
    }
  };

  // 4. Filter Pencarian (Nama atau ID)
  const filteredData = transactions.filter(t => 
    (t.nama_pelanggan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 w-full font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[24px] font-bold text-[#161616]">Riwayat Transaksi</h1>
            <p className="text-[14px] text-zinc-400 mt-1">Pantau dan kelola seluruh transaksi laundry</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#2D4F53] text-white rounded-2xl text-[14px] font-bold hover:bg-[#233d40] transition-all shadow-lg shadow-[#2D4F53]/20"
          >
            <Plus size={18} /> Transaksi Baru
          </button>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Order" value={transactions.length} sub="Order" trend="Update real-time" icon={<Receipt size={20} />} />
            <StatCard title="Status Selesai" value={transactions.filter(t => t.status === 'Selesai').length} sub="Order" trend="Berhasil" icon={<CheckCircle2 size={20} />} />
            <StatCard title="Diproses" value={transactions.filter(t => t.status === 'Diproses' || !t.status).length} sub="Order" trend="Sedang dikerjakan" isNeutral icon={<Clock size={20} />} />
            <StatCard title="Dibatalkan" value={transactions.filter(t => t.status === 'Dibatalkan').length} sub="Order" trend="Gagal/Refund" icon={<XCircle size={20} />} />
        </div>

        {/* TOOLBAR & TABLE */}
        <div className="space-y-4">
          <div className="relative w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
            <input 
              placeholder="Cari nama atau ID (misal: TRX-001)..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-[14px] focus:outline-none focus:border-[#2D4F53]"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full overflow-visible rounded-[24px] border border-zinc-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-50">
                  <th className="py-5 px-6">ID</th>
                  <th className="py-5 px-6">Pelanggan</th>
                  <th className="py-5 px-6 text-center">Status</th>
                  <th className="py-5 px-6">Total Bayar</th>
                  <th className="py-5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-zinc-400">Memuat data...</td></tr>
                ) : filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-6 px-6 font-bold text-zinc-800 text-[13px]">{item.id}</td>
                    <td className="py-6 px-6 font-bold text-zinc-700 text-[13px]">{item.nama_pelanggan || "Umum"}</td>
                    <td className="py-6 px-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase
                        ${item.status === 'Selesai' ? 'bg-green-100 text-green-600' : 
                          item.status === 'Diproses' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {item.status || 'Diproses'}
                      </span>
                    </td>
                    <td className="py-6 px-6 font-extrabold text-zinc-900 text-[14px]">
                      Rp {(item.total_bayar || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-6 px-6 text-right relative">
                      <button 
                        onClick={() => { setActiveMenu(activeMenu === item.id ? null : item.id); setShowStatusOptions(false); }}
                        className="p-2 hover:bg-zinc-100 rounded-xl"
                      >
                        <MoreHorizontal size={20} className="text-zinc-400" />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-6 top-14 w-56 bg-white border border-zinc-100 rounded-[18px] z-50 py-2 shadow-2xl overflow-hidden text-left">
                          <button className="w-full px-4 py-3 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-3 border-b border-zinc-50/50">
                            <Eye size={16} className="text-blue-500" /> Lihat Detail
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setShowStatusOptions(!showStatusOptions)}
                              className="w-full px-4 py-3 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center justify-between border-b border-zinc-50/50"
                            >
                              <div className="flex items-center gap-3">
                                <RefreshCw size={16} className="text-orange-500" /> Ubah Status
                              </div>
                              <ChevronDown size={14} />
                            </button>
                            {showStatusOptions && (
                              <div className="bg-zinc-50/50 p-1">
                                {['Diproses', 'Selesai', 'Dibatalkan'].map((s) => (
                                  <button 
                                    key={s}
                                    onClick={() => updateStatus(item.id, s)}
                                    className="w-full px-8 py-2 text-left text-[12px] font-bold text-zinc-500 hover:text-[#2D4F53] transition-all"
                                  >
                                    • {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => deleteTransaksi(item.id)}
                            className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3"
                          >
                            <Trash2 size={16} /> Hapus Transaksi
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

      <ModalTambahTransaksi 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTransactions} 
      />
    </div>
  );
}