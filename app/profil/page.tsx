"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, Shield, Phone, Camera, ArrowLeft, 
  MapPin, CheckCircle, Smartphone 
} from "lucide-react";

export default function GeneralProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // SEMENTARA: Jika belum login, jangan di-push ke "/" dulu agar bisa lihat hasilnya
      // Kita pakai data dummy untuk testing
      setUser({
        id: "86ca6684-be91-487c-93c2-eb6144b3ce22",
        name: "User DFIX",
        email: "user@dfix.com",
        role: "staff",
        phone: "+62 812-3456-7890"
      });
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 w-full font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Tombol Back: Menggunakan router.back() agar fleksibel */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-400 font-black text-[10px] mb-8 uppercase tracking-widest hover:text-[#2D4F53] transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="h-40 bg-[#2D4F53] w-full relative">
            <div className="absolute -bottom-12 left-10 flex items-end gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-[32px] bg-white p-1.5 shadow-2xl">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`} 
                    className="w-full h-full rounded-[26px] object-cover"
                    alt="Profile"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl font-black text-zinc-800 tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-50 text-zinc-600">
                    {user.role} DFIX
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="group">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">Email Resmi</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <Mail size={18} />
                    </div>
                    <p className="text-[15px] font-bold text-zinc-700">{user.email}</p>
                  </div>
                </div>

                <div className="group">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">Kontak</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <Smartphone size={18} />
                    </div>
                    <p className="text-[15px] font-bold text-zinc-700">{user.phone || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">Otoritas</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <Shield size={18} />
                    </div>
                    <p className="text-[15px] font-bold text-zinc-700">Akses {user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}