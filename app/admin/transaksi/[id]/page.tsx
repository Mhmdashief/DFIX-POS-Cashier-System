"use client";

import { useRouter } from "next/navigation";
import { ShieldOff, ArrowLeft, LogIn } from "lucide-react";

/**
 * Halaman ini dengan sengaja diblokir untuk role ADMIN.
 * Detail transaksi — termasuk manajemen status dan pembayaran —
 * hanya dapat diakses oleh role KASIR melalui /kasir/transaksi/[id].
 *
 * Middleware.ts seharusnya sudah meng-handle redirect otomatis,
 * halaman ini berfungsi sebagai fallback UI jika middleware bypass.
 */
export default function AdminTransaksiDetailBlocked() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 font-sans">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
        <ShieldOff size={32} className="text-red-400" />
      </div>

      {/* Title */}
      <h1 className="text-[22px] font-black text-zinc-900 mb-2">Akses Ditolak</h1>
      <p className="text-[14px] text-zinc-400 font-medium max-w-md leading-relaxed mb-8">
        Halaman <span className="font-bold text-zinc-600">Detail Transaksi</span> hanya dapat diakses oleh akun dengan role{" "}
        <span className="inline-flex items-center gap-1 bg-[#2D4F53]/10 text-[#2D4F53] font-black px-2 py-0.5 rounded-md text-[13px]">
          KASIR
        </span>
        .<br />
        Admin hanya memiliki akses baca (read-only) pada daftar transaksi.
      </p>

      {/* Divider */}
      <div className="w-full max-w-xs h-px bg-zinc-100 mb-8" />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/admin/transaksi")}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
        >
          <ArrowLeft size={15} />
          Kembali ke Daftar Transaksi
        </button>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 px-5 py-3 bg-[#2D4F53] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e3639] transition-all shadow-md shadow-[#2D4F53]/20"
        >
          <LogIn size={15} />
          Login sebagai Kasir
        </button>
      </div>

      {/* Hint */}
      <p className="mt-8 text-[11px] text-zinc-300 font-medium max-w-sm">
        Untuk mengelola pembayaran dan status transaksi, akses{" "}
        <code className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono text-[10px]">
          /kasir/transaksi
        </code>{" "}
        dengan akun Kasir.
      </p>
    </div>
  );
}