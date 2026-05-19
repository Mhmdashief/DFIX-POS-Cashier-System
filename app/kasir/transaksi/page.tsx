"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, MoreHorizontal, ChevronDown,
  Filter, Loader2
} from "lucide-react";
import {
  getTransactions,
  updateTransactionStatusAction,
  deleteTransactionAction
} from "@/app/actions/transaction";

import ModalTransaksiBaru from "@/components/ModalTransaksiBaru";


export default function TransaksiReparasiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Gagal ambil data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updateTransactionStatusAction(id, newStatus);
      if (!result.success) throw new Error(result.error);
      fetchTransactions();
      setActiveMenu(null);
    } catch (error: any) {
      alert("Gagal update status");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        const result = await deleteTransactionAction(id);
        if (!result.success) throw new Error(result.error);
        fetchTransactions();
        setActiveMenu(null);
      } catch (error: any) {
        alert("Gagal menghapus data");
      }
    }
  };

  const filteredData = transactions.filter(t => {
    const matchesSearch = (t.customer?.name || t.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || "").toString().includes(searchQuery) ||
      (t.invoiceCode || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Semua" ? true : (t.orderStatus || "Diproses") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full animate-in fade-in duration-500 font-sans">

      {/* MAIN TABLE BOX */}
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm relative z-0">

        {/* TABLE HEADER & CONTROLS */}
        <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-fit">
            <h1 className="text-[20px] font-black tracking-tight text-zinc-900">TRANSAKSI REPARASI</h1>
            <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-[0.1em] mt-1">Kelola data pengerjaan customer</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative flex-1 md:w-72 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
              <input
                type="text"
                placeholder="Cari pelanggan / invoice..."
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#2D4F53]/5 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#2D4F53] text-white rounded-2xl text-[13px] font-bold hover:bg-[#1e3639] transition-all flex items-center gap-2 shadow-lg shadow-[#2D4F53]/10"
            >
              <Plus size={18} />
              Transaksi Baru
            </button>

            {/* FILTER */}
            <div className="relative min-w-[160px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Filter size={14} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13px] font-bold text-zinc-600 appearance-none focus:outline-none cursor-pointer hover:bg-zinc-100 transition-all"
              >
                <option value="Semua">Semua Status</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-50 bg-zinc-50/20">
                <th className="py-6 px-8">No. Invoice</th>
                <th className="py-6 px-8">Pelanggan</th>
                <th className="py-6 px-8">Layanan</th>
                <th className="py-6 px-8 text-center">Status Pengerjaan</th>
                <th className="py-6 px-8 text-center">Pembayaran</th>
                <th className="py-6 px-8 text-right">Sisa Tagihan</th>
                <th className="py-6 px-8">Tanggal</th>
                <th className="py-6 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#2D4F53]" size={32} />
                      <p className="text-zinc-400 font-black text-[11px] tracking-widest uppercase">Memuat Database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-7 px-8 font-bold text-[#2D4F53] text-[13px] font-mono tracking-tight">
                      {item.invoiceCode || `TRX-${item.id.slice(0, 8)}`}
                    </td>
                    <td className="py-7 px-8 font-bold text-[14px] text-zinc-800">{item.customer?.name || item.customerName || "Umum"}</td>
                    <td className="py-7 px-8">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-zinc-700">{item.category || "Hardware"}</span>
                        <span className="text-[10px] text-zinc-400 font-black uppercase italic tracking-tight">{item.serviceName || "Service"}</span>
                      </div>
                    </td>
                    <td className="py-7 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic border
                      ${item.orderStatus === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' :
                          item.orderStatus === 'Dibatalkan' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {item.orderStatus || "Diproses"}
                      </span>
                    </td>
                    <td className="py-7 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase 
                          ${item.paymentStatus === 'LUNAS' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>
                        {item.paymentStatus === 'LUNAS' ? 'LUNAS' : 'DP BAYAR'}
                      </span>
                    </td>
                    <td className={`py-7 px-8 text-right font-black text-[13px] ${(Number(item.totalAmount || 0) - Number(item.dpAmount || 0)) > 0 ? "text-red-500" : "text-emerald-600"
                      }`}>
                      Rp {(Number(item.totalAmount || 0) - Number(item.dpAmount || 0)).toLocaleString("id-ID")}
                    </td>
                    <td className="py-7 px-8 text-zinc-500 font-bold text-[12px]">{new Date(item.createdAt).toLocaleDateString('id-ID') || "-"}</td>
                    <td className="py-7 px-8 text-right relative">
                      <div className="flex items-center justify-end">
                        <button onClick={() => { setActiveMenu(activeMenu === item.id ? null : item.id); setShowStatusOptions(false); }} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                          <MoreHorizontal size={20} className="text-zinc-400" />
                        </button>
                      </div>

                      {activeMenu === item.id && (
                        <div className="absolute right-6 top-14 w-52 bg-white border border-zinc-100 rounded-2xl z-[100] py-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={() => router.push(`/kasir/transaksi/${item.id}`)}
                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                          >
                            Buka Detail
                          </button>

                          {/* UBAH STATUS */}
                          <div className="border-t border-zinc-50">
                            <button
                              onClick={() => { setShowStatusOptions(!showStatusOptions); }}
                              className="w-full px-5 py-3 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex justify-between items-center"
                            >
                              Ubah Status <ChevronDown size={14} className={showStatusOptions ? 'rotate-180' : ''} />
                            </button>
                            {showStatusOptions && (
                              <div className="bg-zinc-50 py-1 border-t border-zinc-100">
                                {['Selesai', 'Dibatalkan'].map(s => (
                                  <button key={s} onClick={() => updateStatus(item.id, s)} className="w-full px-8 py-2 text-left text-[11px] font-black text-zinc-400 hover:text-[#2D4F53] uppercase transition-colors">{s}</button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => deleteTransaction(item.id)}
                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-zinc-50"
                          >
                            Hapus Transaksi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-32 text-center">
                    <p className="text-zinc-400 font-bold text-sm tracking-tight">Tidak ada transaksi yang ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ModalTransaksiBaru isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchTransactions} />

    </div>
  );
}