import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const adminUsername = process.env.ADMIN_USERNAME || "demo";
        const adminPassword = process.env.ADMIN_PASSWORD || "demo2024";

        const isValid =
          credentials.username === adminUsername &&
          credentials.password === adminPassword;

        if (isValid) {
          return {
            id: "1",
            name: adminUsername,
            email: `${adminUsername}@flexerp.demo`,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 365 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".ogzsystem.com" : undefined,
        maxAge: 365 * 24 * 60 * 60, // Persistent for 365 days
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Demo: sadece kendi base URL'imiz içinde kal
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (error) {
        return baseUrl;
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          name: token.name,
        };
      }
      return session;
    },
  },
  // Demo sürümü için ayrı secret — ALD Plastik ile KARIŞMAZ
  secret: "flexerp-demo-separate-secret-2026-not-ald-plastik",
};
