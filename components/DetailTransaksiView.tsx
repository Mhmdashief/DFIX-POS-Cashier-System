"use client";

import React from "react";
import { 
  ChevronLeft, User, Edit3, Wrench, 
  Box, FileText, CreditCard, ChevronDown 
} from "lucide-react";

// -- Helper untuk format Rupiah --
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("Rp", "Rp ");
};

interface Material {
  name: string;
  qty: number;
  unit: string;
}

interface ServiceItem {
  id: number;
  category: string;
  subCategory: string;
  description: string;
  price: number;
}

interface TransactionData {
  invoiceCode: string;
  customerName: string;
  phone: string;
  address: string;
  entryDate: string;
  estimationDate: string;
  statusWork: string;
  statusPayment: string;
  paymentMethod: string;
  totalPrice: number;
  dpPaid: number;
  remainingBill: number;
  materials?: Material[]; // Opsional agar tidak error jika undefined
  services?: ServiceItem[]; // Opsional agar tidak error jika undefined
}

interface DetailTransaksiViewProps {
  data: TransactionData;
  onBack: () => void;
  onEditGeneral?: () => void;
  onEditMaterials?: () => void;
  onEditServices?: () => void;
}

export default function DetailTransaksiView({ 
  data, 
  onBack,
  onEditGeneral,
  onEditMaterials,
  onEditServices 
}: DetailTransaksiViewProps) {
  
  // Guard clause jika data utama belum ada
  if (!data) return <div className="p-10 text-center font-bold text-[#161616]">Memuat data transaksi...</div>;

  // Safety check untuk array agar tidak TypeError
  const services = data.services || [];
  const materials = data.materials || [];

  return (
    <div className="w-full flex flex-col items-start gap-[10px] font-['Plus_Jakarta_Sans'] animate-in fade-in duration-500">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-black/40 hover:text-black transition-colors font-bold text-sm mb-2"
      >
        <ChevronLeft size={20} />
        Kembali ke Daftar Transaksi
      </button>

      {/* --- HEADER SECTION --- */}
      <div className="w-full self-stretch p-5 bg-white rounded-[12px] border border-[#E8E8E8] flex flex-row items-center justify-between">
        <div className="flex items-center gap-[16px]">
          <div className="p-[10px] rounded-[5px] border border-[#E8E8E8] flex items-center justify-center">
            <User className="text-[#161616]" size={20} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-black text-[16px] font-bold">{data.customerName || "-"}</div>
            <div className="text-black/40 text-[14px] font-medium italic">
              {services.length > 0 
                ? `${services[0].category} • ${services[0].subCategory}` 
                : "Tidak ada layanan"}
            </div>
          </div>
        </div>

        <div className="h-12 w-px bg-[#E8E8E8] hidden md:block" />

        <div className="hidden md:flex flex-col justify-center gap-1">
          <div className="text-black text-[16px] font-bold">Kode</div>
          <div className="text-black/40 text-[15px] font-medium font-mono">{data.invoiceCode}</div>
        </div>

        <div className="h-12 w-px bg-[#E8E8E8] hidden md:block" />

        <div className="hidden md:flex flex-col justify-center gap-1">
          <div className="text-black text-[16px] font-bold">Kategori & Jasa</div>
          <div className="text-black/40 text-[15px] font-medium">
             {services.length} Layanan Terdaftar
          </div>
        </div>

        <div className="h-12 w-px bg-[#E8E8E8]" />

        <div className="flex flex-col justify-center gap-1">
          <div className="text-black text-[16px] font-bold">Status</div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-[#FFC02D]/10 rounded-[12px] border border-[#FFC02D]/10">
              <span className="text-[#FFC02D] text-[13px] font-bold">{data.statusWork}</span>
            </div>
            <span className="text-black/20 font-bold">•</span>
            <div className="px-3 py-1 bg-[#00A9F1]/10 rounded-[12px] border border-[#00A9F1]/10">
              <span className="text-[#00A9F1] text-[13px] font-bold uppercase">{data.statusPayment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="w-full self-stretch flex flex-col lg:flex-row items-start gap-[10px]">
        
        {/* KOLOM KIRI */}
        <div className="flex-1 w-full p-[30px] bg-white rounded-[12px] border border-[#E8E8E8] flex flex-col gap-8">
          
          {/* Informasi Umum */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={20} className="text-[#161616]" strokeWidth={2.5} />
                <span className="text-[#161616] text-[18px] font-bold tracking-tight">Informasi Umum</span>
              </div>
              <button onClick={onEditGeneral} className="px-4 py-2 rounded-[10px] border border-black/10 flex items-center gap-2 hover:bg-zinc-50 transition-all active:scale-95">
                <Edit3 size={16} className="text-[#F2C94C]" />
                <span className="text-[#161616] text-[11px] font-bold uppercase tracking-widest">Edit</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-[15px]">
                <span className="text-black/40 font-medium">Tanggal Masuk</span>
                <span className="text-[#161616] font-bold w-[220px]">: {data.entryDate}</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-black/40 font-medium">Estimasi Selesai</span>
                <span className="text-[#161616] font-bold w-[220px]">: {data.estimationDate}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-black/40 font-medium">Status Pengerjaan</span>
                <div className="w-[220px] flex items-center gap-2">
                  <span className="text-[#161616] font-bold">:</span>
                  <div className="px-3 py-1 bg-[#FFC02D]/10 rounded-[12px] flex items-center gap-2 border border-[#FFC02D]/20 cursor-pointer">
                    <span className="text-[#FFC02D] font-bold text-[13px]">{data.statusWork}</span>
                    <ChevronDown size={14} className="text-[#FFC02D]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E8E8E8]" />

          {/* Data Pelanggan */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Wrench size={20} className="text-[#161616]" strokeWidth={2.5} />
              <span className="text-[#161616] text-[18px] font-bold tracking-tight">Data Pelanggan</span>
            </div>
            <div className="flex flex-col gap-4 text-[15px]">
              <div className="flex justify-between">
                <span className="text-black/40 font-medium">Nama</span>
                <span className="text-[#161616] font-bold w-[220px]">: {data.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/40 font-medium">No HP</span>
                <span className="text-[#161616] font-bold w-[220px] font-mono">: {data.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/40 font-medium">Alamat</span>
                <span className="text-[#161616] font-bold w-[220px]">: {data.address}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E8E8E8]" />

          {/* Bahan Digunakan */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Box size={20} className="text-[#161616]" strokeWidth={2.5} />
                <span className="text-[#161616] text-[18px] font-bold tracking-tight">Bahan Digunakan</span>
              </div>
              <button onClick={onEditMaterials} className="px-4 py-2 rounded-[10px] border border-black/10 flex items-center gap-2 hover:bg-zinc-50 transition-all active:scale-95">
                <Edit3 size={16} className="text-[#F2C94C]" />
                <span className="text-[#161616] text-[11px] font-bold uppercase tracking-widest">Edit</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 text-[15px]">
              {materials.length > 0 ? materials.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-black/60 font-medium">{item.name}</span>
                  <span className="text-[#161616] font-bold w-[220px]">: {item.qty} {item.unit}</span>
                </div>
              )) : (
                <span className="text-black/30 italic text-sm">Tidak ada bahan yang digunakan</span>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="flex-1 w-full p-[30px] bg-white rounded-[12px] border border-[#E8E8E8] flex flex-col justify-between min-h-[700px]">
          
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#161616]" strokeWidth={2.5} />
                <span className="text-[#161616] text-[18px] font-bold tracking-tight">Layanan</span>
              </div>
              <button onClick={onEditServices} className="px-4 py-2 rounded-[10px] border border-black/10 flex items-center gap-2 hover:bg-zinc-50 transition-all active:scale-95">
                <Edit3 size={16} className="text-[#F2C94C]" />
                <span className="text-[#161616] text-[11px] font-bold uppercase tracking-widest">Edit</span>
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {services.map((service, idx) => (
                <div key={service.id || idx} className={`flex justify-between items-start ${idx !== services.length - 1 ? 'pb-6 border-b border-[#E8E8E8]' : ''}`}>
                  <div className="flex gap-4">
                    <span className="text-[#161616] font-bold text-base">{idx + 1}.</span>
                    <div>
                      <div className="text-[#161616] font-bold text-base">{service.category} - {service.subCategory}</div>
                      <div className="text-black/40 text-[13px] italic mt-1 font-medium leading-relaxed max-w-[250px]">
                        {service.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#161616] font-bold text-base w-[120px] text-right">
                    {formatIDR(service.price)}
                  </div>
                </div>
              ))}
              {services.length === 0 && <div className="text-center py-10 text-black/30">Belum ada layanan dipilih</div>}
            </div>
          </div>

          {/* Bagian Pembayaran */}
          <div className="flex flex-col gap-5 pt-8">
            <div className="h-px bg-[#E8E8E8] w-full" />
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={20} className="text-[#161616]" strokeWidth={2.5} />
              <span className="text-[#161616] text-[16px] font-bold tracking-tight">Pembayaran</span>
            </div>
            
            <div className="flex flex-col gap-4 text-[15px]">
              <div className="flex justify-between items-center">
                <span className="text-black/40 font-medium">Status Transaksi</span>
                <div className="w-[180px] flex items-center gap-2">
                  <span className="text-[#161616] font-bold">:</span>
                  <div className="px-3 py-1 bg-[#00A9F1]/10 rounded-[12px] border border-[#00A9F1]/10">
                    <span className="text-[#00A9F1] font-bold text-[11px] uppercase">{data.statusPayment}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-black/40 font-medium">Metode Pembayaran</span>
                <span className="text-[#161616] font-bold w-[180px]">: {data.paymentMethod}</span>
              </div>
              <div className="h-px bg-[#E8E8E8]/50 w-full" />
              <div className="flex justify-between">
                <span className="text-black/60 font-medium text-sm">Total Harga</span>
                <span className="text-[#161616] font-bold w-[180px]">: {formatIDR(data.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60 font-medium text-sm">DP Dibayar</span>
                <span className="text-[#161616] font-bold w-[180px]">: {formatIDR(data.dpPaid || 0)}</span>
              </div>
              <div className="h-px bg-[#E8E8E8] w-full mt-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-[#161616] font-bold text-[16px]">Total Sisa Tagihan</span>
                <span className="text-[#161616] font-black text-[24px] w-[180px] text-left leading-none tracking-tighter">
                  {formatIDR(data.remainingBill || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}