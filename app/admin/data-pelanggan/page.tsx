"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, Search, Plus, MoreHorizontal, 
  UserCheck, UserPlus, Trash2, Edit3, 
  MapPin, Phone, User, X, Calendar
} from "lucide-react";
import { getCustomers, saveCustomerAction, deleteCustomerAction } from "@/app/actions/customer";

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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
              <input required className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="Masukkan nama pelanggan" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Nomor HP</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
              <input required className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="089xxxxxxxxx" value={formData.hp} onChange={(e) => setFormData({...formData, hp: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
              <input className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all" placeholder="Masukkan Alamat" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-[#2D4F53] text-white py-3 rounded-xl font-bold hover:bg-[#243f42] transition-all">Simpan</button>
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-zinc-200 text-zinc-500 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA ---
export default function DataPelangganPage() {
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
      const data = await getCustomers();
      setCustomers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const dataToSave = {
        name: formData.nama,
        phone: formData.hp,
        address: formData.alamat,
      };
      const result = await saveCustomerAction(dataToSave, editData?.id);
      if (result.success) {
        setIsModalOpen(false);
        setEditData(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      const result = await deleteCustomerAction(id);
      if (result.success) fetchCustomers();
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
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filtered = customers.filter(c => (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. STATS AREA (DISESUAIKAN DENGAN GAMBAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Total Pelanggan */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-start shadow-sm h-[135px]">
          <div className="flex flex-col h-full justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Total Pelanggan</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-[#161616] leading-none">{customers.length}</span>
              <span className="text-[12px] text-zinc-400 font-bold">/ Pelanggan</span>
            </div>
            <p className="text-[11px] font-bold text-[#34C759]">↗ Bertambah</p>
          </div>
          <div className="p-3 rounded-xl border border-zinc-50 bg-white text-orange-400 shadow-sm"><Users size={24} /></div>
        </div>

        {/* Pelanggan Baru */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-start shadow-sm h-[135px]">
          <div className="flex flex-col h-full justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Pelanggan Baru</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-[#161616] leading-none">0</span>
              <span className="text-[12px] text-zinc-400 font-bold">/ Bulan ini</span>
            </div>
            <p className="text-[11px] font-bold text-[#34C759]">↗ Update Terkini</p>
          </div>
          <div className="p-3 rounded-xl border border-zinc-50 bg-white text-cyan-500 shadow-sm"><UserPlus size={24} /></div>
        </div>

        {/* Pelanggan Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-start shadow-sm h-[135px]">
          <div className="flex flex-col h-full justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Pelanggan Aktif</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-[#161616] leading-none">{customers.length}</span>
              <span className="text-[12px] text-zinc-400 font-bold">/ Orang</span>
            </div>
            <p className="text-[11px] font-bold text-[#34C759]">Status Stabil</p>
          </div>
          <div className="p-3 rounded-xl border border-zinc-50 bg-white text-emerald-500 shadow-sm"><UserCheck size={24} /></div>
        </div>
      </div>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 leading-tight">Data Seluruh Pelanggan</h1>
          <p className="text-sm text-zinc-400 font-medium">Mengatur Seluruh Data Pelanggan</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input placeholder="Search" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm relative z-20 overflow-visible">
        <div className="overflow-x-auto pb-32">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-zinc-400 text-[11px] font-bold border-b border-zinc-50 uppercase tracking-widest">
              <th className="py-6 px-6">No</th>
              <th className="py-6 px-6">Nama</th>
              <th className="py-6 px-6">No Hp</th>
              <th className="py-6 px-6">Alamat</th>
              <th className="py-6 px-6">Total Transaksi</th>
              <th className="py-6 px-6 text-nowrap">Terakhir Transaksi</th>
              <th className="py-6 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filtered.map((c, i) => (
              <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6 text-sm text-zinc-500 font-medium">{i < 9 ? `0${i+1}` : i+1}</td>
                <td className="py-4 px-6 text-sm font-bold text-zinc-800">{c.name}</td>
                <td className="py-4 px-6 text-sm text-zinc-600">{c.phone || "-"}</td>
                <td className="py-4 px-6 text-sm text-zinc-500 truncate max-w-[150px]">{c.address || "-"}</td>
                <td className="py-4 px-6 text-sm font-bold text-[#161616]">{c.transactions?.length || 0}</td>
                <td className="py-4 px-6 text-sm text-zinc-600 flex items-center gap-2">
                  <Calendar size={14} className="text-orange-400" /> {c.transactions?.[0] ? formatDate(c.transactions[0].createdAt) : "-"}
                </td>
                <td className="py-4 px-6 text-right relative">
                  <button onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><MoreHorizontal size={20} className="text-zinc-400" /></button>
                  
                  {activeMenu === c.id && (
                    <div ref={dropdownRef} className="absolute right-6 top-12 w-44 bg-white border border-zinc-100 rounded-xl z-[100] shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                      <button onClick={() => { setEditData(c); setIsModalOpen(true); setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 border-b border-zinc-50 flex items-center gap-2">
                        <Edit3 size={14} className="text-zinc-400" /> Edit Pelanggan
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 size={14} className="text-red-400" /> Hapus
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

      <ModalPelanggan 
        isOpen={isModalOpen} 
        initialData={editData}
        onClose={() => { setIsModalOpen(false); setEditData(null); }} 
        onSave={handleSave} 
      />
    </div>
  );
}