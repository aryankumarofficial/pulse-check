import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function proxy(request: NextRequest) {
  // Bypass maintenance mode for static assets, API, admin, and auth routes
  const bypassedPaths = [
    '/admin',
    '/api',
    '/_next',
    '/maintenance',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];

  if (bypassedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      return NextResponse.next();
    }

    const insforge = createClient({
      baseUrl,
      anonKey,
      fetch: (url: any, options: any) => {
        return fetch(url, {
          ...options,
          next: { revalidate: 60 }
        });
      }
    });

    const { data, error } = await insforge.database
      .from('platform_settings')
      .select('value')
      .eq('key', 'maintenance_mode');

    if (!error && data && data.length > 0 && data[0].value === true) {
      // Rewrite to maintenance page so the URL stays the same.
      // This allows users to simply refresh their browser when maintenance is over.
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  } catch (error) {
    console.error('Middleware maintenance check failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
