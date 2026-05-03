'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartNavIcon } from '@/components/CartNavIcon';

interface NavbarProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  activePage?: 'home' | 'artisan' | 'orders' | 'profile' | 'none';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function Navbar({
  showSearch = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchValue = '',
  onSearchChange,
  activePage = 'none'
}: NavbarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('langnghe_access_token') : null;
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          setUserName(payload.email.split('@')[0]);
        }
        if (payload.roles) {
          setIsArtisan(payload.roles.includes('artisan'));
        }
      } catch (e) { }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem('langnghe_access_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
    } finally {
      localStorage.removeItem('langnghe_access_token');
      setIsLoggedIn(false);
      setAuthMenuOpen(false);
      router.push('/');
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
        <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tighter text-[#C84B31]">
          Làng Nghề
        </Link>

        {showSearch && (
          <div className="mx-12 hidden max-w-md flex-1 md:flex">
            <div className="group relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#C84B31]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full rounded-full border-none bg-[#F2F4F2] py-2.5 pl-12 pr-4 text-sm text-zinc-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#C84B31]/20"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="mr-4 hidden items-center gap-8 lg:flex">
            <Link 
              className={`font-bold transition-colors ${activePage === 'home' ? 'text-[#C84B31]' : 'text-zinc-600 hover:text-[#C84B31]'}`} 
              href="/"
            >
              Trang chủ
            </Link>
            {isLoggedIn && (
              <Link 
                href="/don-hang" 
                className={`font-medium transition-colors ${activePage === 'orders' ? 'text-[#C84B31]' : 'text-zinc-600 hover:text-[#C84B31]'}`}
              >
                Đơn hàng
              </Link>
            )}
          </div>

          <CartNavIcon />

          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=login"
                className="rounded-full border border-[#C84B31]/30 px-4 py-2 text-sm font-semibold text-[#C84B31] transition-all hover:border-[#C84B31]"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth?mode=register"
                className="rounded-full bg-[#C84B31] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="relative flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-bold text-zinc-600">
                {userName}
              </span>
              <button
                onClick={() => setAuthMenuOpen((prev) => !prev)}
                className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-[#C84B31]/10 transition-all hover:border-[#C84B31]"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5LVvXgxx-E-_57gSL5yTTHo_76HhRKKKX0zvbt3BVTPVJ1MjIAA9uFcNBjB-jgeuX4jDcr8IPeK6Cnu-_xv26QGMYOEP6BC0FLFYTRNLGxMe6gQqdh3sMjLdOooevoZNZR6A6i-z4EAapm6gP-9bb8sLyLsebdzA9jFH7Pmsya64g91i6l-Qj1dQ-9K925hZ6yMeqQKhdobUcUtJUpbaLz4Z_eheMnOsw-FxAVh1c5RbGBFFrxa9cH3LeKO3ap-ovGyJdQTW6rL5"
                  alt="Hồ sơ"
                  className="h-full w-full object-cover"
                />
              </button>

              {authMenuOpen && (
                <div
                  className="absolute right-0 top-12 flex w-52 flex-col gap-1 rounded-xl border border-black/5 bg-white p-2 shadow-xl transition-all z-50"
                  onMouseLeave={() => setAuthMenuOpen(false)}
                >
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Tài khoản
                  </p>
                  <Link href="/ho-so" className="rounded-lg px-3 py-2 text-sm hover:bg-[#F2F4F2]">
                    Hồ sơ của tôi
                  </Link>
                  <Link href="/don-hang" className="rounded-lg px-3 py-2 text-sm hover:bg-[#F2F4F2]">
                    Đơn hàng của tôi
                  </Link>
                  <Link href="/ho-so/thong-ke" className="rounded-lg px-3 py-2 text-sm text-[#C84B31] font-medium hover:bg-[#F2F4F2]">
                    Thống kê chi tiêu
                  </Link>
                  {isArtisan ? (
                    <Link href="/nghe-nhan" className="rounded-lg px-3 py-2 text-sm text-[#4A5D23] font-semibold hover:bg-[#F2F4F2]">
                      Quản lý xưởng
                    </Link>
                  ) : (
                    <Link href="/nghe-nhan/dang-ky" className="rounded-lg px-3 py-2 text-sm text-[#C84B31] font-semibold hover:bg-[#F2F4F2]">
                      ★ Trở thành Nghệ nhân
                    </Link>
                  )}
                  <div className="h-px bg-zinc-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-600 hover:bg-[#F2F4F2]"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
