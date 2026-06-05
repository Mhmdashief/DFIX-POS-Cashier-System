"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, User, FileText,
  CreditCard, Package, Printer, CheckCircle2, X,
  Wallet, ChevronDown, Check, ShoppingBag, CheckCheck
} from "lucide-react";
import {
  getTransactionById,
  updatePaymentStatusAction,
  updateItemStatusAction,
  markItemPickedUpAction,
} from "@/app/actions/transaction";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: any) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export default function DetailTransaksiKasirPage() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [payMethodDropdownOpen, setPayMethodDropdownOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    if (!params?.id) { setErrorMsg("ID tidak ditemukan"); setLoading(false); return; }
    setLoading(true);
    try {
      const trx = await getTransactionById(params.id as string);
      if (!trx) throw new Error("Transaksi tidak ditemukan");
      setData(trx);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleLunasi = async () => {
    if (!payMethod) { alert("Pilih metode pembayaran terlebih dahulu"); return; }
    setPaying(true);
    try {
      const res = await updatePaymentStatusAction(data.id, "LUNAS", payMethod) as { success: boolean; error?: string };
      if (!res.success) throw new Error(res.error);
      await fetchData();
      setShowPayPanel(false);
      setPayMethod("");
    } catch (e: any) {
      alert("Gagal melunasi: " + e.message);
    } finally {
      setPaying(false);
    }
  };

  const handleItemStatus = async (itemId: string, status: string) => {
    setActionLoading(itemId + status);
    try {
      const res = await updateItemStatusAction(itemId, status) as { success: boolean; error?: string };
      if (!res.success) throw new Error(res.error);
      await fetchData();
    } catch (e: any) {
      alert("Gagal update status: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickUp = async (itemId: string) => {
    setActionLoading(itemId + "pickup");
    try {
      const res = await markItemPickedUpAction(itemId) as { success: boolean; error?: string };
      if (!res.success) throw new Error(res.error);
      await fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => window.open(`/print/transaksi/${params.id}`, "_blank");

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#2D4F53]" size={36} />
      <p className="text-sm font-medium text-zinc-400 tracking-widest">MEMUAT DATA...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
      <AlertCircle className="text-red-400" size={36} />
      <p className="text-red-500 font-bold">{errorMsg}</p>
      <button onClick={() => router.back()} className="text-zinc-400 underline text-sm">Kembali</button>
    </div>
  );

  const nama = data?.customer?.name || data?.customerName || "Umum";
  const hp = data?.customer?.phone || "-";
  const alamat = data?.customer?.address || "-";
  const invoiceCode = data?.invoiceCode || `TRX-${data?.id?.slice(0, 8)}`;
  const totalAmount = data?.totalAmount || 0;
  const dpAmount = data?.dpAmount || 0;
  const sisa = totalAmount - dpAmount;
  const isLunas = data?.paymentStatus === "LUNAS";
  const hasItems = data?.items && data.items.length > 0;

  const itemsDone = hasItems ? data.items.filter((it: any) => it.orderStatus === "Selesai").length : 0;
  const itemsTotal = hasItems ? data.items.length : 0;

  return (
    <div className="w-full font-sans text-[#161616] relative">
      {/* BACK */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] mb-6 hover:text-zinc-700 transition-colors">
        <ArrowLeft size={15} /> KEMBALI
      </button>

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-[22px] font-black tracking-tight">Detail Transaksi</h1>
        <p className="text-[12px] text-zinc-400 font-medium mt-0.5">Informasi lengkap transaksi beserta status setiap barang</p>
      </div>

      {/* TOP INFO CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-sm">
            {nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-[14px] leading-tight">{nama}</p>
            <p className="text-[11px] text-zinc-400 font-medium">{hasItems ? `${itemsTotal} barang` : data?.category}</p>
          </div>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Kode Invoice</p>
          <p className="font-black text-[14px] text-[#2D4F53]">{invoiceCode}</p>
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Progress Barang</p>
          {hasItems ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${(itemsDone / itemsTotal) * 100}%` }} />
              </div>
              <span className="text-[11px] font-black text-zinc-600">{itemsDone}/{itemsTotal}</span>
            </div>
          ) : (
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${data?.orderStatus === "Selesai" ? "bg-green-50 text-green-600 border-green-100" :
                data?.orderStatus === "Dibatalkan" ? "bg-red-50 text-red-500 border-red-100" :
                  "bg-blue-50 text-blue-500 border-blue-100"
              }`}>{data?.orderStatus || "Diproses"}</span>
          )}
        </div>
        <div className="md:border-l border-zinc-100 md:pl-6">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Pembayaran</p>
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${isLunas ? "bg-green-50 text-green-600 border-green-100" : "bg-blue-50 text-blue-500 border-blue-100"
            }`}>{isLunas ? "LUNAS" : "DP BAYAR"}</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* === LEFT COLUMN === */}
        <div className="space-y-5">

          {/* INFORMASI UMUM */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Informasi Umum</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400 font-medium">Tanggal Masuk</span>
                <span className="font-bold text-zinc-700">: {formatDate(data?.createdAt)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400 font-medium">Status Pengerjaan</span>
                <span className={`font-black text-[12px] ${data?.orderStatus === "Selesai" ? "text-green-600" :
                    data?.orderStatus === "Dibatalkan" ? "text-red-500" : "text-orange-500"
                  }`}>: {data?.orderStatus || "Diproses"}</span>
              </div>
              {data?.notes && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400 font-medium">Catatan</span>
                  <span className="font-bold text-zinc-700 text-right max-w-[60%]">: {data.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* DATA PELANGGAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Data Pelanggan</h2>
            </div>
            <div className="space-y-3">
              {[{ label: "Nama", val: nama }, { label: "No HP", val: hp }, { label: "Alamat", val: alamat }].map(row => (
                <div key={row.label} className="flex justify-between text-[13px]">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="font-bold text-zinc-700 text-right max-w-[60%]">: {row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BAHAN DIGUNAKAN */}
          {data?.materials && data.materials.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Package size={15} className="text-[#2D4F53]" />
                <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Bahan Digunakan</h2>
              </div>
              <div className="space-y-2">
                {data.materials.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 font-medium">{m.name} {m.variant ? `(${m.variant})` : ""}</span>
                    <span className="font-bold text-zinc-700">: {m.qty} Pcs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-5">

          {/* DAFTAR BARANG (Multi-Item) */}
          {hasItems ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#2D4F53]" />
                  <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Daftar Barang</h2>
                </div>
                <span className="text-[11px] font-bold text-zinc-400">{itemsDone}/{itemsTotal} selesai</span>
              </div>

              <div className="space-y-3">
                {data.items.map((item: any, idx: number) => (
                  <div key={item.id} className={`border rounded-xl p-4 transition-all ${item.isPickedUp ? "bg-zinc-50/50 border-zinc-100 opacity-70" :
                      item.orderStatus === "Selesai" ? "bg-green-50/50 border-green-100" :
                        "bg-white border-zinc-200"
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-[13px] font-black text-zinc-800">
                          {idx + 1}. {item.itemName}
                        </p>
                        {item.serviceName && (
                          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{item.serviceName} {item.category ? `· ${item.category}` : ""}</p>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-zinc-400 italic mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[13px] font-black text-[#2D4F53]">{formatIDR(item.price)}</p>
                        {item.isPickedUp ? (
                          <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1 justify-end mt-1">
                            <CheckCheck size={11} /> Diambil
                          </span>
                        ) : (
                          <span className={`text-[10px] font-black uppercase mt-1 block ${item.orderStatus === "Selesai" ? "text-green-600" : "text-orange-500"}`}>
                            {item.orderStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons per item */}
                    {!item.isPickedUp && (
                      <div className="flex gap-2 mt-3">
                        {item.orderStatus !== "Selesai" ? (
                          <button
                            onClick={() => handleItemStatus(item.id, "Selesai")}
                            disabled={actionLoading === item.id + "Selesai"}
                            className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <Check size={12} />
                            {actionLoading === item.id + "Selesai" ? "..." : "Tandai Selesai"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePickUp(item.id)}
                            disabled={actionLoading === item.id + "pickup"}
                            className="flex-1 py-1.5 bg-[#2D4F53] text-white rounded-lg text-[11px] font-bold hover:bg-[#1e3639] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <ShoppingBag size={12} />
                            {actionLoading === item.id + "pickup" ? "..." : "Tandai Diambil"}
                          </button>
                        )}
                        {item.orderStatus !== "Diproses" && (
                          <button
                            onClick={() => handleItemStatus(item.id, "Diproses")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-zinc-100 text-zinc-500 rounded-lg text-[11px] font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fallback untuk transaksi lama (single item) */
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <FileText size={15} className="text-[#2D4F53]" />
                <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Layanan</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-start text-[13px] pb-3 border-b border-zinc-50">
                  <div>
                    <p className="font-bold text-zinc-800">{data?.serviceName || "-"}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{data?.notes || "Tidak ada catatan"}</p>
                  </div>
                  <span className="font-black text-[#2D4F53] whitespace-nowrap ml-4">{formatIDR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-zinc-400">
                  <span>Kategori</span>
                  <span className="font-bold">{data?.category || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {/* PEMBAYARAN */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={15} className="text-[#2D4F53]" />
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-700">Pembayaran</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400">Status Transaksi</span>
                <span className={`font-black text-[12px] ${isLunas ? "text-green-600" : "text-blue-500"}`}>
                  : {data?.paymentStatus || "Belum Bayar"}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-400">Metode Pembayaran</span>
                <span className="font-bold text-zinc-700">: {data?.paymentMethod || "-"}</span>
              </div>
              <div className="border-t border-zinc-50 pt-3 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400">Total Harga</span>
                  <span className="font-bold">{formatIDR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400">DP Dibayar</span>
                  <span className="font-bold text-blue-500">{formatIDR(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-black border-t border-zinc-50 pt-2">
                  <span className="text-zinc-700">Total Sisa Tagihan</span>
                  <span className={sisa > 0 ? "text-red-500" : "text-green-600"}>{formatIDR(sisa)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-zinc-200 text-zinc-700 rounded-2xl text-[13px] font-bold hover:bg-zinc-50 transition-all active:scale-95">
              <Printer size={16} /> Cetak Nota
            </button>
            {!isLunas ? (
              <button onClick={() => setShowPayPanel(true)}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#2D4F53] text-white rounded-2xl text-[13px] font-bold hover:bg-[#1e3639] transition-all active:scale-95 shadow-lg shadow-[#2D4F53]/20">
                <CheckCircle2 size={16} /> Lunasi Pembayaran
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3.5 bg-green-50 text-green-600 rounded-2xl text-[13px] font-bold border border-green-100">
                <CheckCircle2 size={16} /> Sudah Lunas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT SIDE PANEL */}
      {showPayPanel && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setShowPayPanel(false)} />
          <div className="w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col gap-5 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-black">Lunasi Pembayaran</h3>
                <p className="text-[12px] text-zinc-400">Bayar sisa tagihan yang ada</p>
              </div>
              <button onClick={() => setShowPayPanel(false)} className="p-2 rounded-full hover:bg-zinc-50">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>
            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Total Harga</p>
                  <div className="px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 text-[14px] font-black text-zinc-700">{formatIDR(totalAmount)}</div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sisa Tagihan</p>
                  <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100 text-[14px] font-black text-red-500">{formatIDR(sisa)}</div>
                </div>
              </div>

              <div className="relative">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Pilih Metode Pembayaran</p>
                <button type="button" onClick={() => setPayMethodDropdownOpen(!payMethodDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold hover:border-zinc-300 transition-all">
                  <div className="flex items-center gap-2">
                    <Wallet size={15} className="text-[#2D4F53]" />
                    <span className={payMethod ? "text-zinc-800" : "text-zinc-400"}>
                      {payMethod || "Pilih Metode Pembayaran"}
                    </span>
                  </div>
                  <ChevronDown size={15} className={`text-zinc-400 transition-transform ${payMethodDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {payMethodDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPayMethodDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-100 rounded-xl shadow-xl z-40 py-1">
                      {["Tunai", "Transfer", "QRIS"].map(opt => (
                        <button key={opt} type="button" onClick={() => { setPayMethod(opt); setPayMethodDropdownOpen(false); }}
                          className="w-full px-4 py-3 text-left hover:bg-zinc-50 flex items-center justify-between text-[13px] font-bold text-zinc-700 border-b border-zinc-50 last:border-0">
                          {opt} {payMethod === opt && <Check className="text-[#2D4F53]" size={15} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button onClick={() => setShowPayPanel(false)} className="py-3 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-500">Batal</button>
              <button onClick={handleLunasi} disabled={paying} className="py-3 bg-[#2D4F53] text-white rounded-xl text-[13px] font-bold disabled:opacity-50">
                {paying ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}