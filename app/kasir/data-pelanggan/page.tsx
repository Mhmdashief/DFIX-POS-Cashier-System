"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Plus, MoreHorizontal, 
  Trash2, Edit3, MapPin, Phone, 
  User, X, Calendar, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- KOMPONEN MODAL ---
const ModalPelanggan = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [formData, setFormData] = useState({ nama: "", hp: "", alamat: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        nama: initialData.nama || "", 
        hp: initialData.hp || initialData.telepon || "", 
        alamat: initialData.alamat || "" 
      });
    } else {
      setFormData({ nama: "", hp: "", alamat: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-900">{initialData ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Nama Pelanggan</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D4F53]" size={18} />
              <input required className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="Masukkan nama pelanggan" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Nomor HP</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D4F53]" size={18} />
              <input required className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="089xxxxxxxxx" value={formData.hp} onChange={(e) => setFormData({...formData, hp: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D4F53]" size={18} />
              <input className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="Masukkan Alamat" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-[#2D4F53] text-white py-3 rounded-xl font-bold hover:bg-[#243f42] transition-all shadow-lg shadow-[#2D4F53]/10">Simpan</button>
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-zinc-200 text-zinc-500 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA ---
export default function DataPelangganKasirPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('pelanggan').select('*').order('nama', { ascending: true });
      if (error) throw error;
      setCustomers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editData) {
        await supabase.from('pelanggan').update(formData).eq('id', editData.id);
      } else {
        await supabase.from('pelanggan').insert([formData]);
      }
      setIsModalOpen(false);
      setEditData(null);
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      const { error } = await supabase.from('pelanggan').delete().eq('id', id);
      if (!error) fetchCustomers();
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = customers.filter(c => 
    (c.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.hp || "").includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 w-full font-sans">
      
      {/* HEADER & SEARCH AREA */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-zinc-900 uppercase">Database Pelanggan</h1>
          <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mt-1">Kelola data kontak & riwayat customer</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
            <input 
              placeholder="Cari nama atau nomor HP..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-100 bg-white outline-none text-sm focus:ring-2 focus:ring-[#2D4F53]/5 shadow-sm transition-all" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => { setEditData(null); setIsModalOpen(true); }} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2D4F53] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#2D4F53]/10 hover:bg-[#1f383b] transition-all"
          >
            <Plus size={18} /> Tambah Baru
          </button>
        </div>
      </div>

      {/* TABLE BOX */}
      <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-400 text-[10px] font-black border-b border-zinc-50 uppercase tracking-[0.2em] bg-zinc-50/30">
                <th className="py-6 px-8 w-16">No</th>
                <th className="py-6 px-8">Identitas Pelanggan</th>
                <th className="py-6 px-8">Kontak HP</th>
                <th className="py-6 px-8">Alamat Tinggal</th>
                <th className="py-6 px-8 text-center">Total TRX</th>
                <th className="py-6 px-8">Terakhir Order</th>
                <th className="py-6 px-8 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="text-[11px] font-black tracking-widest uppercase">Sinkronisasi Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-6 px-8 text-[13px] text-zinc-400 font-bold">{i < 9 ? `0${i+1}` : i+1}</td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-[11px]">
                          {(c.nama || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-black text-zinc-800">{c.nama}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-sm font-bold text-zinc-600">{c.hp || c.telepon || "-"}</td>
                    <td className="py-6 px-8 text-[13px] text-zinc-500 font-medium truncate max-w-[200px]">{c.alamat || "Tidak ada alamat"}</td>
                    <td className="py-6 px-8 text-center">
                      <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[12px] font-black text-zinc-800">{c.total_order || 0}</span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-bold">
                        <Calendar size={14} className="text-[#2D4F53]" /> {formatDate(c.terakhir_belanja)}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)} 
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
                      >
                        <MoreHorizontal size={20} className="text-zinc-400" />
                      </button>
                      
                      {activeMenu === c.id && (
                        <div ref={dropdownRef} className="absolute right-8 top-14 w-40 bg-white border border-zinc-100 rounded-2xl z-[60] shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <button onClick={() => { setEditData(c); setIsModalOpen(true); setActiveMenu(null); }} className="w-full px-5 py-2.5 text-left text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 transition-colors">
                            <Edit3 size={14} /> Edit Data
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="w-full px-5 py-2.5 text-left text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-zinc-50">
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-24 text-center text-zinc-400 font-medium">
                    Pelanggan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalPelanggan 
        isOpen={isModalOpen} 
        initialData={editData}
        onClose={() => { setIsModalOpen(false); setEditData(null); }} 
        onSave={handleSave} 
      />
    </div>
  );
}