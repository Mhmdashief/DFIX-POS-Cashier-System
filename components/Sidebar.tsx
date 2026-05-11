"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  LayoutDashboard, Receipt, BarChart3, Users, FileText, 
  LogOut, ChevronDown, ChevronUp, LucideIcon 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SubItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  sub?: SubItem[];
}

// 1. Sesuaikan Interface dengan kolom di User_rows.csv
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function Sidebar({ role }: { role: 'admin' | 'kasir' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 2. State untuk User (Default diambil dari data CSV kamu sebagai placeholder)
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Simulasi pengambilan data dari localStorage setelah login
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      /** * 3. Fallback: Jika belum ada sistem login, 
       * kita pakai data dari baris pertama file User_rows.csv kamu
       */
      const defaultUser: UserData = {
        id: "86ca6684-be91-487c-93c2-eb6144b3ce22",
        name: role === 'admin' ? "Admin DFIX" : "Kasir DFIX",
        email: role === 'admin' ? "admin@dfix.com" : "user@dfix.com",
        role: role,
        status: "aktif"
      };
      setUser(defaultUser);
    }
  }, [role]);

  const toggleDropdown = (menuName: string) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Hapus data user
    localStorage.removeItem("token");
    router.push("/"); // Balik ke Home
    router.refresh();
  };

  // Konfigurasi Menu
  const adminMenu: MenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Transaksi Reparasi", href: "/admin/transaksi", icon: Receipt },
    { 
      name: "Data Operasional", icon: BarChart3, 
      sub: [
        { name: "Manajemen Pengguna", href: "/admin/manajemen-pengguna" },
        { name: "Data Pelanggan", href: "/admin/data-pelanggan" },
        { name: "Data Reparasi", href: "/admin/data-reparasi" },
        { name: "Data Bahan", href: "/admin/data-bahan" },
      ]
    },
    { 
      name: "Laporan", icon: FileText,
      sub: [
        { name: "Transaksi", href: "/admin/laporan-transaksi" },
        { name: "Bahan", href: "/admin/laporan-bahan" },
      ]
    },
  ];

  const kasirMenu: MenuItem[] = [
    { name: "Dashboard", href: "/kasir", icon: LayoutDashboard },
    { name: "Transaksi Reparasi", href: "/kasir/transaksi", icon: Receipt },
    { name: "Data Pelanggan", href: "/kasir/data-pelanggan", icon: Users },
    { name: "Riwayat Transaksi", href: "/kasir/riwayat-transaksi", icon: FileText },
  ];

  const menu = role === 'admin' ? adminMenu : kasirMenu;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-zinc-200 p-6 flex flex-col sticky top-0">
      <div className="mb-10 px-2">
        <Image src="/dfix.png" alt="D'fix Logo" width={120} height={40} className="object-contain" priority />
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        {menu.map((item) => (
          <div key={item.name}>
            {item.sub ? (
              <button 
                onClick={() => toggleDropdown(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${openDropdown === item.name ? "text-black bg-zinc-50" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                <item.icon size={18} />
                {item.name}
                {openDropdown === item.name ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
              </button>
            ) : (
              <Link 
                href={item.href || "#"} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href ? "bg-zinc-800 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                <item.icon size={18} /> {item.name}
              </Link>
            )}

            {item.sub && openDropdown === item.name && (
              <div className="pl-10 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {item.sub.map((sub) => (
                  <Link key={sub.name} href={sub.href} className={`block py-2 text-sm transition-colors ${pathname === sub.href ? "text-black font-semibold" : "text-zinc-500"} hover:text-black`}>
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bagian Profil User */}
      <div className="mt-auto border-t pt-6">
        <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-600 hover:text-red-600 transition-colors mb-6 group w-full text-left">
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
          <span className="text-sm font-medium">Logout</span>
        </button>

        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden flex-shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-zinc-800 truncate">{user?.name || "Loading..."}</p>
            <p className="text-[11px] text-zinc-500 truncate lowercase">{user?.email || "..."}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}