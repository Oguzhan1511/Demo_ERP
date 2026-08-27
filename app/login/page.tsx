"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Kullanıcı adı veya şifre hatalı.");
    } else if (res?.url) {
      router.push(res.url);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30">
              F
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-2xl tracking-tight leading-none">FlexERP</div>
              <div className="text-teal-400 text-xs font-semibold tracking-widest uppercase">Demo</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Üretim ve Stok Yönetim Sistemi</p>
        </div>

        {/* Kart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-2xl">
          <h1 className="text-white font-semibold text-lg mb-6">Giriş Yap</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="demo"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700/50 rounded-lg px-3.5 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {/* Demo bilgisi */}
          <div className="mt-5 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center mb-2">Demo hesabı</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setUsername("demo"); setPassword("demo2024"); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 transition-colors"
              >
                <span className="font-mono">demo / demo2024</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 opacity-50">
          <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5 A 8 8 0 1 0 11 4.1" />
          </svg>
          <span className="text-gray-400 text-xs">ogzsystem</span>
        </div>
      </div>
    </div>
  );
}
