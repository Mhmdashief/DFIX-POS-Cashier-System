"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  Package,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import TambahBahanModal from "@/components/TambahBahanModal";
import EditBahanModal from "@/components/EditBahanModal";
import SuccessModal from "@/components/SuccessModal";


import {
  getMaterials,
  deleteMaterialAction,
} from "@/app/actions/material";

export default function DataBahanPage() {
  const [bahan, setBahan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);


  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedBahan, setSelectedBahan] = useState<any>(null);


  const fetchBahan = async () => {
    setLoading(true);

    try {
      const data = await getMaterials();
      setBahan(data);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async (id: string) => {
    const confirmDelete = confirm(
      "Apakah Anda yakin ingin menghapus bahan ini secara permanen?"
    );

    if (!confirmDelete) return;

    const result = await deleteMaterialAction(id);

    if (result.success) {
      fetchBahan();
      setActiveMenu(null);
    } else {
      alert(result.error);
    }
  };

  useEffect(() => {
    fetchBahan();
  }, []);

  const stats = {
    total: bahan.length,
    menipis: bahan.filter(
      (b) => Number(b.stock) > 0 && Number(b.stock) < 5
    ).length,
    habis: bahan.filter((b) => Number(b.stock) <= 0).length,
  };

  const uniqueCategories = Array.from(new Set(bahan.map(b => b.category).filter(Boolean))) as string[];

  const filteredBahan = bahan.filter((b) => {
    const matchSearch = (b.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "Semua" ? true : b.category === selectedCategory;
    return matchSearch && matchCategory;
  });


  return (
    <div className="min-h-screen bg-white p-8 w-full font-sans text-[#1E1E1E]">
      <div className="w-full max-w-7xl mx-auto space-y-10">

        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Total Bahan",
              value: stats.total,
              unit: "Jenis",
              icon: <Package size={22} />,
              color: "text-[#1E1E1E]",
              iconColor: "text-blue-500",
              border: "border-blue-100",
            },
            {
              label: "Bahan Menipis",
              value: stats.menipis,
              unit: "Item",
              icon: <AlertTriangle size={22} />,
              color: "text-orange-500",
              iconColor: "text-orange-500",
              border: "border-orange-100",
            },
            {
              label: "Bahan Habis",
              value: stats.habis,
              unit: "Item",
              icon: <XCircle size={22} />,
              color: "text-red-500",
              iconColor: "text-red-500",
              border: "border-red-100",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 p-6 rounded-[24px] flex justify-between items-center shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-gray-400 text-[13px] font-medium">
                  {s.label}
                </p>

                <div className="flex items-baseline gap-1.5">
                  <h3
                    className={`text-[26px] font-bold leading-tight ${s.color}`}
                  >
                    {s.value}
                  </h3>

                  <span
                    className={`text-[13px] font-medium ${s.color === "text-[#1E1E1E]"
                      ? "text-gray-400"
                      : s.color
                      }`}
                  >
                    {s.unit}
                  </span>
                </div>
              </div>

              <div
                className={`w-12 h-12 border ${s.border} ${s.iconColor} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#1E1E1E]">
              Manajemen Bahan
            </h1>

            <p className="text-[14px] text-gray-400 mt-1">
              Mengatur stock bahan pada toko
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsTambahOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-2xl text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-all w-full sm:w-auto"
            >
              <Plus size={18} className="text-yellow-500" />
              Tambah Bahan
            </button>

            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500"
                size={18}
              />

              <input
                placeholder="Search"
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[14px] focus:outline-none w-full sm:w-[260px] placeholder:text-gray-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" />
              <select
                className="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-[14px] font-semibold text-gray-600 outline-none hover:bg-gray-50 transition-all cursor-pointer appearance-none w-full sm:w-auto"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Semua text-gray-400">Semua Kategori</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Table Container */}
        <div className="w-full relative overflow-x-auto pb-32">
          <table className="w-full text-left border-separate border-spacing-y-0 min-w-[1000px]">

            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[13px] uppercase tracking-wider font-bold">
                <th className="py-4 px-2 w-12 text-center">No</th>
                <th className="py-4 px-2">Nama Bahan</th>
                <th className="py-4 px-2">Kategori</th>
                <th className="py-4 px-2">Varian</th>
                <th className="py-4 px-2">Stok</th>
                <th className="py-4 px-2">Satuan</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Update</th>
                <th className="py-4 px-2 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-[14px]">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-20 text-center text-gray-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredBahan.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-20 text-center text-gray-400"
                  >
                    Data bahan kosong
                  </td>
                </tr>
              ) : (
                filteredBahan.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-6 px-2 text-gray-400 text-center font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="py-6 px-2 font-bold text-[#1E1E1E]">
                      {item.name}
                    </td>

                    <td className="py-6 px-2">
                      <span className="px-2.5 py-1.5 bg-[#2D4F53]/5 text-[#2D4F53] rounded-xl text-[12px] font-black uppercase tracking-wider">
                        {item.category || "-"}
                      </span>
                    </td>

                    <td className="py-6 px-2 text-zinc-500 font-bold italic">
                      {item.variant || "-"}
                    </td>

                    <td className="py-6 px-2 text-[#1E1E1E] font-bold">
                      {item.stock}
                    </td>

                    <td className="py-6 px-2 text-gray-500 font-medium">
                      {item.unit}
                    </td>

                    <td className="py-6 px-2">
                      <span
                        className={`px-5 py-2 rounded-full text-[12px] font-bold 
                        ${item.stock >= 5
                            ? "bg-[#E2F5EA] text-[#22C55E]"
                            : item.stock > 0
                              ? "bg-[#FFF9E6] text-[#FACC15]"
                              : "bg-[#FEE2E2] text-[#EF4444]"
                          }`}
                      >
                        {item.stock >= 5
                          ? "Aman"
                          : item.stock > 0
                            ? "Menipis"
                            : "Habis"}
                      </span>
                    </td>

                    <td className="py-6 px-2 text-gray-400 font-medium">
                      {new Date(
                        item.updatedAt || item.createdAt
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-6 px-2 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative z-10"
                      >

                        <MoreHorizontal
                          size={20}
                          className="text-gray-400"
                        />
                      </button>

                      {activeMenu === item.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] py-2 overflow-hidden animate-in fade-in slide-in-from-top-1">

                          <button
                            onClick={() => {
                              setSelectedBahan(item);
                              setIsEditOpen(true);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                          >
                            Edit Bahan
                          </button>

                          <button
                            onClick={() => handleHapus(item.id)}
                            className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50"
                          >
                            Hapus Bahan
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TambahBahanModal
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSave={() => {
          fetchBahan();
          setIsSuccessOpen(true);
        }}
      />


      <EditBahanModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={() => {
          fetchBahan();
          setIsSuccessOpen(true);
        }}
        initialData={selectedBahan}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Berhasil Diperbarui"
        message="Data bahan material telah berhasil diperbarui ke dalam sistem database."
      />

    </div>
  );
}