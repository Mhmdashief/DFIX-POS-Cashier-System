"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X, User, Wrench, CreditCard, ChevronDown, FileText,
  Check, Plus, Search, Minus, Printer, Trash2, Package
} from "lucide-react";
import { saveTransactionAction } from "@/app/actions/transaction";
import { getCustomers } from "@/app/actions/customer";
import { getMaterials } from "@/app/actions/material";
import { getServices } from "@/app/actions/service";

// --- CUSTOM DROPDOWN ---
function CustomDropdown({ label, value, onChange, options, placeholder, icon: Icon, compact }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="space-y-1 w-full" ref={ref}>
      <label className={compact ? "text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-0.5" : "text-[11px] font-bold text-zinc-500 ml-0.5 uppercase tracking-wider"}>{label}</label>
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between pr-4 py-2.5 bg-white border rounded-xl text-sm transition-all ${Icon ? "pl-11" : "pl-3.5"} ${isOpen ? "border-orange-400 ring-2 ring-orange-50" : "border-zinc-200"}`}>
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pr-2.5 border-r border-zinc-100 h-5">
              <Icon className="text-orange-400" size={15} />
            </div>
          )}
          <span className={`truncate ${value ? "text-zinc-800" : "text-zinc-400"} font-semibold`}>{value || placeholder}</span>
          <ChevronDown className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} size={15} />
        </button>
        {isOpen && (
          <div className="absolute z-[110] mt-1.5 w-full bg-white border border-zinc-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {options.map((opt: string) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 text-zinc-700 flex justify-between items-center border-b border-zinc-50 last:border-0 font-medium">
                {opt} {value === opt && <Check size={14} className="text-orange-500" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Step = "INFO" | "ITEMS" | "MATERIAL_ADD";

const EMPTY_ITEM = { itemName: "", serviceName: "", category: "", description: "", price: "" };
const EMPTY_MAT = { id: "", category: "", name: "", variant: "", qty: 1, maxStock: 0 };

export default function ModalTransaksiBaru({ isOpen, onClose, onRefresh }: any) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("INFO");
  const [isPending, setIsPending] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // INFO form
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [dpDibayar, setDpDibayar] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("");
  const [tipeBayar, setTipeBayar] = useState<"DP" | "LUNAS">("DP");

  // Multi-item state
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  // Material state
  const [usedMaterials, setUsedMaterials] = useState<any[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({ ...EMPTY_MAT });

  const opsiMetode = ["Tunai", "Transfer", "QRIS"];

  useEffect(() => {
    if (isOpen) {
      Promise.all([getCustomers(), getMaterials(), getServices()]).then(([c, m, s]) => {
        if (c) setCustomers(c);
        if (m) setAllMaterials(m);
        if (s) setServices(s);
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setStep("INFO");
      setItems([{ ...EMPTY_ITEM }]);
      setUsedMaterials([]);
      setTipeBayar("DP");
      setDpDibayar("");
      setCustomerId("");
      setCustomerName("");
      setMetodeBayar("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Derived values ──
  const activeServices = services.filter(s => s.status === "Aktif");
  const totalAmount = items.reduce((sum, it) => sum + (parseInt(it.price) || 0), 0);
  const dpAmt = tipeBayar === "LUNAS" ? totalAmount : (parseInt(dpDibayar) || 0);
  const sisa = totalAmount - dpAmt;

  const categories = Array.from(new Set(allMaterials.map(m => m.category)));
  const matByCategory = allMaterials.filter(m => m.category === currentMaterial.category);
  const matNames = Array.from(new Set(matByCategory.map(m => m.name)));
  const matVariants = matByCategory.filter(m => m.name === currentMaterial.name).map(m => m.variant).filter(Boolean);

  // ── Item helpers ──
  const updateItem = (idx: number, field: string, val: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };
  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleAddMaterial = () => {
    if (!currentMaterial.name || currentMaterial.qty <= 0) return;
    if (currentMaterial.qty > currentMaterial.maxStock) { alert("Jumlah melebihi stok!"); return; }
    setUsedMaterials(prev => [...prev, { ...currentMaterial }]);
    setCurrentMaterial({ ...EMPTY_MAT });
    setStep("ITEMS");
  };

  const handleSubmit = async () => {
    if (!customerName) { alert("Nama pelanggan harus diisi!"); return; }
    if (items.some(it => !it.itemName)) { alert("Nama barang tidak boleh kosong!"); return; }
    if (!metodeBayar) { alert("Metode pembayaran harus dipilih!"); return; }

    setIsPending(true);
    try {
      const payStatus = tipeBayar === "LUNAS" ? "LUNAS" : "DP_BAYAR";
      const payload: any = {
        invoiceCode: `DFX-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName,
        totalAmount,
        dpAmount: dpAmt,
        paymentStatus: payStatus,
        orderStatus: "Diproses",
        paymentMethod: metodeBayar,
        materials: usedMaterials,
        items: items.map(it => ({
          itemName: it.itemName,
          serviceName: it.serviceName || null,
          category: it.category || null,
          description: it.description || null,
          price: parseInt(it.price) || 0,
        })),
      };
      if (customerId) payload.customerId = customerId;

      const result = await saveTransactionAction(payload) as { success: boolean; id?: string; error?: string };
      if (result.success && result.id) {
        onRefresh();
        onClose();
        router.push(`/print/transaksi/${result.id}`);
      } else {
        alert("Gagal menyimpan: " + result.error);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-[1.8rem] w-full max-w-[460px] mx-4 shadow-2xl font-sans overflow-hidden">

        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-zinc-50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {step === "INFO" ? "Informasi Transaksi" : step === "ITEMS" ? "Daftar Barang" : "Tambah Bahan"}
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {step === "INFO" ? "Data pelanggan & pembayaran" : step === "ITEMS" ? "Input semua barang dalam 1 nota" : "Pilih bahan yang digunakan"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 border border-zinc-100 rounded-full text-zinc-400 hover:bg-zinc-50"><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {["INFO", "ITEMS"].map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step === s || (step === "MATERIAL_ADD" && s === "ITEMS") ? "bg-[#2D4E53]" : i < ["INFO", "ITEMS"].indexOf(step) ? "bg-[#2D4E53]/40" : "bg-zinc-100"}`} />
          ))}
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto">

          {/* ── STEP 1: INFO ── */}
          {step === "INFO" && (
            <div className="space-y-4">
              <CustomDropdown label="Nama Pelanggan" value={customerName} options={customers.map(c => c.name)}
                placeholder="Pilih Pelanggan" icon={User}
                onChange={(val: string) => { setCustomerName(val); setCustomerId(customers.find(c => c.name === val)?.id || ""); }} />

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tipe Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: "DP", label: "Bayar DP", color: "bg-[#2D4E53] border-[#2D4E53] text-white shadow-md" },
                    { val: "LUNAS", label: "Lunas Sekarang", color: "bg-emerald-600 border-emerald-600 text-white shadow-md" }
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => { setTipeBayar(opt.val as "DP" | "LUNAS"); setDpDibayar(""); }}
                      className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${tipeBayar === opt.val ? opt.color : "bg-white border-zinc-200 text-zinc-500"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {tipeBayar === "DP" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Nominal DP Dibayar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-[10px]">RP</span>
                    <input type="number" placeholder="0" value={dpDibayar} onChange={e => setDpDibayar(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 font-semibold" />
                  </div>
                </div>
              )}

              <CustomDropdown label="Metode Pembayaran" value={metodeBayar} options={opsiMetode}
                placeholder="Pilih Metode Pembayaran" icon={CreditCard} onChange={setMetodeBayar} />
            </div>
          )}

          {/* ── STEP 2: ITEMS ── */}
          {step === "ITEMS" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-orange-400" />
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Daftar Barang Reparasi</span>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="border border-zinc-100 rounded-xl p-4 space-y-3 bg-zinc-50/50 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-black text-zinc-700">Barang #{idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-1 text-zinc-300 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nama Barang *</label>
                    <input
                      placeholder="cth: Sepatu Nike, Tas Kulit..."
                      value={item.itemName}
                      onChange={e => updateItem(idx, "itemName", e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <CustomDropdown
                      label="Jenis Jasa"
                      value={item.serviceName}
                      placeholder="Pilih Jasa"
                      compact
                      options={activeServices.map(s => s.name)}
                      onChange={(selectedName: string) => {
                        const svc = activeServices.find(s => s.name === selectedName);
                        if (svc) {
                          setItems(prev => prev.map((it, i) => i === idx ? { 
                            ...it, 
                            serviceName: selectedName,
                            category: svc.category || "",
                            price: svc.price.toString()
                          } : it));
                        } else {
                          setItems(prev => prev.map((it, i) => i === idx ? { 
                            ...it, 
                            serviceName: "",
                            category: "",
                            price: ""
                          } : it));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Harga (Rp)</label>
                      <input type="number" placeholder="0" value={item.price}
                        onChange={e => updateItem(idx, "price", e.target.value)}
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-orange-400 bg-white font-semibold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Keterangan Kerusakan</label>
                    <input placeholder="Deskripsi kerusakan (opsional)" value={item.description}
                      onChange={e => updateItem(idx, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white" />
                  </div>
                </div>
              ))}

              <button type="button" onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-[12px] font-bold text-zinc-400 hover:border-orange-300 hover:text-orange-400 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Tambah Barang Lagi
              </button>

              {/* Bahan separator */}
              <div className="border-t border-zinc-100 pt-3">
                <button type="button" onClick={() => setStep("MATERIAL_ADD")}
                  className="w-full py-2.5 border border-zinc-200 rounded-xl text-[12px] font-bold text-zinc-500 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                  <Search size={13} /> {usedMaterials.length > 0 ? `${usedMaterials.length} Bahan Ditambahkan` : "Tambah Bahan (Opsional)"}
                </button>
              </div>

              {/* Live total */}
              {totalAmount > 0 && (
                <div className={`p-3 rounded-xl text-[12px] font-bold border ${tipeBayar === "LUNAS" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
                  {items.length} barang · Total: <span className="font-black">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  {tipeBayar === "DP" && <> · Sisa: <span className="text-red-500 font-black">Rp {Math.max(0, sisa).toLocaleString("id-ID")}</span></>}
                </div>
              )}
            </div>
          )}

          {/* ── STEP MATERIAL_ADD ── */}
          {step === "MATERIAL_ADD" && (
            <div className="space-y-4">
              <CustomDropdown label="Kategori Bahan" value={currentMaterial.category} options={categories}
                placeholder="Pilih Kategori" icon={Wrench}
                onChange={(val: string) => setCurrentMaterial({ ...EMPTY_MAT, category: val })} />
              <CustomDropdown label="Nama Bahan" value={currentMaterial.name} options={matNames}
                placeholder="Pilih Bahan" icon={Wrench}
                onChange={(val: string) => {
                  const m = matByCategory.find(x => x.name === val);
                  setCurrentMaterial(p => ({ ...p, name: val, variant: "", maxStock: m?.stock || 0, id: m?.id || "" }));
                }} />
              {matVariants.length > 0 && (
                <CustomDropdown label="Varian" value={currentMaterial.variant} options={matVariants}
                  placeholder="Pilih Varian" icon={Wrench}
                  onChange={(val: string) => {
                    const m = matByCategory.find(x => x.name === currentMaterial.name && x.variant === val);
                    setCurrentMaterial(p => ({ ...p, variant: val, maxStock: m?.stock || p.maxStock, id: m?.id || p.id }));
                  }} />
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Jumlah</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <button type="button" onClick={() => setCurrentMaterial(p => ({ ...p, qty: Math.max(1, p.qty - 1) }))}
                      className="px-4 py-2 hover:bg-zinc-50 border-r border-zinc-200"><Minus size={14} className="text-zinc-600" /></button>
                    <span className="w-12 text-center text-sm font-black text-[#2D4E53]">{currentMaterial.qty}</span>
                    <button type="button" onClick={() => setCurrentMaterial(p => ({ ...p, qty: Math.min(p.maxStock, p.qty + 1) }))}
                      disabled={currentMaterial.qty >= currentMaterial.maxStock}
                      className="px-4 py-2 hover:bg-zinc-50 border-l border-zinc-200 disabled:opacity-30"><Plus size={14} className="text-zinc-600" /></button>
                  </div>
                  {currentMaterial.name && <span className={`text-[10px] font-bold uppercase ${currentMaterial.maxStock < 5 ? "text-red-500" : "text-zinc-400"}`}>Stok: {currentMaterial.maxStock}</span>}
                </div>
              </div>
              <button type="button" onClick={handleAddMaterial}
                disabled={!currentMaterial.name || currentMaterial.qty > currentMaterial.maxStock || currentMaterial.maxStock === 0}
                className="w-full py-3 bg-[#2D4E53] text-white rounded-xl text-[13px] font-bold disabled:opacity-40 hover:bg-[#233d40] transition-all">
                Tambah Bahan
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-zinc-50 grid grid-cols-2 gap-3 bg-zinc-50/30">
          {step === "INFO" ? (
            <>
              <button type="button" onClick={onClose} className="py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">Batal</button>
              <button type="button" onClick={() => setStep("ITEMS")} className="py-3 bg-[#2D4E53] text-white rounded-xl text-sm font-bold hover:bg-[#233d40] transition-all">Selanjutnya →</button>
            </>
          ) : step === "MATERIAL_ADD" ? (
            <>
              <button type="button" onClick={() => setStep("ITEMS")} className="py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold">← Kembali</button>
              <div className="py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold text-zinc-300 text-center">Tambah dulu ↑</div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep("INFO")} className="py-3 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-sm font-bold">← Kembali</button>
              <button type="button" onClick={handleSubmit} disabled={isPending}
                className="py-3 bg-[#2D4E53] text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#233d40] transition-all">
                {isPending ? "Menyimpan..." : <><Printer size={15} /> Simpan & Cetak</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}