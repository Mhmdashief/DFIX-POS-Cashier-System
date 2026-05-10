"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Wrench, Ban, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ModalJasa from "@/components/ModalJasa";

// --- KOMPONEN KOTAK STATISTIK ---
function StatCard({ title, value, sub, trendValue, trendColor, desc, icon }: any) {
  const isPositive = trendColor === "green";
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 flex flex-col gap-4 font-sans text-zinc-900">
      <div className="flex justify-between items-start">
        <p className="text-[14px] font-bold text-zinc-800">{title}</p>
        <div className={`p-2 rounded-xl border border-zinc-50 ${isPositive ? 'text-yellow-500' : 'text-orange-400'}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-900">{value}</span>
          <span className="text-xs text-zinc-400 font-medium">/{sub}</span>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
          isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          <span>↗</span> {trendValue}
        </div>
      </div>
      <p className="text-[12px] text-zinc-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

export default function DataJasaPage() {
  const [jasa, setJasa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJasa = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('layanan_reparasi')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setJasa(data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchJasa(); 
  }, []);

  const handleSave = async (formData: any) => {
    const dataToSave = { 
      nama_jasa: formData.nama_jasa,
      kategori: Array.isArray(formData.kategori) ? formData.kategori.join(', ') : formData.kategori,
      status: formData.status,
      updated_at: new Date().toISOString()
    };

    if (editData) {
      await supabase.from('layanan_reparasi').update(dataToSave).eq('id', editData.id);
    } else {
      await supabase.from('layanan_reparasi').insert([dataToSave]);
    }
    setIsModalOpen(false);
    fetchJasa();
  };

  const filtered = jasa.filter(j => (j.nama_jasa || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 w-full font-sans text-zinc-900">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Jenis Jasa" value={jasa.length} sub="Jasa" trendValue="Normal" trendColor="green" desc="Total jenis layanan reparasi" icon={<Wrench size={20} />} />
        <StatCard title="Jasa Aktif" value={jasa.filter(j => j.status === 'Aktif').length} sub="Jasa" trendValue="Normal" trendColor="green" desc="Layanan yang aktif" icon={<CheckCircle2 size={20} className="text-yellow-500" />} />
        <StatCard title="Jasa Nonaktif" value={jasa.filter(j => j.status !== 'Aktif').length} sub="Jasa" trendValue="Normal" trendColor="red" desc="Layanan yang nonaktif" icon={<Ban size={20} />} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-zinc-900 mb-1">Tabel Data Jasa</h1>
          <p className="text-[13px] text-zinc-400 font-medium">Daftar seluruh jenis jasa reparasi.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => { setEditData(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Plus size={18} className="text-yellow-500" /> Tambah Jasa
          </button>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
            <input 
              placeholder="Cari Jasa..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-sm focus:border-[#2D4F53] font-medium" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50/20 text-zinc-400 text-[12px] font-bold uppercase tracking-wider border-b border-zinc-50">
            <tr>
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Nama Jasa</th>
              <th className="py-4 px-6">Kategori</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Dibuat</th>
              <th className="py-4 px-6">Update</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-zinc-400 font-sans">Memuat data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-zinc-400 font-sans">Tidak ada data ditemukan.</td></tr>
            ) : (
              filtered.map((item, index) => {
                const cats = item.kategori?.split(', ') || [];
                return (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-5 px-6 text-sm font-medium text-zinc-400">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="py-5 px-6 text-sm font-bold text-zinc-700">{item.nama_jasa}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-zinc-500">{cats.slice(0, 2).join(', ')}</span>
                        {cats.length > 2 && <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded-md">+{cats.length - 2}</span>}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-4 py-1 rounded-full text-[11px] font-bold ${item.status === 'Aktif' ? 'bg-[#D1F2E0] text-[#28A745]' : 'bg-red-50 text-red-400'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-sm font-medium text-zinc-500">{formatDate(item.created_at)}</td>
                    <td className="py-5 px-6 text-sm font-medium text-zinc-500">{formatDate(item.updated_at)}</td>
                    
                    <td className="py-5 px-6 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} 
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-zinc-400" />
                      </button>
                      
                      {activeMenu === item.id && (
                        <div className="absolute right-6 top-12 w-44 bg-white border border-zinc-100 rounded-xl z-[99] py-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                          <button onClick={() => { setEditData(item); setIsModalOpen(true); setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-50">Edit Jasa</button>
                          <button onClick={async () => {
                            if(confirm("Hapus data ini?")) {
                              await supabase.from('layanan_reparasi').delete().eq('id', item.id);
                              fetchJasa();
                            }
                          }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-500 hover:bg-red-50">Hapus Jasa</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ModalJasa isOpen={isModalOpen} initialData={editData} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </div>
  );
}