import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-super-secret-key-123456');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /[locale]/admin and /admin routes except login
  const isAdminRoute = pathname.match(/^\/(en|ar)?\/?admin/);
  const isLoginRoute = pathname.match(/^\/(en|ar)?\/?admin\/login/);

  if (isAdminRoute && !isLoginRoute) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Find the locale to redirect to the correct login page
      const localeMatch = pathname.match(/^\/(en|ar)/);
      const localePrefix = localeMatch ? localeMatch[0] : '';
      return NextResponse.redirect(new URL(`${localePrefix}/admin/login`, request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('JWT Verification Error in Middleware:', error);
      const localeMatch = pathname.match(/^\/(en|ar)/);
      const localePrefix = localeMatch ? localeMatch[0] : '';
      const response = NextResponse.redirect(new URL(`${localePrefix}/admin/login`, request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
