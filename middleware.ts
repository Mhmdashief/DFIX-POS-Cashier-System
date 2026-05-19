import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ─── Belum login: redirect ke /login ──────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string) ?? "";

  // ─── Route /admin/** → hanya ADMIN & SUPER_ADMIN ─────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!ADMIN_ROLES.includes(role)) {
      // KASIR mencoba akses admin → redirect ke kasir dashboard
      return NextResponse.redirect(new URL("/kasir", req.url));
    }

    // Admin mencoba akses halaman detail transaksi → blocked (fallback page handle)
    // Middleware tidak redirect supaya fallback page tampil dengan pesan yang jelas
    // Jika ingin strict redirect, uncomment baris berikut:
    // if (/^\/admin\/transaksi\/.+/.test(pathname)) {
    //   return NextResponse.redirect(new URL("/admin/transaksi", req.url));
    // }
  }

  // ─── Route /kasir/** → hanya KASIR, ADMIN, SUPER_ADMIN ───────────────────
  if (pathname.startsWith("/kasir")) {
    const KASIR_ALLOWED = ["KASIR", "ADMIN", "SUPER_ADMIN"];
    if (!KASIR_ALLOWED.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/kasir/:path*",
  ],
};
