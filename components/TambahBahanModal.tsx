"use client";

import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Pastikan path import supabase sudah benar

interface TambahBahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Ubah menjadi void karena kita akan fetch ulang di parent
  initialData?: any;
}

const TambahBahanModal: React.FC<TambahBahanModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_bahan: "",
    varian: "",
    kategori: "",
    stok_bahan: 0,
    satuan: "Pcs",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_bahan: initialData.nama_bahan || "",
        varian: initialData.varian || "",
        kategori: initialData.kategori || "",
        stok_bahan: initialData.stok_bahan || 0,
        satuan: initialData.satuan || "Pcs",
      });
    } else {
      setFormData({
        nama_bahan: "",
        varian: "",
        kategori: "",
        stok_bahan: 0,
        satuan: "Pcs",
      });
    }
  }, [initialData, isOpen]);

  const handleSimpan = async () => {
    if (!formData.nama_bahan) {
      alert("Nama bahan harus diisi!");
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        // Logika Update (Edit)
        const { error } = await supabase
          .from('stok_bahan')
          .update({
            nama_bahan: formData.nama_bahan,
            varian: formData.varian,
            kategori: formData.kategori,
            stok_bahan: formData.stok_bahan,
            satuan: formData.satuan,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // Logika Insert (Tambah Baru)
        const { error } = await supabase
          .from('stok_bahan')
          .insert([
            {
              nama_bahan: formData.nama_bahan,
              varian: formData.varian,
              kategori: formData.kategori,
              stok_bahan: formData.stok_bahan,
              satuan: formData.satuan,
            },
          ]);

        if (error) throw error;
      }

      onSave(); // Memicu refresh data di halaman utama
      onClose(); // Tutup modal
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Bahan" : "Tambah Bahan"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Input Reusable Component */}
          {[
            { label: "Nama Bahan", key: "nama_bahan", type: "text", placeholder: "Cat Warna Hitam" },
            { label: "Varian", key: "varian", type: "text", placeholder: "Hitam" },
            { label: "Kategori", key: "kategori", type: "text", placeholder: "Cat" },
            { label: "Stok Bahan", key: "stok_bahan", type: "number", placeholder: "10" },
            { label: "Satuan", key: "satuan", type: "text", placeholder: "Pcs" },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[14px] font-semibold text-gray-700">{field.label}</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-yellow-500">
                  <Copy size={18} />
                </div>
                <span className="absolute left-10 text-gray-200">|</span>
                <input 
                  type={field.type}
                  placeholder={field.placeholder} 
                  className={`w-full pl-14 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D4F53] transition-all placeholder:text-gray-300 ${field.key === 'stok_bahan' ? 'font-bold' : ''}`}
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                  })}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="p-8 pt-2 flex gap-4">
          <button 
            disabled={loading}
            className="flex-1 py-4 bg-[#2D4F53] text-white font-bold rounded-2xl hover:bg-[#233e41] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSimpan}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button 
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            onClick={onClose}
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
};

export default TambahBahanModal;