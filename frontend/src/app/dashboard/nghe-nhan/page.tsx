'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type MePayload = {
  sub: string;
  email: string;
  roles: string[];
};

export default function ArtisanDashboardPage() {
  const [me, setMe] = useState<MePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Dang tai du lieu...');

  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem('langnghe_access_token');
      if (!token) {
        setStatus('Chua co access token. Vui long dang nhap o /auth.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setStatus(`Khong tai duoc thong tin nguoi dung: ${data?.message || res.statusText}`);
          setLoading(false);
          return;
        }

        setMe(data);
        setStatus('Da ket noi backend auth thanh cong.');
      } catch {
        setStatus('Khong the ket noi backend. Kiem tra API URL va server.');
      } finally {
        setLoading(false);
      }
    }

    void loadMe();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(99,102,241,0.08),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,0.08),transparent_32%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm md:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-zinc-400">Dashboard Nghe Nhan</p>
          <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Tong quan cong viec</h1>
          <p className="mt-3 text-zinc-300">Giao dien toi gian, uu tien doc nhanh va thao tac ngan gon.</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="/auth"
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition-all duration-200 ease-out hover:border-zinc-600 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Dang nhap lai
            </Link>
            <Link
              href="/"
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition-all duration-200 ease-out hover:border-zinc-600 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Ve trang tao ho so
            </Link>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-zinc-400">Don moi</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">12</p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-zinc-400">Dang xu ly</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">8</p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-zinc-400">Danh gia TB</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">4.8</p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-zinc-400">Doanh thu thang</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">42.5M</p>
          </article>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-100">Trang thai ket noi</h2>
            <p className="mt-3 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">{status}</p>

            {loading && <p className="mt-3 text-sm text-zinc-400">Dang kiem tra token...</p>}

            {me && (
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2">User ID: {me.sub}</p>
                <p className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2">Email: {me.email}</p>
                <p className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2">Roles: {me.roles.join(', ')}</p>
              </div>
            )}
          </article>

          <aside className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200 transition-all duration-200 ease-out hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900">
                Tao san pham moi
              </button>
              <button className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200 transition-all duration-200 ease-out hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900">
                Cap nhat profile
              </button>
              <button className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200 transition-all duration-200 ease-out hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900">
                Xem danh sach don
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
