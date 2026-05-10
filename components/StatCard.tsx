"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, Search, Calendar, ChevronDown, 
  MoreHorizontal, Users, UserCheck, UserX, 
  UserRound, ArrowUpRight, ChevronRight 
} from "lucide-react";

// --- SUB-COMPONENT: StatCard ---
function StatCard({ title, value, sub, trend, icon, isNeutral = false }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-100 shadow-sm flex justify-between items-start h-[135px] w-full">
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
      <div className="p-2.5 rounded-lg border border-zinc-50 bg-white flex items-center justify-center text-[#F2C94C] shadow-sm">
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
      // Gunakan tanda petik ganda "user" jika nama tabelnya 'user' (singular)
      const { data, error } = await supabase
        .from('user') 
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      setUserData(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
        setShowStatusSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('user').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      // Update local state agar cepat tanpa reload
      setUserData(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      setActiveDropdownId(null);
      setShowStatusSubmenu(false);
    } catch (err: any) {
      alert("Gagal update status: " + err.message);
    }
  };

  const filteredUsers = userData.filter(u => 
    (u.nama || u.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 w-full font-sans">
      <div className="w-full space-y-6">
        
        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard title="Total Pengguna" value={userData.length} sub="Akun" trend="Real-time" icon={<Users size={18} />} />
          <StatCard title="Akun Aktif" value={userData.filter(u => u.status === 'Aktif').length} sub="User" trend="Aktif" icon={<UserCheck size={18} />} />
          <StatCard title="Akun Nonaktif" value={userData.filter(u => u.status === 'Nonaktif').length} sub="User" trend="Terblokir" isNeutral icon={<UserX size={18} />} />
          <StatCard title="Total Kasir" value={userData.filter(u => u.role?.toLowerCase() === 'kasir').length} sub="Staff" trend="Operasional" icon={<UserRound size={18} />} />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-zinc-100 w-full overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-zinc-50">
            <div className="w-full">
              <h2 className="text-[18px] font-bold text-[#161616]">Manajemen Pengguna</h2>
              <p className="text-[13px] text-zinc-400">Kelola hak akses dan status akun pegawai</p>
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau username..." 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 text-[13px] focus:outline-none focus:border-[#2D4F53]"
                />
              </div>
              <button className="bg-[#2D4F53] text-white px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 hover:bg-[#1f383b] transition-colors">
                <UserPlus size={16} /> Tambah
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 text-[12px] font-bold uppercase tracking-wider border-b border-zinc-50">
                  <th className="py-4 px-6">No</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                   <tr><td colSpan={6} className="py-10 text-center text-zinc-400 italic text-sm">Memuat data...</td></tr>
                ) : filteredUsers.map((user, i) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] text-zinc-400">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="py-4 px-6 text-[14px] font-bold text-[#161616]">{user.nama || "-"}</td>
                    <td className="py-4 px-6 text-[13px] text-zinc-600">{user.username || "-"}</td>
                    <td className="py-4 px-6 text-[13px] text-zinc-600">{user.role || "-"}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => {
                          setActiveDropdownId(activeDropdownId === user.id ? null : user.id);
                          setShowStatusSubmenu(false);
                        }}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={20} className="text-zinc-400" />
                      </button>

                      {activeDropdownId === user.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-6 mt-1 w-44 bg-white border border-zinc-200 rounded-xl shadow-xl z-[100] py-1 text-left"
                        >
                          {!showStatusSubmenu ? (
                            <>
                              <button className="w-full px-4 py-2.5 text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                Edit Profil
                              </button>
                              <button 
                                onClick={() => setShowStatusSubmenu(true)} 
                                className="w-full px-4 py-2.5 text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 flex items-center justify-between"
                              >
                                Ubah Status <ChevronRight size={14} />
                              </button>
                              <div className="h-[1px] bg-zinc-50 mx-2" />
                              <button className="w-full px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50">
                                Hapus Akun
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(user.id, "Aktif")} 
                                className="w-full px-4 py-2.5 text-[13px] font-bold text-green-600 hover:bg-green-50"
                              >
                                Set Aktif
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(user.id, "Nonaktif")} 
                                className="w-full px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50"
                              >
                                Set Nonaktif
                              </button>
                              <button 
                                onClick={() => setShowStatusSubmenu(false)} 
                                className="w-full py-2 text-[10px] font-bold text-zinc-300 hover:bg-zinc-50 uppercase text-center border-t border-zinc-50"
                              >
                                Kembali
                              </button>
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