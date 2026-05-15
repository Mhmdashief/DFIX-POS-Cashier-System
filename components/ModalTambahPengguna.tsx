"use client";

import React, { useState, useEffect } from "react";
import { X, User, Lock, Eye, ChevronDown, Mail } from "lucide-react";

interface ModalTambahPenggunaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  initialData?: any; // Tambahan prop
}

export default function ModalTambahPengguna({ isOpen, onClose, onSave, initialData }: ModalTambahPenggunaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "KASIR",
    status: "AKTIF",
  });

  // Efek untuk mengisi form saat Edit Pengguna diklik
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        username: initialData.username || "",
        password: initialData.password || "",
        role: initialData.role || "KASIR",
        status: initialData.status || "AKTIF",
      });
    } else {
      // Reset form jika Tambah Pengguna (Baru)
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "KASIR",
        status: "AKTIF",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        
        <div className="flex justify-between items-center px-8 py-6">
          <h2 className="text-[20px] font-bold text-[#161616]">
            {initialData ? "Edit Pengguna" : "Tambah Pengguna"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full border border-zinc-100 hover:bg-zinc-50 transition-colors">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="h-[1px] bg-zinc-100 w-full" />

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">Nama Pegawai</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required
                type="text"
                value={formData.name}
                placeholder="Masukkan nama pegawai"
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">Username</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required
                type="text"
                value={formData.username}
                placeholder="Masukkan username"
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#161616]">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
                placeholder="Masukkan password"
                className="w-full pl-14 pr-12 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#161616]">Role</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
                <select 
                  value={formData.role}
                  className="w-full pl-14 pr-10 py-3.5 rounded-xl border border-zinc-200 text-[14px] appearance-none bg-white text-zinc-600 focus:outline-none"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="KASIR">Kasir</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#161616]">Status</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
                <select 
                  value={formData.status}
                  className="w-full pl-14 pr-10 py-3.5 rounded-xl border border-zinc-200 text-[14px] appearance-none bg-white text-zinc-600 focus:outline-none"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="NONAKTIF">Nonaktif</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-[#2D4B50] hover:bg-[#243c40] text-white py-4 rounded-xl font-bold text-[14px] transition-all shadow-sm">
              {initialData ? "Simpan Perubahan" : "Simpan"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 py-4 rounded-xl font-bold text-[14px] transition-all">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}