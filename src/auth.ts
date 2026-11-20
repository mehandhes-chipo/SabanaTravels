import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDb, schema } from "@/db";
import { verifyPassword } from "@/lib/password";

/**
 * Auth.js: sesión en cookie firmada (JWT) con AUTH_SECRET.
 * El rol NO va en la cookie: se lee de la base de datos en cada petición (lib/auth.ts),
 * así un cambio de rol o una cuenta suspendida surte efecto de inmediato.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/ingresar" },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const [user] = await getDb().select().from(schema.users).where(eq(schema.users.email, email));
        if (!user || !user.active || !(await verifyPassword(password, user.password_hash))) return null;
        return { id: user.id, email: user.email, name: user.full_name };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
