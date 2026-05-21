import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["ADMIN"];

// ─── In-Memory Rate Limiter ────────────────────────────────────────────────
// Catatan: Untuk deployment multi-instance (Vercel serverless) gunakan Redis/Upstash.
// Untuk single-server / single-retail ini sudah cukup memadai.
interface RateLimitRecord {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;           // maks 5 percobaan salah
const WINDOW_MS = 15 * 60 * 1000; // dalam jendela 15 menit
const BLOCK_MS = 15 * 60 * 1000; // block selama 15 menit

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Masih dalam masa block?
  if (record.blockedUntil) {
    if (now < record.blockedUntil) {
      return { allowed: false, retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000) };
    }
    // Block habis → reset
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Window sudah kedaluwarsa → reset
  if (now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  record.count += 1;

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(BLOCK_MS / 1000) };
  }

  return { allowed: true };
}

// Bersihkan entri lama tiap 1 jam untuk mencegah memory leak
let lastCleanup = Date.now();
function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60 * 60 * 1000) return;
  lastCleanup = now;
  for (const [ip, record] of loginAttempts.entries()) {
    const expired = record.blockedUntil
      ? now > record.blockedUntil
      : now - record.windowStart > WINDOW_MS;
    if (expired) loginAttempts.delete(ip);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Rate Limiting: Intercept SEBELUM NextAuth memproses login ────────────
  if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    cleanupOldEntries();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { allowed, retryAfterSeconds } = checkRateLimit(ip);

    if (!allowed) {
      const minutes = Math.ceil((retryAfterSeconds ?? 900) / 60);
      // Redirect ke halaman login dengan pesan error di query param
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("error", "TooManyRequests");
      loginUrl.searchParams.set("minutes", String(minutes));
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("Retry-After", String(retryAfterSeconds ?? 900));
      return res;
    }

    return NextResponse.next();
  }

  // ─── Cek sesi / token ─────────────────────────────────────────────────────
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ─── Belum login → redirect ke halaman login ──────────────────────────────
  if (!token) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string) ?? "";

  // ─── /admin/** → hanya ADMIN 
  if (pathname.startsWith("/admin")) {
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/kasir", req.url));
    }
  }

  // ─── /kasir/** → KASIR, ADMIN
  if (pathname.startsWith("/kasir")) {
    const KASIR_ALLOWED = ["KASIR", "ADMIN"];
    if (!KASIR_ALLOWED.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ─── /print/** → semua role yang sudah login boleh akses ─────────────────
  // (tidak ada pemisahan role tambahan — cukup terautentikasi)

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/kasir/:path*",
    "/print/:path*",
    "/api/auth/callback/credentials",
  ],
};
