import NextAuth from 'next-auth';
import { authConfig } from './lib/auth/auth.config';
import { NextResponse } from 'next/server';
import { isAdminOperator } from './lib/auth/roles';

const auth = NextAuth(authConfig).auth;

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
  const publicRoutes = ['/', '/about', '/how-it-works', '/whitepaper', '/pitch', '/paperwork', '/technical', '/grant', '/docs', '/legal'];
  const isPublicPage = publicRoutes.includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/legal/') || nextUrl.pathname.startsWith('/marketplace') || nextUrl.pathname.startsWith('/verify/') || nextUrl.pathname.startsWith('/api/verify/') || nextUrl.pathname.startsWith('/api/marketplace') || nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/api/auth');

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (isLoggedIn && userRole) {
    const path = nextUrl.pathname;
    
    if (path.startsWith('/sme') && userRole !== 'SME') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    
    if (path.startsWith('/investor') && userRole !== 'INVESTOR') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    
    if (path.startsWith('/supplier') && userRole !== 'SUPPLIER') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    if (path.startsWith('/underwriter') && userRole !== 'UNDERWRITER') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    
    // An administrator who has not set up a second factor can only reach the security page.
    if (req.auth?.user?.mfaEnrollment && !path.startsWith('/admin/security') && !path.startsWith('/api/admin/mfa') && (path.startsWith('/admin') || path.startsWith('/api/admin'))) {
      return NextResponse.redirect(new URL('/admin/security', nextUrl));
    }

    if (path.startsWith('/admin') && !isAdminOperator(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|favicon.ico).*)'],
};
