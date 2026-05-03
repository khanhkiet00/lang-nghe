'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtisanSidebar from '@/components/ArtisanSidebar';
import { api } from '@/lib/api';

export default function ArtisanDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get('/auth/me');

        if (!res.ok) {
          router.push('/auth?mode=login');
          return;
        }

        const data = await res.json();
        const roles = data.roles || [];
        if (!roles.includes('artisan')) {
          router.push('/');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth?mode=login');
      } finally {
        setLoading(false);
      }
    }

    void checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C84B31] border-t-transparent"></div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Đang kết nối lò nung...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex bg-[#F9F9F7] text-[#1A1C1C] min-h-screen antialiased">
      <ArtisanSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto pt-16 pb-24 md:pt-0 md:pb-0">
        {children}
      </div>
    </div>
  );
}
