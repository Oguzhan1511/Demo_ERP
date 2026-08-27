import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

/**
 * Demo sürümü: ogzsystem.com paylaşımlı session VEYA yerel NextAuth token ile doğrulama.
 * Önce yerel token dener, bulamazsa ogzsystem'e sorar.
 */
export async function getSharedSession() {
  const cookieStore = await cookies();
  const secureCookie = cookieStore.get("__Secure-next-auth.session-token")?.value;
  const normalCookie = cookieStore.get("next-auth.session-token")?.value;
  const rawToken = secureCookie || normalCookie;
  const cookieName = secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token";

  if (!rawToken) return null;

  // 1) Önce yerel JWT doğrula (demo local login için)
  try {
    const secret = process.env.NEXTAUTH_SECRET || "flexerp-demo-secret-key-2026-separate-from-ald";
    // next-auth getToken mock: header üzerinden değil, cookie değerini decode ederiz
    // Burada basit bir fetch ile kendi /api/auth/session'ımıza sorarız
    const localRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3002"}/api/auth/session`, {
      headers: { cookie: `${cookieName}=${rawToken}` },
      cache: "no-store",
    });
    if (localRes.ok) {
      const localSession = await localRes.json();
      if (localSession && Object.keys(localSession).length > 0 && localSession.user) {
        return localSession;
      }
    }
  } catch (error) {
    // Yerel session fetch başarısız — ogzsystem'i dene
  }

  // 2) Yerel bulamazsa ogzsystem paylaşımlı session'a bak
  try {
    const res = await fetch("https://www.ogzsystem.com/api/auth/session", {
      headers: { cookie: `${cookieName}=${rawToken}` },
      cache: "no-store",
    });
    const session = await res.json();
    if (session && Object.keys(session).length > 0) {
      return session;
    }
  } catch (error) {
    console.error("Shared session fetch error:", error);
  }

  return null;
}
