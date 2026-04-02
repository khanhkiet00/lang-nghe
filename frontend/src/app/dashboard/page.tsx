'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type MePayload = {
  sub: string;
  email: string;
  roles: string[];
};

type FilterType = 'month' | 'quarter' | 'year';

const buyerData = {
  month: [
    { name: 'Tháng 1', spent: 1200000 },
    { name: 'Tháng 2', spent: 850000 },
    { name: 'Tháng 3', spent: 2400000 },
  ],
  quarter: [
    { name: 'Quý 1', spent: 4450000 },
    { name: 'Quý 2', spent: 1200000 },
    { name: 'Quý 3', spent: 3000000 },
  ],
  year: [
    { name: '2022', spent: 15400000 },
    { name: '2023', spent: 21000000 },
    { name: '2024', spent: 8650000 },
  ],
};

const artisanRevenueData = {
  month: [
    { name: 'Tháng 1', revenue: 4500000 },
    { name: 'Tháng 2', revenue: 3200000 },
    { name: 'Tháng 3', revenue: 8900000 },
  ],
  quarter: [
    { name: 'Quý 1', revenue: 16600000 },
    { name: 'Quý 2', revenue: 22000000 },
    { name: 'Quý 3', revenue: 19500000 },
  ],
  year: [
    { name: '2022', revenue: 85000000 },
    { name: '2023', revenue: 124000000 },
    { name: '2024', revenue: 58100000 },
  ],
};

const artisanCategoryData = [
  { name: 'Gốm Sứ', value: 400 },
  { name: 'Tơ Lụa', value: 300 },
  { name: 'Đồ Gỗ', value: 300 },
  { name: 'Mây Tre Đan', value: 200 },
];
const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30'];

export default function DashboardControllerPage() {
  const router = useRouter();
  const [me, setMe] = useState<MePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'artisan'>('buyer');
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<FilterType>('month');

  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem('langnghe_access_token');
      if (!token) {
        router.push('/auth');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push('/auth');
          return;
        }

        const data = await res.json();
        setMe(data);
        
        if (data.roles.includes('artisan')) {
          setActiveTab('artisan');
        } else {
          setActiveTab('buyer');
        }
      } catch {
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    }

    void loadMe();
  }, [router]);

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
      localStorage.removeItem('langnghe_refresh_token');
      router.push('/');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
        <p className="text-zinc-500">Đang tải cấu hình...</p>
      </div>
    );
  }

  if (!me) return null;

  const isArtisan = me.roles.includes('artisan');
  const userName = me.email.split('@')[0];

  return (
    <main className="min-h-screen bg-[#F9F9F7] text-[#1A1C1C]">
      {/* Top Navigation */}
      <nav className="border-b border-[#C84B31]/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-extrabold tracking-tighter text-[#C84B31]">
              Làng Nghề
            </Link>
            <span className="text-zinc-300">|</span>
            <span className="font-semibold text-zinc-600">Trang Tổng Quan</span>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="group relative flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-600">
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

              <div
                className={`absolute right-0 top-12 flex w-52 flex-col gap-1 rounded-xl border border-black/5 bg-white p-2 shadow-xl transition-all z-50 ${
                  authMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Tài khoản
                </p>
                <Link href="/" className="rounded-lg px-3 py-2 text-sm hover:bg-[#F2F4F2]">
                  Về trang chủ
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#C84B31] hover:bg-[#F2F4F2]"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Toggle / Filter Tabs */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex rounded-lg bg-zinc-200/50 p-1">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${
                activeTab === 'buyer'
                  ? 'bg-white text-[#C84B31] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Cá Nhân (Mặc định)
            </button>
            <button
              onClick={() => {
                if (isArtisan) setActiveTab('artisan');
              }}
              className={`relative rounded-md px-6 py-2 text-sm font-bold transition-all ${
                activeTab === 'artisan'
                  ? 'bg-[#C84B31] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              } ${!isArtisan && 'opacity-60 grayscale hover:text-zinc-500'}`}
            >
              Xưởng Của Tôi
              {!isArtisan && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-400 text-[10px] text-white">
                  🔒
                </span>
              )}
            </button>
          </div>

          {!isArtisan && (
            <Link
              href="/dashboard/nghe-nhan/dang-ky"
              className="rounded-full bg-[#1A1C1C] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#C84B31]"
            >
              + Đăng Ký Trở Thành Nghệ Nhân
            </Link>
          )}
        </div>

        {/* Time Filter Settings */}
        <div className="mb-8 flex justify-end">
          <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm border border-zinc-100">
            {['month', 'quarter', 'year'].map((type) => (
              <button
                key={type}
                onClick={() => setTimeFilter(type as FilterType)}
                className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  timeFilter === type ? 'bg-[#D4ECA2] text-[#4A5D23]' : 'text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                Theo {type === 'month' ? 'Tháng' : type === 'quarter' ? 'Quý' : 'Năm'}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'buyer' && (
          <div className="space-y-6">
            <header className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-extrabold">Chào mừng trở lại!</h1>
              <p className="mt-2 text-zinc-500">
                Lịch sử mua hàng, đơn hàng đang chờ và những đánh giá của bạn.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-[#C84B31]">Chờ xử lý</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">2</span>
                  <span className="text-zinc-500">đơn kiện</span>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Đã giao</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">5</span>
                  <span className="text-zinc-500">đơn kiện</span>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Đánh giá</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">3</span>
                  <span className="text-zinc-500">review đã viết</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold">Biểu đồ chi tiêu ({timeFilter === 'month' ? 'Theo Tháng' : timeFilter === 'quarter' ? 'Theo Quý' : 'Theo Năm'})</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buyerData[timeFilter]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717A', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, 'Đã chi tiêu']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="spent" stroke="#C84B31" strokeWidth={4} dot={{ r: 6, fill: '#C84B31', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artisan' && isArtisan && (
          <div className="space-y-6">
            <header className="rounded-2xl border border-zinc-200 bg-[#C84B31] p-8 shadow-sm text-white flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-extrabold">Trung Tâm Xưởng</h1>
                <p className="mt-2 text-white/80">
                  Phân tích hoạt động kinh doanh và định hướng cho tương lai.
                </p>
              </div>
              <Link 
                href="/dashboard/nghe-nhan" 
                className="bg-white text-[#C84B31] px-6 py-3 rounded-full font-bold hover:bg-zinc-100 transition-all text-sm"
              >
                ⚙️ Quản lý sản phẩm →
              </Link>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold">Doanh thu ({timeFilter === 'month' ? 'Tháng' : timeFilter === 'quarter' ? 'Quý' : 'Năm'})</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={artisanRevenueData[timeFilter]} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717A', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, 'Doanh thu']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#F9F9F7' }}
                      />
                      <Bar dataKey="revenue" fill="#4A5D23" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold">Tỉ trọng Danh mục</h2>
                <div className="flex items-center justify-between h-72">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={artisanCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {artisanCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} SP`, 'Đã bán']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-2xl font-extrabold text-[#C84B31]">1.2K</span>
                    </div>
                  </div>
                  
                  <div className="w-1/2 pl-6">
                    <ul className="space-y-4">
                      {artisanCategoryData.map((item, idx) => (
                        <li key={item.name} className="flex items-center gap-3">
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <div>
                            <p className="text-sm font-bold text-zinc-700">{item.name}</p>
                            <p className="text-xs text-zinc-400">{item.value} sản phẩm</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
