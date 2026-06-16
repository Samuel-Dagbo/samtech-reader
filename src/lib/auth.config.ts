import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export default {
  providers: [],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin") && !isAdmin) {
        return NextResponse.redirect(new URL("/", nextUrl));
      }

      if (
        (pathname.startsWith("/dashboard") || pathname.startsWith("/reader")) &&
        !isLoggedIn
      ) {
        return NextResponse.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }
      if (user) {
        token.id = user.id;
        token.role = "role" in user ? (user as { role: string }).role : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
