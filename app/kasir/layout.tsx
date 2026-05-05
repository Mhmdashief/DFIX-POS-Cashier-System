// app/kasir/layout.tsx
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="kasir" />
      <div className="flex-1 flex flex-col">
        {/* Tambahkan prop 'name' di sini */}
        <Header role="kasir" name="Staf Kasir" /> 
        
        <main className="p-8 bg-zinc-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}