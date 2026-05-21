"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    // 1. Parent harus h-screen dan overflow-hidden agar layar terkunci
    <div className="h-screen w-full flex overflow-hidden">
      
      {/* 2. Sidebar: Tetap di kiri dan tidak bisa di-scroll (h-full) */}
      <Sidebar 
        role="kasir" 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* 3. Main Content Area: Mengisi sisa ruang */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        
        {/* Header: Tetap menempel di atas */}
        <Header 
          role="kasir" 
          name="Staf Kasir" 
          onOpenSidebar={() => setIsMobileMenuOpen(true)} 
        /> 
        
        {/* 4. Area Konten: Hanya bagian ini yang bisa di-scroll (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}