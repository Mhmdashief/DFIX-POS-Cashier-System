"use client";

import React, { useState, useEffect } from "react";
import { X, User, Settings, FileText, Wallet, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalTambahTransaksi({ isOpen, onClose, onSuccess }: ModalProps) {
  const [options, setOptions] = useState({
    pelanggan: [] as any[],
    jasa: [] as any[],
    kategori: [] as string[]
  });

  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    jenis_jasa: "",
    kategori: "",
    catatan: "",
    estimasi_harga: "",
    dp_dibayar: "",
    metode_pembayaran: "",
  });
  
  const [loading, setLoading] = useState(false);

  // 1. Fetch Data Referensi
  useEffect(() => {
    if (isOpen) {
      const fetchRefData = async () => {
        const [resPelanggan, resLayanan] = await Promise.all([
          supabase.from('pelanggan').select('nama').order('nama'),
          supabase.from('layanan_reparasi').select('nama_jasa, kategori')
        ]);

        const uniqueKategori = Array.from(
          new Set(resLayanan.data?.map((item: any) => item.kategori).filter(Boolean))
        ) as string[];

        setOptions({
          pelanggan: resPelanggan.data || [],
          jasa: resLayanan.data || [],
          kategori: uniqueKategori
        });
      };
      fetchRefData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. Fungsi Simpan ke Database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('transaksi').insert([{
        nama_pelanggan: formData.nama_pelanggan,
        jenis_jasa: formData.jenis_jasa,     // Pastikan kolom ini ada di tabel transaksi
        kategori: formData.kategori,         // Pastikan kolom ini ada di tabel transaksi
        catatan: formData.catatan,           // Kolom baru yang ditambahkan lewat SQL
        total_bayar: parseInt(formData.estimasi_harga) || 0,
        dp_dibayar: parseInt(formData.dp_dibayar) || 0,
        metode_pembayaran: formData.metode_pembayaran,
        status: "Diproses",
        // Catatan: pelanggan_id tidak disertakan karena sudah dihapus
      }]);

      if (error) {
        alert("Gagal menyimpan: " + error.message);
      } else {
        // Jika berhasil
        onSuccess(); // Refresh data di page utama
        onClose();   // Tutup modal
        setFormData({ // Reset form
          nama_pelanggan: "", jenis_jasa: "", kategori: "",
          catatan: "", estimasi_harga: "", dp_dibayar: "", metode_pembayaran: ""
        });
      }
    } catch (err) {
      console.error("Error error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-[550px] rounded-[32px] shadow-2xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-[18px] font-bold text-[#161616]">Tambah Transaksi</h2>
            <p className="text-[13px] text-zinc-400 mt-0.5">Data akan langsung digunakan untuk transaksi ini</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full border border-zinc-100">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="px-8 flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-yellow-50 rounded-md">
                <FileText size={14} className="text-yellow-600" />
            </div>
            <span className="text-[13px] font-bold text-zinc-700 uppercase tracking-tight">Informasi Transaksi</span>
        </div>

        <form onSubmit={handleSave} className="px-8 pb-8 space-y-5">
          {/* Pelanggan */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-zinc-700">Nama Pelanggan</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 border-r pr-3 border-zinc-100">
                    <User size={16} className="text-yellow-500" />
                </div>
                <select 
                    required
                    className="w-full pl-16 pr-10 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] appearance-none outline-none"
                    value={formData.nama_pelanggan}
                    onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})}
                >
                    <option value="">Pilih Pelanggan</option>
                    {options.pelanggan.map((p, i) => (
                      <option key={i} value={p.nama}>{p.nama}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Jenis Jasa */}
          <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-zinc-700">Jenis Jasa</label>
              <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 border-r pr-3 border-zinc-100">
                      <Settings size={16} className="text-yellow-500" />
                  </div>
                  <select 
                      required
                      className="w-full pl-16 pr-10 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] appearance-none outline-none"
                      value={formData.jenis_jasa}
                      onChange={(e) => setFormData({...formData, jenis_jasa: e.target.value})}
                  >
                      <option value="">Pilih Jenis Jasa</option>
                      {options.jasa.map((j, i) => (
                        <option key={i} value={j.nama_jasa}>{j.nama_jasa}</option>
                      ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-zinc-700">Kategori</label>
              <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 border-r pr-3 border-zinc-100">
                      <Settings size={16} className="text-yellow-500" />
                  </div>
                  <select 
                      required
                      className="w-full pl-16 pr-10 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] appearance-none outline-none"
                      value={formData.kategori}
                      onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  >
                      <option value="">Pilih Kategori Barang</option>
                      {options.kategori.map((kat, i) => (
                        <option key={i} value={kat}>{kat}</option>
                      ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-zinc-700">Catatan Customer</label>
            <input 
                placeholder="Tulis kebutuhan customer"
                className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] outline-none"
                value={formData.catatan}
                onChange={(e) => setFormData({...formData, catatan: e.target.value})}
            />
          </div>

          {/* Harga & DP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-zinc-700">Estimasi Harga</label>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-600 font-bold text-[13px]">Rp</span>
                    <input type="number" placeholder="500000" className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] font-bold outline-none"
                        value={formData.estimasi_harga} onChange={(e) => setFormData({...formData, estimasi_harga: e.target.value})} />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-zinc-700">DP Dibayar</label>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-600 font-bold text-[13px]">Rp</span>
                    <input type="number" placeholder="250000" className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] font-bold outline-none"
                        value={formData.dp_dibayar} onChange={(e) => setFormData({...formData, dp_dibayar: e.target.value})} />
                </div>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-zinc-700">Pilih Metode Pembayaran</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 border-r pr-3 border-zinc-100">
                    <Wallet size={16} className="text-yellow-500" />
                </div>
                <select 
                    required
                    className="w-full pl-16 pr-10 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[13px] appearance-none outline-none font-medium"
                    value={formData.metode_pembayaran}
                    onChange={(e) => setFormData({...formData, metode_pembayaran: e.target.value})}
                >
                    <option value="">Pilih Metode Pembayarannya</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer / QRIS</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full py-4 bg-white border border-zinc-200 text-zinc-500 rounded-2xl text-[14px] font-bold hover:bg-zinc-50">
                Batal
            </button>
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#2D4F53] text-white rounded-2xl text-[14px] font-bold hover:bg-[#233d40] transition-all active:scale-95 disabled:opacity-50">
                {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}