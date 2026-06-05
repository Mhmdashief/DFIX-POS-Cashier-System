"use client";

import React, { useState, useEffect, useRef } from "react";
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

  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Efek untuk mengisi form saat Edit Pengguna diklik
  useEffect(() => {
    setRoleOpen(false);
    setStatusOpen(false);
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        username: initialData.username || "",
        password: "", // Dikosongkan — hash tidak boleh ditampilkan
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <label className="text-[14px] font-bold text-[#161616]">
              Password
              {initialData && (
                <span className="ml-2 text-[12px] font-normal text-zinc-400">(Kosongkan jika tidak ingin mengubah)</span>
              )}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
              <input
                required={!initialData}
                type={showPassword ? "text" : "password"}
                value={formData.password}
                placeholder={initialData ? "Biarkan kosong jika tidak diubah" : "Masukkan password"}
                className="w-full pl-14 pr-12 py-3.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:border-zinc-400"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2" ref={roleRef}>
              <label className="text-[14px] font-bold text-[#161616]">Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setRoleOpen(!roleOpen);
                    setStatusOpen(false);
                  }}
                  className="w-full pl-14 pr-10 py-3.5 rounded-xl border border-zinc-200 text-[14px] bg-white text-zinc-800 focus:outline-none flex items-center justify-between hover:border-zinc-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
                    <span>{formData.role === "ADMIN" ? "Admin" : "Kasir"}</span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-200 ${roleOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {roleOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-100 rounded-xl shadow-xl z-[99] overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, role: "KASIR"});
                        setRoleOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-[14px] hover:bg-zinc-50 flex items-center justify-between transition-colors ${formData.role === "KASIR" ? "bg-zinc-50/70 font-semibold text-[#2D4B50]" : "text-zinc-600"}`}
                    >
                      <span>Kasir</span>
                      {formData.role === "KASIR" && <span className="w-2 h-2 rounded-full bg-[#2D4B50]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, role: "ADMIN"});
                        setRoleOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-[14px] hover:bg-zinc-50 flex items-center justify-between transition-colors ${formData.role === "ADMIN" ? "bg-zinc-50/70 font-semibold text-[#2D4B50]" : "text-zinc-600"}`}
                    >
                      <span>Admin</span>
                      {formData.role === "ADMIN" && <span className="w-2 h-2 rounded-full bg-[#2D4B50]" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2" ref={statusRef}>
              <label className="text-[14px] font-bold text-[#161616]">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStatusOpen(!statusOpen);
                    setRoleOpen(false);
                  }}
                  className="w-full pl-14 pr-10 py-3.5 rounded-xl border border-zinc-200 text-[14px] bg-white text-zinc-800 focus:outline-none flex items-center justify-between hover:border-zinc-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F2C94C]" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-200" />
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${formData.status === 'AKTIF' ? 'bg-[#34C759]' : 'bg-[#F54336]'}`} />
                      {formData.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {statusOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-100 rounded-xl shadow-xl z-[99] overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, status: "AKTIF"});
                        setStatusOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-[14px] hover:bg-zinc-50 flex items-center gap-3 transition-colors ${formData.status === "AKTIF" ? "bg-zinc-50/70 font-semibold text-[#2D4B50]" : "text-zinc-600"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                      <span className="flex-1">Aktif</span>
                      {formData.status === "AKTIF" && <span className="w-2 h-2 rounded-full bg-[#2D4B50]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, status: "NONAKTIF"});
                        setStatusOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-[14px] hover:bg-zinc-50 flex items-center gap-3 transition-colors ${formData.status === "NONAKTIF" ? "bg-zinc-50/70 font-semibold text-[#2D4B50]" : "text-zinc-600"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#F54336]" />
                      <span className="flex-1">Nonaktif</span>
                      {formData.status === "NONAKTIF" && <span className="w-2 h-2 rounded-full bg-[#2D4B50]" />}
                    </button>
                  </div>
                )}
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