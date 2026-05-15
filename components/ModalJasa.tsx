"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, Wrench } from "lucide-react";

interface ModalJasaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function ModalJasa({ isOpen, onClose, onSave, initialData }: ModalJasaProps) {
  const categories = ["Sepatu", "Tas", "Koper", "Jaket", "Sofa"];

  
  const [formData, setFormData] = useState({
    nama_jasa: "",
    kategori: [] as string[],
    status: "Aktif"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_jasa: initialData.name || "",
        kategori: typeof initialData.kategori === 'string' 
          ? initialData.kategori.split(',').map((s: string) => s.trim())
          : (Array.isArray(initialData.kategori) ? initialData.kategori : []),
        status: initialData.status || "Aktif"
      });
    } else {
      setFormData({ nama_jasa: "", kategori: [], status: "Aktif" });
    }

  }, [initialData, isOpen]);

  const handleCheckboxChange = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      kategori: prev.kategori.includes(cat) 
        ? prev.kategori.filter(item => item !== cat)
        : [...prev.kategori, cat]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[420px] rounded-[24px] p-8 shadow-xl animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-800">{initialData ? "Edit Jasa" : "Tambah Jasa"}</h2>

          <button onClick={onClose} className="p-1.5 border border-zinc-100 rounded-full hover:bg-zinc-50 text-zinc-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <hr className="mb-8 border-zinc-100" />
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          
          {/* Nama Jasa */}
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-zinc-700">Nama Jasa</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 border-r pr-3 border-zinc-200">
                <Wrench size={18} className="text-yellow-500" />
              </div>
              <input 
                required 
                className="w-full pl-16 pr-5 py-4 rounded-2xl bg-white border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all font-medium text-zinc-700" 
                placeholder="Reparasi" 
                value={formData.nama_jasa} 
                onChange={(e) => setFormData({...formData, nama_jasa: e.target.value})} 
              />
            </div>
          </div>

          {/* Kategori (Checkbox) */}
          <div className="space-y-3">
            <label className="text-[14px] font-semibold text-zinc-700">Kategori</label>
            <div className="grid grid-cols-3 gap-y-4">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-zinc-300 text-[#2D4F53] focus:ring-[#2D4F53] cursor-pointer"
                    checked={formData.kategori.includes(cat)}
                    onChange={() => handleCheckboxChange(cat)}
                  />
                  <span className="text-[14px] text-zinc-500 group-hover:text-zinc-800 transition-colors font-medium">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Jasa (Dropdown) */}
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-zinc-700">Status Jasa</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 rounded-2xl bg-white border border-zinc-200 outline-none text-sm focus:border-zinc-400 appearance-none font-medium text-zinc-500 cursor-pointer" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={18} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-[#2D4F53] text-white py-4 rounded-2xl font-bold hover:bg-[#233f42] transition-all active:scale-[0.98]"
            >
              Simpan
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-white border border-zinc-200 text-zinc-500 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}