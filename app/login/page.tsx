"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Username atau password salah");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-sm border border-zinc-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 text-white mb-6">
            <span className="text-2xl font-bold">D</span>
          </div>
          <h2 className="text-2xl font-bold text-[#161616]">Selamat Datang Kembali</h2>
          <p className="mt-2 text-[14px] text-zinc-500 font-medium">Silakan login untuk mengakses dashboard Dfix</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-[#F54336] p-3.5 rounded-xl text-[13px] font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-bold text-zinc-700 mb-1.5 block">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-zinc-700 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl text-[14px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sedang Masuk..." : "Masuk ke Akun"}
          </button>
        </form>

        <p className="text-center text-[12px] text-zinc-400 font-medium mt-8">
          &copy; 2026 Dfix Service System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
