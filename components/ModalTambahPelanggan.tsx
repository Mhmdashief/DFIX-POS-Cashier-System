"use client";

import React, { useState } from "react";
import { X, User, Phone, MapPin } from "lucide-react";

interface ModalTambahPelangganProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nama: string; hp: string; alamat: string }) => void;
}

export default function ModalTambahPelanggan({ isOpen, onClose, onSave }: ModalTambahPelangganProps) {
  const [formData, setFormData] = useState({
    nama: "",
    hp: "",
    alamat: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ nama: "", hp: "", alamat: "" }); // Reset form
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6">
          <h2 className="text-[20px] font-bold text-[#161616]">Tambah Pelanggan Baru</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-zinc-100 hover:bg-zinc-50 transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="h-[1px] bg-zinc-100 w-full" />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required
                type="text"
                placeholder="Masukkan nama pelanggan"
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400 transition-all"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
          </div>

          {/* Input No HP */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">No. WhatsApp (HP)</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required
                type="number"
                placeholder="0812xxxx"
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400 transition-all"
                value={formData.hp}
                onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
              />
            </div>
          </div>

          {/* Input Alamat */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">Alamat Lengkap</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <textarea
                required
                placeholder="Masukkan alamat pelanggan"
                rows={3}
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400 transition-all resize-none"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#2D4B50] hover:bg-[#243c40] text-white py-4 rounded-xl font-bold text-[14px] transition-all shadow-sm"
            >
              Simpan Data
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 py-4 rounded-xl font-bold text-[14px] transition-all"
            >
              Batal
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}