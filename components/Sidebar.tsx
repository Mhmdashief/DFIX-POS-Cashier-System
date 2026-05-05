"use client";

import { useState } from "react";
import Image from "next/image"; // 1. Import Image dari next/image
import { 
  LayoutDashboard, Receipt, BarChart3, Users, FileText, 
  LogOut, ChevronDown, ChevronUp, LucideIcon 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Interface untuk memastikan tipe data benar
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

export default function Sidebar({ role }: { role: 'admin' | 'kasir' }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (menuName: string) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

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
      {/* 2. Logo D'fix */}
      <div className="mb-10 px-2">
        <Image 
          src="/dfix.png" 
          alt="D'fix Logo" 
          width={120} 
          height={40} 
          className="object-contain" 
        />
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        
        {menu.map((item) => (
          <div key={item.name}>
            {item.sub ? (
              <button 
                onClick={() => toggleDropdown(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${openDropdown === item.name ? "text-black" : "text-zinc-600"} hover:bg-zinc-100`}
              >
                <item.icon size={18} />
                {item.name}
                {openDropdown === item.name ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
              </button>
            ) : (
              <Link 
                href={item.href || "#"} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname === item.href ? "bg-zinc-800 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                <item.icon size={18} /> {item.name}
              </Link>
            )}

            {item.sub && openDropdown === item.name && (
              <div className="pl-10 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2">
                {item.sub.map((sub) => (
                  <Link 
                    key={sub.name} 
                    href={sub.href} 
                    className={`block py-2 text-sm ${pathname === sub.href ? "text-black font-semibold" : "text-zinc-500"} hover:text-black`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t pt-6">
        <button className="flex items-center gap-3 text-zinc-600 hover:text-black mb-6">
          <LogOut size={18} /> <span className="text-sm font-medium">Logout</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden">
             <img src="https://ui.shadcn.com/avatars/01.png" alt="Avatar" />
          </div>
          <div>
            <p className="text-sm font-bold">John Deluxe</p>
            <p className="text-xs text-zinc-500">JohnDlux@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}