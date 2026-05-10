import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Parent harus h-screen dan overflow-hidden agar layar terkunci
    <div className="h-screen w-full flex overflow-hidden">
      
      {/* 2. Sidebar: Tetap di kiri dan tidak bisa di-scroll (h-full) */}
      <div className="h-full flex-shrink-0">
        <Sidebar role="kasir" />
      </div>

      {/* 3. Main Content Area: Mengisi sisa ruang */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header: Tetap menempel di atas */}
        <Header role="kasir" name="Staf Kasir" /> 
        
        {/* 4. Area Konten: Hanya bagian ini yang bisa di-scroll (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}