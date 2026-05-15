"use client";

import React, { useState, useEffect } from 'react';
import { X, Copy, Package, Tag, Hash, Box } from 'lucide-react';
import { saveMaterialAction } from '@/app/actions/material';

interface EditBahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

const EditBahanModal: React.FC<EditBahanModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_bahan: "",
    varian: "",
    kategori: "",
    stok_bahan: 0,
    satuan: "Pcs",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        nama_bahan: initialData.name || "",
        varian: initialData.variant || "",
        kategori: initialData.category || "",
        stok_bahan: initialData.stock || 0,
        satuan: initialData.unit || "Pcs",
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
      const dataToSave = {
        name: formData.nama_bahan,
        variant: formData.varian,
        category: formData.kategori,
        stock: formData.stok_bahan,
        unit: formData.satuan,
      };

      const result = await saveMaterialAction(dataToSave, initialData?.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      onSave(); // Trigger refetch and show success modal in parent
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-[#1E1E1E]">Edit Detail Bahan</h2>
            <p className="text-[12px] text-gray-400 font-medium">Ubah informasi stok dan detail material</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-5">
          
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Nama Bahan</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-[#2D4F53]">
                <Package size={18} />
              </div>
              <input 
                type="text"
                placeholder="Contoh: Cat Warna Hitam" 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D4F53] focus:bg-white transition-all text-[14px] font-medium"
                value={formData.nama_bahan}
                onChange={(e) => setFormData({ ...formData, nama_bahan: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Varian</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#2D4F53]">
                  <Tag size={16} />
                </div>
                <input 
                  type="text"
                  placeholder="Hitam" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D4F53] focus:bg-white transition-all text-[14px] font-medium"
                  value={formData.varian}
                  onChange={(e) => setFormData({ ...formData, varian: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Kategori</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#2D4F53]">
                  <Box size={16} />
                </div>
                <input 
                  type="text"
                  placeholder="Cat" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D4F53] focus:bg-white transition-all text-[14px] font-medium"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Jumlah Stok</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#2D4F53]">
                  <Hash size={16} />
                </div>
                <input 
                  type="number"
                  placeholder="0" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D4F53] focus:bg-white transition-all text-[14px] font-black text-[#2D4F53] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.stok_bahan === 0 ? "" : formData.stok_bahan}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                    setFormData({ ...formData, stok_bahan: isNaN(val) ? 0 : val });
                  }}
                />

              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Satuan</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#2D4F53]">
                  <Copy size={16} />
                </div>
                <input 
                  type="text"
                  placeholder="Pcs" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D4F53] focus:bg-white transition-all text-[14px] font-medium"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-8 pt-2 flex gap-4 bg-gray-50/30">
          <button 
            disabled={loading}
            className="flex-[2] py-4 bg-[#2D4F53] text-white font-bold rounded-2xl hover:bg-[#233e41] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2D4F53]/20"
            onClick={handleSimpan}
          >
            {loading ? "Menyimpan..." : "Perbarui Data"}
          </button>
          <button 
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            onClick={onClose}
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditBahanModal;