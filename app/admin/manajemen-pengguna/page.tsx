"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus, Search, Calendar,
  MoreHorizontal, Users, UserCheck, UserX,
  UserRound, ArrowUpRight, ChevronRight
} from "lucide-react";
import ModalTambahPengguna from "@/components/ModalTambahPengguna";
import { getUsers, saveUserAction, deleteUserAction, updateStatusAction } from "./actions";
import { StatCard } from "@/components/StatCard";

export default function ManajemenPenggunaPage() {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);

  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUserData(data);
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

  const handleSaveUser = async (formData: any) => {
    try {
      const result = await saveUserAction(formData, editingUser?.id);
      
      if (!result.success) throw new Error(result.error);

      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      alert("Gagal memproses data: " + err.message);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      const result = await deleteUserAction(id);
      if (result.success) fetchUsers();
      setActiveDropdownId(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const result = await updateStatusAction(id, newStatus);
    if (result.success) fetchUsers();
    setActiveDropdownId(null);
  };

  const filteredUsers = userData.filter(u =>
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full space-y-6">
        {/* STATS SECTION (Sama seperti sebelumnya) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Pengguna" value={userData.length} sub="/ Akun terdaftar" trend="Real-time" icon={<Users size={18} />} />
          <StatCard title="Akun Aktif" value={userData.filter(u => u.status === 'AKTIF').length} sub="/ Dapat login" trend="User Aktif" icon={<UserCheck size={18} />} />
          <StatCard title="Akun Nonaktif" value={userData.filter(u => u.status === 'NONAKTIF').length} sub="/ Diblokir" trend="Non-aktif" isNeutral icon={<UserX size={18} />} />
          <StatCard title="Total Kasir" value={userData.filter(u => u.role === 'KASIR').length} sub="/ Kasir" trend="Role Kasir" icon={<UserRound size={18} />} />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-none overflow-visible">
          <div className="p-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-50">
            <h2 className="text-[18px] font-bold text-[#161616]">Manajemen Pengguna</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 w-full sm:w-auto"
              >
                <UserPlus size={16} /> Tambah Pengguna
              </button>
              <input
                type="text" placeholder="Cari nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 rounded-lg border border-zinc-200 text-[13px] focus:outline-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-zinc-400 text-[13px] font-medium border-b border-zinc-50">
                  <th className="py-4 px-6 w-16">No</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50">
                    <td className="py-4 px-6 text-[14px] text-zinc-400">{(i + 1)}</td>
                    <td className="py-4 px-6 text-[14px] font-bold text-[#161616]">{user.name || "-"}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-600">{user.username}</td>
                    <td className="py-4 px-6 text-[14px] text-zinc-600 capitalize">{user.role}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase ${user.status === 'AKTIF' ? 'bg-[#CEECD6] text-[#34C759]' : 'bg-[#F5E4E2] text-[#F54336]'}`}>
                        {user.status || 'AKTIF'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)} className="p-1.5 hover:bg-zinc-100 rounded-lg">
                        <MoreHorizontal size={20} className="text-zinc-800" />
                      </button>
                      {activeDropdownId === user.id && (
                        <div ref={dropdownRef} className="absolute right-6 top-12 w-48 bg-white border border-zinc-200 rounded-lg shadow-xl z-[999] py-1">
                          {!showStatusSubmenu ? (
                            <>
                              <button onClick={() => handleEditUser(user)} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50">Edit Pengguna</button>
                              <button onClick={() => setShowStatusSubmenu(true)} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-zinc-800 hover:bg-zinc-50 flex items-center justify-between">
                                Ubah Status <ChevronRight size={14} />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id)} className="w-full px-4 py-2.5 text-left text-[14px] font-bold text-[#F54336] hover:bg-red-50">Hapus Pengguna</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(user.id, "AKTIF")} className="w-full px-4 py-2.5 text-left text-[14px] font-bold hover:bg-zinc-50">Aktif</button>
                              <button onClick={() => handleUpdateStatus(user.id, "NONAKTIF")} className="w-full px-4 py-2.5 text-left text-[14px] font-bold hover:bg-zinc-50">Nonaktif</button>
                              <button onClick={() => setShowStatusSubmenu(false)} className="w-full py-2 text-[10px] text-zinc-300 uppercase text-center hover:bg-zinc-50">Kembali</button>
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

      <ModalTambahPengguna
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
}