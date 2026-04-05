'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtisanSidebar from '@/components/ArtisanSidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
      const token = localStorage.getItem('langnghe_access_token');
      if (!token) {
        router.push('/auth?mode=login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push('/auth?mode=login');
          return;
        }

        const data = await res.json();
        if (!data.roles.includes('artisan')) {
          router.push('/'); // Or a "not authorized" page
          return;
        }

        setAuthorized(true);
      } catch (error) {
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
          <p className="text-sm font-medium text-zinc-500">Đang kiểm tra quyền truy cập nghệ nhân...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex bg-[#F9F9F7] text-[#1A1C1C] min-h-screen antialiased">
      <ArtisanSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
