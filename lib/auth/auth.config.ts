import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = 
        nextUrl.pathname.startsWith('/sme') ||
        nextUrl.pathname.startsWith('/supplier') ||
        nextUrl.pathname.startsWith('/investor') ||
        nextUrl.pathname.startsWith('/underwriter') ||
        nextUrl.pathname.startsWith('/admin');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.mfaEnrollment = Boolean((user as { mfaEnrollment?: boolean }).mfaEnrollment);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.mfaEnrollment = Boolean(token.mfaEnrollment);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
