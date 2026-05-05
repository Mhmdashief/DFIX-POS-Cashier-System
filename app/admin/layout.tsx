import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Container utama harus full height dan tidak boleh scroll
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar role="admin" /> 
      
      {/* 2. Container kanan sebagai kolom flex, tetap diam */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* Header akan tetap di posisi atas (sticky secara alami karena bukan bagian yang scroll) */}
        <Header role="admin" name="Bintang" /> 
        
        {/* 3. Main content ini yang akan scroll secara internal */}
        <main className="flex-1 overflow-y-auto p-5 bg-zinc-50"> 
          {children}
        </main>
      </div>
    </div>
  );
}