// app/actions.ts
'use server'

import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // LOGIKA MOCK (Ganti ini dengan koneksi database asli kamu nanti)
  // Contoh: Admin login dengan admin@dfix.com
  if (email === 'admin@dfix.com' && password === 'admin123') {
    redirect('/admin') // Arahkan ke halaman admin
  } 
  
  // Contoh: User biasa login dengan user@dfix.com
  if (email === 'user@dfix.com' && password === 'user123') {
    redirect('/kasir') // Arahkan ke halaman user
  }

  // Jika salah
  return { error: 'Email atau kata sandi salah!' }
}