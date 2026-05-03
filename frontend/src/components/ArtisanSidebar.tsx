'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { resolveImageUrl } from '@/lib/images';
import { api } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type ArtisanProfile = {
  fullName: string;
  expertise?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
};

export default function ArtisanSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('langnghe_access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/artisans/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      }
    }

    void fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchPendingOrders() {
      try {
        const res = await api.get('/orders/artisan?status=pending&page=1&limit=1');
        if (!res.ok) return;
        const json = await res.json();
        const total = json.data?.pagination?.total ?? json.data?.items?.length ?? 0;
        setPendingOrderCount(total);
      } catch {
        setPendingOrderCount(0);
      }
    }

    void fetchPendingOrders();
  }, [pathname]);

  const menuItems = [
    { name: 'Bảng điều khiển', icon: 'dashboard', href: '/nghe-nhan' },
    { name: 'Kho hàng', icon: 'inventory_2', href: '/nghe-nhan/san-pham' },
    { name: 'Đơn hàng', icon: 'local_shipping', href: '/nghe-nhan/don-hang' },
    { name: 'Cài đặt', icon: 'settings', href: '/nghe-nhan/settings' },
  ];

  const studioName = profile?.fullName || 'Xưởng Làng Nghề';
  const studioSubtitle = profile?.expertise || (profile?.isVerified ? 'Đã xác thực' : 'Nghệ nhân');
  const avatarUrl = resolveImageUrl(
    profile?.avatarUrl,
    'https://images.unsplash.com/photo-1603321544554-f416a9a11fcf?q=80&w=400&auto=format&fit=crop',
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#1a1c1c]/5 bg-[#f5f2ee]/95 px-4 backdrop-blur md:hidden">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#c84b31] shadow-sm"
          aria-label="Về trang chủ"
        >
          <span className="material-symbols-outlined text-xl">home</span>
        </Link>
        <div className="min-w-0 px-3 text-center">
          <p className="truncate text-sm font-black text-[#1A1C1C]">{studioName}</p>
          <p className="truncate text-[10px] font-bold uppercase tracking-widest text-[#1A1C1C]/50">
            Kênh nghệ nhân
          </p>
        </div>
        <Link
          href="/nghe-nhan/san-pham/them"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c84b31] text-white shadow-sm"
          aria-label="Thêm tác phẩm"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </Link>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1a1c1c]/5 bg-white/95 px-2 py-2 shadow-[0_-12px_30px_rgba(26,28,28,0.08)] backdrop-blur md:hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold ${
                isActive
                  ? 'bg-[#c84b31]/10 text-[#c84b31]'
                  : 'text-[#1A1C1C]/55'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
            <span className="truncate">{item.name}</span>
            {item.href === '/nghe-nhan/don-hang' && pendingOrderCount > 0 && (
              <span className="absolute right-2 top-1 rounded-full bg-[#c84b31] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
                {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
              </span>
            )}
          </Link>
          );
        })}
      </nav>

      <aside className="hidden md:flex h-screen w-72 border-r border-[#1a1c1c]/5 bg-[#f5f2ee] flex-col p-6 sticky top-0">
      <div className="font-black text-[#c84b31] text-xl mb-8 tracking-tighter line-clamp-2">
        {studioName}
      </div>
      
      <div className="flex items-center gap-3 mb-10 p-2">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 border border-black/5">
          <img
            alt={studioName}
            className="w-full h-full object-cover"
            src={avatarUrl}
          />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-[#1A1C1C] truncate">{studioName}</div>
          <div className="text-[10px] uppercase tracking-wider text-[#1A1C1C]/60 font-bold truncate">
            {studioSubtitle}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-transform hover:translate-x-1 rounded-xl group ${
                isActive
                  ? 'bg-white text-[#c84b31] shadow-sm'
                  : 'text-[#1a1c1c]/70 hover:bg-black/5'
              }`}
            >
              <span 
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
              {item.href === '/nghe-nhan/don-hang' && pendingOrderCount > 0 && (
                <span className="ml-auto rounded-full bg-[#c84b31] px-2 py-0.5 text-[10px] font-black text-white">
                  {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 w-full px-4 py-3 text-[#1a1c1c]/70 hover:bg-black/5 rounded-xl font-bold transition-all"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-sm">Về trang chủ</span>
        </Link>
        <Link
          href="/nghe-nhan/san-pham/them"
          className="flex items-center justify-center gap-2 w-full py-4 bg-[#c84b31] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#c84b31]/20 active:scale-95 transition-all mb-4"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Thêm tác phẩm mới
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('langnghe_access_token');
            localStorage.removeItem('langnghe_refresh_token');
            window.location.href = '/auth?mode=login';
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 rounded-xl font-bold transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm">Đăng xuất</span>
        </button>
      </div>
      </aside>
    </>
  );
}
