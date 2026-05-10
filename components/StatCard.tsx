"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, Search, Calendar, ChevronDown, 
  MoreHorizontal, Users, UserCheck, UserX, 
  UserRound, ArrowUpRight, ChevronRight 
} from "lucide-react";

// --- SUB-COMPONENT: StatCard (Disatukan agar tidak error import) ---
function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-100 shadow-none flex justify-between items-start h-[135px] w-full">
      <div className="flex flex-col h-full justify-between">
        <p className="text-[13px] font-bold text-[#161616] tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-[#161616] leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-[#34C759]'}`}>
            {!isNeutral && <ArrowUpRight size={14} strokeWidth={3} />} {trend}
          </p>
        </div>
      </div>
      <div className="p-2.5 rounded-lg border border-zinc-50 bg-white flex items-center justify-center text-[#F2C94C]">
        {icon}
      </div>
    </div>
  );
}

export default function ManajemenPenggunaPage() {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('user').select('*').order('id', { ascending: true });
      if (data) setUserData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
        setShowStatusSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('user').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchUsers();
      setActiveDropdownId(null);
      setShowStatusSubmenu(false);
    }
  };

  const filteredUsers = userData.filter(u => 
    (u.nama || u.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Menggunakan w-full dan padding minimal agar mepet ke pinggir
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-['Plus_Jakarta_Sans',sans-serif]">
      
      <div className="w-full space-y-6">
        
        {/* --- STATS SECTION: Lebar Penuh --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard title="Total Pengguna" value={userData.length} sub="/ Akun terdaftar" trend="Bertambah +1 dari Kemaren" icon={<Users size={18} />} />
          <StatCard title="Akun Aktif" value={userData.filter(u => u.status === 'Aktif').length} sub="/ Dapat login sistem" trend="Bertambah +1 dari Kemaren" icon={<UserCheck size={18} />} />
          <StatCard title="Akun Nonaktif" value={userData.filter(u => u.status === 'Nonaktif').length} sub="/ Akses diblokir" trend="Status stabil" isNeutral icon={<UserX size={18} />} />
          <StatCard title="Total Kasir" value={userData.filter(u => u.role?.toLowerCase() === 'kasir').length} sub="/ Operasional" trend="Bertambah +1 dari Kemaren" icon={<UserRound size={18} />} />
        </div>

        {/* --- TABLE BOX SECTION: Lebar Penuh & Tanpa Shadow --- */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-none w-full">
          
          <div className="p-6 pb-4 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-zinc-50">
            <div className="w-full">
              <h2 className="text-[18px] font-bold text-[#161616]">Manajemen Pengguna</h2>
              <p className="text-[13px] text-zinc-400 mt-0.5">Mengatur akun pegawai dan hak akses sistem kasir</p>
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 whitespace-nowrap transition-all">
                <UserPlus size={16} /> Tambah Pengguna
              </button>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 text-[13px] focus:outline-none focus:border-zinc-400 shadow-none"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50">
                <Calendar size={16} className="text-[#F2C94C]" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 text-[13px] font-medium border-b border-zinc-50">
                  <th className="py-4 px-6 w-16">No</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Terakhir Login</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                   <tr><td colSpan={7} className="py-16 text-center text-zinc-300 italic text-sm">Memuat data...</td></tr>
                ) : filteredUsers.map((user, i) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 text-[14px] text-zinc-400 font-medium">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="py-4 px-6 text-[14px] font-bold text-[#161616]">{user.nama || user.name || "-"}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-600 font-medium">{user.username || "-"}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-600 font-medium">{user.role || "-"}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-400 font-medium whitespace-nowrap">07 Feb 2026 09:12</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[11px] font-bold ${
                        user.status === 'Aktif' ? 'bg-[#CEECD6] text-[#34C759]' : 'bg-[#F5E4E2] text-[#F54336]'
                      }`}>
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative overflow-visible">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={20} className="text-zinc-800" />
                      </button>

                      {activeDropdownId === user.id && (
                        <div ref={dropdownRef} className="absolute right-6 mt-2 w-44 bg-white border border-zinc-200 rounded-lg shadow-none z-[100] py-1 overflow-hidden">
                          {!showStatusSubmenu ? (
                            <>
                              <button className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50 transition-colors">Edit Pengguna</button>
                              <div className="h-[1px] bg-zinc-100 mx-2" />
                              <button onClick={() => setShowStatusSubmenu(true)} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50 flex items-center justify-between transition-colors">
                                Ubah Status <ChevronRight size={14} className="text-zinc-400" />
                              </button>
                              <div className="h-[1px] bg-zinc-100 mx-2" />
                              <button className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-[#F54336] hover:bg-red-50 transition-colors">Hapus Pengguna</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(user.id, "Aktif")} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50 transition-colors">Aktif</button>
                              <div className="h-[1px] bg-zinc-100 mx-2" />
                              <button onClick={() => handleUpdateStatus(user.id, "Nonaktif")} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50 transition-colors">Nonaktif</button>
                              <div className="h-[1px] bg-zinc-100 mx-2" />
                              <button onClick={() => setShowStatusSubmenu(false)} className="w-full py-2 text-center text-[10px] font-extrabold text-zinc-300 hover:bg-zinc-50 uppercase tracking-widest transition-all">Kembali</button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}