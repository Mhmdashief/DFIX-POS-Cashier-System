"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EditBahanModal({ isOpen, onClose, onSave, initialData }: any) {
  const [mode, setMode] = useState('tambah'); // Default: tambah
  const [jumlah, setJumlah] = useState(0);
  const [alasan, setAlasan] = useState("");

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (isOpen && initialData) {
      // Sesuai permintaan: Start dari angka stok yang sudah ada
      setJumlah(Number(initialData.stok_bahan) || 0);
      setAlasan("");
      setMode('tambah'); 
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSimpan = async () => {
    const currentStok = Number(initialData?.stok_bahan) || 0;
    let newStok = currentStok;

    // Logika perhitungan berdasarkan pilihan mode di UI
    if (mode === 'tambah') {
      // Jika mode tambah, angka input dijumlahkan ke stok lama
      newStok = currentStok + jumlah;
    } else if (mode === 'kurangi') {
      // Jika mode kurangi, stok lama dikurangi angka input
      newStok = Math.max(0, currentStok - jumlah);
    } else if (mode === 'set_ulang') {
      // Jika set ulang, langsung ganti ke angka input
      newStok = jumlah;
    }

    const { error } = await supabase
      .from('stok_bahan')
      .update({ 
        stok_bahan: newStok, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', initialData.id);

    if (!error) {
      onSave();
      onClose();
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[440px] bg-white rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header Sesuai Gambar */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[22px] font-semibold text-[#1E1E1E]">Penyesuaian Stock</h2>
          <button 
            onClick={onClose} 
            className="p-2 border border-gray-100 rounded-full text-gray-400 hover:bg-gray-50 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          
          {/* Section Mode - Checkbox Style (Radio) */}
          <div className="space-y-4">
            <p className="text-[16px] font-semibold text-[#1E1E1E]">Mode</p>
            <div className="flex items-center gap-8">
              {[
                { id: 'tambah', label: 'Tambah' },
                { id: 'kurangi', label: 'Kurangi' },
                { id: 'set_ulang', label: 'Set Ulang' }
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="mode" 
                      checked={mode === m.id}
                      onChange={() => setMode(m.id)}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:border-[#2D4F53] checked:bg-[#2D4F53] transition-all cursor-pointer"
                    />
                    {/* Checkmark icon yang muncul saat dipilih */}
                    <div className="absolute hidden peer-checked:block text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <span className="text-[16px] font-medium text-gray-700 group-hover:text-black transition-colors">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section Jumlah Barang dengan Stepper di Kanan */}
          <div className="flex justify-between items-center">
            <p className="text-[16px] font-semibold text-[#1E1E1E]">
              Jumlah Barang/<span className="text-gray-400 font-normal">{initialData?.satuan || 'Pcs'}</span>
            </p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-12 bg-white shadow-sm">
              <button 
                onClick={() => setJumlah(prev => prev + 1)}
                className="px-4 hover:bg-gray-50 border-r border-gray-200 h-full transition-colors active:bg-gray-100"
              >
                <Plus size={18} className="text-gray-600" />
              </button>
              <input 
                type="number" 
                className="w-16 text-center outline-none font-bold text-[#1E1E1E] text-[16px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                value={jumlah}
                onChange={(e) => setJumlah(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <button 
                onClick={() => setJumlah(prev => Math.max(0, prev - 1))}
                className="px-4 hover:bg-gray-50 border-l border-gray-200 h-full transition-colors active:bg-gray-100"
              >
                <Minus size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Section Alasan */}
          <div className="space-y-3">
            <p className="text-[16px] font-semibold text-[#1E1E1E]">Alasan</p>
            <textarea 
              placeholder="Barang sudah ditambah untuk transaksi"
              className="w-full p-4 border border-gray-200 rounded-[20px] h-28 outline-none focus:border-[#2D4F53] focus:ring-1 focus:ring-[#2D4F53] transition-all text-gray-600 placeholder:text-gray-300 resize-none text-[15px]"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
          </div>

          {/* Footer Buttons Sesuai Gambar */}
          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSimpan}
              className="flex-[1.5] bg-[#214144] text-white py-4 rounded-[18px] font-bold text-[16px] hover:bg-[#1a3436] active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
            >
              Simpan
            </button>
            <button 
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-500 py-4 rounded-[18px] font-bold text-[16px] hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}