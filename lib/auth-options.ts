import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma"; // Pastikan path ke file prisma client benar
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // 1. Cari user sesuai username yang diketik (case-insensitive)
        const user = await prisma.user.findUnique({
          where: { username: credentials.username.toLowerCase() },
        });

        // 2. Jika user tidak ditemukan
        if (!user) {
          console.log("Login gagal: Username tidak ditemukan.");
          return null;
        }

        // 3. Verifikasi password hash
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log("Login gagal: Password salah.");
          return null;
        }

        // 4. Cek status user
        if (user.status !== "AKTIF") {
          console.log("Login gagal: Akun tidak aktif.");
          return null;
        }

        // 5. Kembalikan objek user untuk session
        return {
          id: user.id,
          name: user.name || user.username,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};