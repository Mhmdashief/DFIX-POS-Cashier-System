'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { signIn } from 'next-auth/react'

function LoginForm() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Baca error dari query param (misalnya setelah rate limit redirect)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const minutesParam = searchParams.get('minutes')
    if (errorParam === 'TooManyRequests') {
      const minutes = minutesParam || '15'
      setError(`Terlalu banyak percobaan gagal. Akun diblokir sementara, coba lagi dalam ${minutes} menit.`)
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Username atau kata sandi salah!')
        setIsPending(false)
        return
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role === 'ADMIN') {
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
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:text-white"
              placeholder="admin"
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

// useSearchParams() wajib dibungkus Suspense di Next.js
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}