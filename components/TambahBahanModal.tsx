"use client";

import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { saveMaterialAction } from '@/app/actions/material';

interface TambahBahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
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
        nama_bahan: initialData.name || "",
        varian: initialData.variant || "",
        kategori: initialData.category || "",
        stok_bahan: initialData.stock || 0,
        satuan: initialData.unit || "Pcs",
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

      onSave();
      onClose();
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
                {field.key === 'stok_bahan' ? (
                  <input 
                    type="number"
                    placeholder="0" 
                    className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D4F53] transition-all placeholder:text-gray-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stok_bahan === 0 ? "" : formData.stok_bahan}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setFormData({ ...formData, stok_bahan: isNaN(val) ? 0 : val });
                    }}
                  />
                ) : (
                  <input 
                    type={field.type}
                    placeholder={field.placeholder} 
                    className={`w-full pl-14 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D4F53] transition-all placeholder:text-gray-300`}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [field.key]: e.target.value 
                    })}
                  />
                )}
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