"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Wrench, CreditCard, ChevronDown, FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- KOMPONEN DROPDOWN KUSTOM ---
function CustomDropdown({ label, value, onChange, options, placeholder, icon: Icon }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between pl-11 pr-4 py-2.5 bg-white border rounded-xl text-sm transition-all ${
            isOpen ? "border-orange-400 ring-2 ring-orange-50" : "border-zinc-200"
          }`}
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pr-2.5 border-r border-zinc-100 h-5">
            <Icon className="text-orange-400" size={15} />
          </div>
          <span className={`truncate ${value ? "text-zinc-800" : "text-zinc-400"}`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} size={15} />
        </button>

        {isOpen && (
          /* z-index tinggi dan posisi absolute agar tidak terpotong */
          <div className="absolute z-[110] mt-1.5 w-full bg-white border border-zinc-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in duration-150">
            {options.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 text-zinc-700 flex justify-between items-center transition-colors border-b border-zinc-50 last:border-0"
              >
                {opt}
                {value === opt && <Check size={14} className="text-orange-500" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModalTransaksiBaru({ isOpen, onClose, onRefresh }: any) {
  const [isPending, setIsPending] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [jenisJasa, setJenisJasa] = useState("");
  const [kategori, setKategori] = useState("");
  const [catatan, setCatatan] = useState("");
  const [estimasiHarga, setEstimasiHarga] = useState("");
  const [dpDibayar, setDpDibayar] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("");

  const opsiJasa = ["Reparasi Barang", "Customisasi Barang", "Laundry/SPA", "Re-Coloring", "Chrome Barang", "Duplikat Kunci"];
  const opsiKategori = ["Sepatu", "Tas", "Koper", "Jaket", "Kunci", "Barang Lainnya"];
  const opsiMetode = ["Tunai", "Transfer", "QRIS"];

  useEffect(() => {
    if (isOpen) {
      const fetchCustomers = async () => {
        const { data } = await supabase.from("Customer").select("id, name");
        if (data) setCustomers(data);
      };
      fetchCustomers();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const { error } = await supabase.from("Transaction").insert([{
      invoiceCode: `DFX-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId,
      notes: `${jenisJasa} - ${kategori} (${catatan})`,
      totalAmount: parseInt(estimasiHarga) || 0,
      remainingBalance: (parseInt(estimasiHarga) || 0) - (parseInt(dpDibayar) || 0),
      paymentStatus: parseInt(dpDibayar) >= parseInt(estimasiHarga) ? "Lunas" : "DP Bayar",
      orderStatus: "Antri"
    }]);
    if (!error) { onRefresh(); onClose(); }
    setIsPending(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
      <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>

      {/* Menghapus overflow-hidden agar dropdown bisa 'keluar' dari modal jika perlu */}
      <div className="relative bg-white rounded-[1.8rem] w-full max-w-[400px] mx-4 shadow-2xl font-sans">
        
        <div className="p-5 pb-3 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Tambah Transaksi</h2>
            <p className="text-[11px] text-zinc-400">Data akan langsung digunakan untuk transaksi</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-zinc-100 rounded-full text-zinc-400 hover:bg-zinc-50"><X size={16} /></button>
        </div>

        <div className="px-5"><div className="h-[1px] w-full bg-zinc-100 mb-4"></div></div>

        {/* Area Form */}
        <div className="px-5 pb-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText size={14} className="text-orange-400" />
                <span className="text-sm font-bold text-zinc-800 tracking-tight">Informasi Transaksi</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                <CustomDropdown 
                    label="Nama Pelanggan" 
                    value={customerName}
                    options={customers.map(c => c.name)}
                    placeholder="Pilih Pelanggan"
                    icon={User}
                    onChange={(val: string) => {
                        setCustomerName(val);
                        setCustomerId(customers.find(c => c.name === val)?.id);
                    }}
                />

                <CustomDropdown 
                    label="Jenis Jasa" 
                    value={jenisJasa}
                    options={opsiJasa}
                    placeholder="Pilih Jenis Jasa"
                    icon={Wrench}
                    onChange={setJenisJasa}
                />

                <CustomDropdown 
                    label="Kategori" 
                    value={kategori}
                    options={opsiKategori}
                    placeholder="Pilih Kategori Barang"
                    icon={Wrench}
                    onChange={setKategori}
                />

                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Catatan Customer</label>
                    <input 
                        placeholder="Tulis kebutuhan customer"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 placeholder:text-zinc-300"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Estimasi Harga</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-[10px]">RP</span>
                            <input type="number" placeholder="0" value={estimasiHarga} onChange={(e) => setEstimasiHarga(e.target.value)}
                                className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 font-semibold"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">DP Dibayar</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-[10px]">RP</span>
                            <input type="number" placeholder="0" value={dpDibayar} onChange={(e) => setDpDibayar(e.target.value)}
                                className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 font-semibold"
                            />
                        </div>
                    </div>
                </div>

                {/* Dropdown terakhir yang sering ketutupan */}
                <CustomDropdown 
                    label="Metode Pembayaran" 
                    value={metodeBayar}
                    options={opsiMetode}
                    placeholder="Pilih Metode"
                    icon={CreditCard}
                    onChange={setMetodeBayar}
                />

                <div className="grid grid-cols-2 gap-3 pt-3">
                    <button type="button" onClick={onClose} className="w-full py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold active:scale-95">Batal</button>
                    <button type="submit" disabled={isPending} className="w-full py-2.5 bg-[#2D4E53] text-white rounded-xl text-sm font-bold active:scale-95 shadow-md">
                        {isPending ? "..." : "Next"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}