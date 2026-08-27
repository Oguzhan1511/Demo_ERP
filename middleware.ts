import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API auth rotaları ile usta formları hariç her şeyi koru
  const isPublicPath =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/u/");

  if (isPublicPath) return NextResponse.next();

  const secureCookieValue = request.cookies.get("__Secure-next-auth.session-token")?.value;
  const normalCookieValue = request.cookies.get("next-auth.session-token")?.value;
  const rawToken = secureCookieValue || normalCookieValue;
  const cookieName = secureCookieValue ? "__Secure-next-auth.session-token" : "next-auth.session-token";

  let isAuthenticated = false;

  if (rawToken) {
    try {
      // Kendi API'mize soralım, çünkü artık secret'lar ortak ve cross-domain hatalarından kaçınmış oluruz.
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      const host = request.headers.get("host") || "demo.ogzsystem.com";
      const localUrl = `${protocol}://${host}/api/auth/session`;

      const res = await fetch(localUrl, {
        headers: {
          cookie: `${cookieName}=${rawToken}`,
        },
        cache: "no-store"
      });
      const session = await res.json();
      if (session && Object.keys(session).length > 0) {
        isAuthenticated = true;
      }
    } catch (error) {
      console.error("Session fetch error:", error);
    }
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("https://www.ogzsystem.com/admin/login");
    
    // Yönlendirilecek asıl sayfanın URL'sini dinamik olarak belirle
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "demo.ogzsystem.com";
    
    loginUrl.searchParams.set("callbackUrl", `${protocol}://${host}${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
