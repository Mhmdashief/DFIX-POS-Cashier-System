'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import Image from 'next/image'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md dark:bg-zinc-950">
        
        <Image
          src="/dfix.png"
          alt="DFIX Logo"
          width={120}
          height={45}
          className="mx-auto mb-8 h-auto w-auto object-contain" 
          priority
        />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Selamat datang kembali</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Silakan masukkan detail Anda.</p>
        </div>

        {state?.error && (
          <p className="mb-4 text-center text-sm text-red-500">{state.error}</p>
        )}

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-zinc-300 bg-transparent p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:text-white"
              placeholder="email@anda.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-300">Kata Sandi</label>
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