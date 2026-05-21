"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, User, Wrench, CreditCard, ChevronDown, FileText, Check, Plus, Search, Minus, ArrowLeft, Printer } from "lucide-react";
import { saveTransactionAction } from "@/app/actions/transaction";
import { getCustomers } from "@/app/actions/customer";
import { getMaterials } from "@/app/actions/material";
import { getServices } from "@/app/actions/service";


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
          className={`w-full flex items-center justify-between pl-11 pr-4 py-2.5 bg-white border rounded-xl text-sm transition-all ${isOpen ? "border-orange-400 ring-2 ring-orange-50" : "border-zinc-200"
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

type Step = "INFO" | "MATERIAL_LIST" | "MATERIAL_ADD";

export default function ModalTransaksiBaru({ isOpen, onClose, onRefresh }: any) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("INFO");
  const [isPending, setIsPending] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);


  // Form State
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [jenisJasa, setJenisJasa] = useState("");
  const [kategori, setKategori] = useState("");
  const [catatan, setCatatan] = useState("");
  const [estimasiHarga, setEstimasiHarga] = useState("");
  const [dpDibayar, setDpDibayar] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("");
  const [tipeBayar, setTipeBayar] = useState<"DP" | "LUNAS">("DP");

  // Materials State
  const [usedMaterials, setUsedMaterials] = useState<any[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    id: "",
    category: "",
    name: "",
    variant: "",
    qty: 1,
    maxStock: 0
  });

  const opsiMetode = ["Tunai", "Transfer", "QRIS"];


  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [custRes, matRes, servRes] = await Promise.all([getCustomers(), getMaterials(), getServices()]);
        if (custRes) setCustomers(custRes);
        if (matRes) setAllMaterials(matRes);
        if (servRes) setServices(servRes);
      };

      fetchData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setStep("INFO");
      setUsedMaterials([]);
      setTipeBayar("DP");
      setDpDibayar("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep("MATERIAL_LIST");
  const handleBack = () => {
    if (step === "MATERIAL_LIST") setStep("INFO");
    else if (step === "MATERIAL_ADD") setStep("MATERIAL_LIST");
  };

  const handleAddMaterial = () => {
    if (currentMaterial.name && currentMaterial.qty > 0) {
      // Validasi Stok Akhir
      if (currentMaterial.qty > currentMaterial.maxStock) {
        alert("Jumlah melebihi stok yang tersedia!");
        return;
      }
      setUsedMaterials([...usedMaterials, { ...currentMaterial }]);
      setCurrentMaterial({ id: "", category: "", name: "", variant: "", qty: 1, maxStock: 0 });
      setStep("MATERIAL_LIST");
    }
  };

  const removeMaterial = (index: number) => {
    setUsedMaterials(usedMaterials.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!customerName) { alert("Nama pelanggan harus diisi!"); return; }
    if (!jenisJasa) { alert("Jenis jasa harus dipilih!"); return; }
    if (!metodeBayar) { alert("Metode pembayaran harus dipilih!"); return; }

    setIsPending(true);
    try {
      const totalAmt = parseInt(estimasiHarga) || 0;
      const dpAmt = tipeBayar === "LUNAS" ? totalAmt : (parseInt(dpDibayar) || 0);
      const payStatus = tipeBayar === "LUNAS" ? "LUNAS" : "DP_BAYAR";

      // Only include valid Transaction schema fields
      const payload: any = {
        invoiceCode: `DFX-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName,
        serviceName: jenisJasa,
        category: kategori,
        notes: catatan,
        totalAmount: totalAmt,
        dpAmount: dpAmt,
        paymentStatus: payStatus,
        orderStatus: "Diproses",
        paymentMethod: metodeBayar,
        materials: usedMaterials,
      };

      // Only attach customerId if it's a valid non-empty string
      if (customerId && customerId.trim() !== "") {
        payload.customerId = customerId;
      }

      const result = await saveTransactionAction(payload) as { success: boolean; id?: string; error?: string };

      if (result.success && result.id) {
        // Reset all form state
        setCustomerId("");
        setCustomerName("");
        setJenisJasa("");
        setKategori("");
        setCatatan("");
        setEstimasiHarga("");
        setDpDibayar("");
        setMetodeBayar("");
        setUsedMaterials([]);
        setStep("INFO");
        onRefresh();
        onClose();
        // Langsung arahkan ke halaman cetak nota
        router.push(`/print/transaksi/${result.id}`);
      } else {
        alert("Gagal menyimpan transaksi: " + result.error);
      }

    } finally {
      setIsPending(false);
    }
  };

  const categories = Array.from(new Set(allMaterials.map(m => m.category)));
  const materialsByCategory = allMaterials.filter(m => m.category === currentMaterial.category);

  // Get unique names for the selected category
  const materialNames = Array.from(new Set(materialsByCategory.map(m => m.name)));

  // Get variants for the selected material name
  const variantsByMaterial = materialsByCategory.filter(m => m.name === currentMaterial.name).map(m => m.variant).filter(Boolean);

  // Dynamic Options for Service and Category
  const activeServices = services.filter(s => s.status === "Aktif");
  const opsiJasa = activeServices.map(s => s.name);
  const selectedService = activeServices.find(s => s.name === jenisJasa);
  const opsiKategori = selectedService
    ? (selectedService.category?.split(',').map((c: string) => c.trim()) || [])
    : [];


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
      <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>

      <div className="relative bg-white rounded-[1.8rem] w-full max-w-[420px] mx-4 shadow-2xl font-sans overflow-hidden">

        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-zinc-50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{step === "INFO" ? "Tambah Transaksi" : "Tambah Bahan"}</h2>
            <p className="text-[11px] text-zinc-400">Data akan langsung digunakan untuk transaksi ini</p>
          </div>
          <button onClick={onClose} className="p-2 border border-zinc-100 rounded-full text-zinc-400 hover:bg-zinc-50 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === "INFO" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-orange-400" />
                <span className="text-sm font-bold text-zinc-800 tracking-tight uppercase">Informasi Transaksi</span>
              </div>
              <CustomDropdown label="Nama Pelanggan" value={customerName} options={customers.map(c => c.name)} placeholder="Pilih Pelanggan" icon={User} onChange={(val: string) => { setCustomerName(val); setCustomerId(customers.find(c => c.name === val)?.id); }} />
              <CustomDropdown label="Jenis Jasa" value={jenisJasa} options={opsiJasa} placeholder="Pilih Jenis Jasa" icon={Wrench} onChange={setJenisJasa} />
              <CustomDropdown label="Kategori" value={kategori} options={opsiKategori} placeholder="Pilih Kategori Barang" icon={Wrench} onChange={setKategori} />
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Catatan Customer</label>
                <input placeholder="Tulis kebutuhan customer" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 placeholder:text-zinc-300" />
              </div>
              {/* ESTIMASI HARGA */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Estimasi Harga</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-[10px]">RP</span>
                  <input type="number" placeholder="0" value={estimasiHarga} onChange={(e) => setEstimasiHarga(e.target.value)} className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 font-semibold" />
                </div>
              </div>

              {/* TIPE PEMBAYARAN TOGGLE */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Tipe Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTipeBayar("DP"); setDpDibayar(""); }}
                    className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${tipeBayar === "DP"
                      ? "bg-[#2D4E53] border-[#2D4E53] text-white shadow-md shadow-[#2D4E53]/20"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                      }`}
                  >
                    Bayar DP
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipeBayar("LUNAS"); setDpDibayar(""); }}
                    className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${tipeBayar === "LUNAS"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                      }`}
                  >
                    Lunas Sekarang
                  </button>
                </div>
              </div>

              {/* NOMINAL DP — hanya muncul saat tipe DP */}
              {tipeBayar === "DP" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Nominal DP Dibayar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-[10px]">RP</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={dpDibayar}
                      onChange={(e) => setDpDibayar(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* LIVE PREVIEW TAGIHAN */}
              {estimasiHarga && parseInt(estimasiHarga) > 0 && (
                <div className={`p-3 rounded-xl border text-[12px] font-bold ${tipeBayar === "LUNAS"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-blue-50 border-blue-100 text-blue-700"
                  }`}>
                  {tipeBayar === "LUNAS" ? (
                    <span>✅ Transaksi akan dicatat sebagai <span className="font-black">LUNAS</span> — Rp {parseInt(estimasiHarga).toLocaleString("id-ID")}</span>
                  ) : (
                    <span>
                      DP: <span className="font-black">Rp {(parseInt(dpDibayar) || 0).toLocaleString("id-ID")}</span>
                      {" · "}
                      Sisa: <span className="font-black text-red-500">Rp {Math.max(0, parseInt(estimasiHarga) - (parseInt(dpDibayar) || 0)).toLocaleString("id-ID")}</span>
                    </span>
                  )}
                </div>
              )}

              <CustomDropdown label="Pilih Metode Pembayaran" value={metodeBayar} options={opsiMetode} placeholder="Pilih Metode Pembayarannya" icon={CreditCard} onChange={setMetodeBayar} />
            </div>
          )}

          {step === "MATERIAL_LIST" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {usedMaterials.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <button key={i} onClick={() => setStep("MATERIAL_ADD")} className="w-full p-4 border border-zinc-100 rounded-xl flex items-center gap-4 hover:bg-zinc-50 transition-colors group text-left">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Plus size={16} />
                        </div>
                        <span className="text-sm font-bold text-zinc-600">Tambah Bahan {i}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usedMaterials.map((m, idx) => (
                      <div key={idx} className="w-full p-4 border border-zinc-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-zinc-800">{idx + 1}. {m.name} {m.qty}pcs</span>
                        </div>
                        <button onClick={() => removeMaterial(idx)} className="p-1 text-zinc-400 hover:text-red-500"><Minus size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => setStep("MATERIAL_ADD")} className="w-full p-4 border border-dashed border-zinc-200 rounded-xl flex items-center gap-3 text-zinc-400 hover:bg-zinc-50 transition-colors">
                      <Plus size={16} />
                      <span className="text-sm font-bold">Tambah Bahan Lainnya</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "MATERIAL_ADD" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-bold text-zinc-800">Bahan 1</span>
                <div className="relative w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input placeholder="Search bahan" className="w-full pl-9 pr-3 py-1.5 border border-zinc-100 rounded-lg text-xs outline-none" />
                </div>
              </div>

              <CustomDropdown label="Pilih Kategori" value={currentMaterial.category} options={categories} placeholder="Pilih Kategori" icon={Wrench} onChange={(val: string) => setCurrentMaterial({ ...currentMaterial, category: val, name: "", variant: "" })} />
              <CustomDropdown label="Pilih Bahan" value={currentMaterial.name} options={materialNames} placeholder="Pilih Bahan" icon={Wrench} onChange={(val: string) => {
                const mat = materialsByCategory.find(m => m.name === val);
                setCurrentMaterial({ ...currentMaterial, name: val, variant: "", maxStock: mat?.stock || 0, id: mat?.id || "" });
              }} />
              <CustomDropdown label="Pilih Varian" value={currentMaterial.variant} options={variantsByMaterial} placeholder="Pilih Varian" icon={Wrench} onChange={(val: string) => {
                const mat = materialsByCategory.find(m => m.name === currentMaterial.name && m.variant === val);
                setCurrentMaterial({ ...currentMaterial, variant: val, maxStock: mat?.stock || currentMaterial.maxStock, id: mat?.id || currentMaterial.id });
              }} />

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider">Jumlah Bahan Transaksi</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setCurrentMaterial({ ...currentMaterial, qty: Math.max(1, currentMaterial.qty - 1) })}
                      className="px-4 py-2 hover:bg-zinc-50 border-r border-zinc-200 transition-colors"
                    >
                      <Minus size={14} className="text-zinc-600" />
                    </button>
                    <input
                      type="number"
                      value={currentMaterial.qty}
                      readOnly
                      className="w-14 text-center text-sm font-black text-[#2D4E53] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentMaterial({ ...currentMaterial, qty: Math.min(currentMaterial.maxStock, currentMaterial.qty + 1) })}
                      disabled={currentMaterial.qty >= currentMaterial.maxStock}
                      className="px-4 py-2 hover:bg-zinc-50 border-l border-zinc-200 transition-colors disabled:opacity-30 disabled:bg-zinc-50"
                    >
                      <Plus size={14} className="text-zinc-600" />
                    </button>
                  </div>
                  {currentMaterial.name && (
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${currentMaterial.maxStock < 5 ? "text-red-500" : "text-zinc-400"}`}>
                        Stok Tersedia: {currentMaterial.maxStock}
                      </span>
                      {currentMaterial.qty >= currentMaterial.maxStock && (
                        <span className="text-[9px] font-bold text-red-500 italic mt-0.5">
                          * Batas maksimal stok tercapai
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMaterial}
                disabled={!currentMaterial.name || currentMaterial.qty > currentMaterial.maxStock || currentMaterial.maxStock === 0}
                className="w-full py-3.5 bg-[#2D4E53] text-white rounded-xl text-[13px] font-bold shadow-lg shadow-[#2D4E53]/20 hover:bg-[#233d40] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tambah Bahan
              </button>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 border-t border-zinc-50 grid grid-cols-2 gap-3 bg-zinc-50/30">
          {step === "INFO" ? (
            <>
              <button type="button" onClick={onClose} className="w-full py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold active:scale-95 hover:bg-zinc-50 transition-all">Batal</button>
              <button type="button" onClick={handleNext} className="w-full py-3 bg-[#2D4E53] text-white rounded-xl text-sm font-bold active:scale-95 shadow-md hover:bg-[#233d40] transition-all">Next</button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleBack} className="w-full py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold active:scale-95 hover:bg-zinc-50 transition-all">Kembali</button>
              <button type="button" onClick={handleSubmit} disabled={isPending} className="w-full py-3 bg-[#2D4E53] text-white rounded-xl text-sm font-bold active:scale-95 shadow-md hover:bg-[#233d40] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Printer size={15} />
                    Simpan & Cetak Nota
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}