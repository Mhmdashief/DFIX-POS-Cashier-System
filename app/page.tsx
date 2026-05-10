'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase' 

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // 1. Query langsung ke tabel User di Supabase
      const { data: user, error: dbError } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle()

      // 2. Cek jika ada error database (seperti 406 yang tadi)
      if (dbError) {
        console.error('Database Error:', dbError)
        setError('Gagal terhubung ke database. Pastikan RLS sudah di-disable.')
        setIsPending(false)
        return
      }

      // 3. Cek jika user tidak ditemukan
      if (!user) {
        setError('Email atau kata sandi salah!')
        setIsPending(false)
        return
      }

      // 4. Berhasil Login - Arahkan berdasarkan Role
      // Simpan role di localStorage (opsional, untuk proteksi client-side sederhana)
      localStorage.setItem('user_role', user.role)
      
      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/kasir')
      }

    } catch (err) {
      console.error('Unexpected Error:', err)
      setError('Terjadi kesalahan sistem.')
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md dark:bg-zinc-950">
        
        <div className="flex justify-center mb-8">
          <Image
            src="/dfix.png"
            alt="DFIX Logo"
            width={120}
            height={45}
            className="h-auto w-auto object-contain" 
            priority
          />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Selamat datang kembali
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Silakan masukkan detail akun Anda.
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:text-white"
              placeholder="admin@dfix.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-300">
              Kata Sandi
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </main>
    </div>
  )
}