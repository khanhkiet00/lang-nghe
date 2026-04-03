'use client';

import { useEffect, useState, useMemo } from 'react';
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

const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30', '#3B82F6', '#8B5CF6'];

export default function DashboardControllerPage() {
  const router = useRouter();
  const [me, setMe] = useState<MePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'artisan'>('buyer');
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  
  // States for Analytics
  const [timeFilter, setTimeFilter] = useState<FilterType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [selectedBuyerCategory, setSelectedBuyerCategory] = useState<string | null>(null);
  const [selectedArtisanCategory, setSelectedArtisanCategory] = useState<string | null>(null);

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

  useEffect(() => {
    if (!me) return;
    
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('langnghe_access_token');
      
      try {
        const queryParams = new URLSearchParams({ timeFilter });
        if (startDate) queryParams.append('startDate', new Date(startDate).toISOString());
        if (endDate) queryParams.append('endDate', new Date(endDate).toISOString());

        const res = await fetch(`${API_BASE}/analytics/${activeTab}?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Fetch analytics error', err);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, [me, activeTab, timeFilter, startDate, endDate]);

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
    } catch {} finally {
      localStorage.removeItem('langnghe_access_token');
      localStorage.removeItem('langnghe_refresh_token');
      router.push('/');
    }
  }

  const processedChartData = useMemo(() => {
    if (!analyticsData?.chartData) return [];
    return analyticsData.chartData.map((item: any) => {
      if (activeTab === 'buyer') {
        return {
          name: item.name,
          spent: selectedBuyerCategory 
            ? item.spentByCategory?.[selectedBuyerCategory] || 0
            : item.spent
        };
      } else {
        return {
          name: item.name,
          revenue: selectedArtisanCategory
            ? item.revenueByCategory?.[selectedArtisanCategory] || 0
            : item.revenue
        };
      }
    });
  }, [analyticsData, activeTab, selectedBuyerCategory, selectedArtisanCategory]);

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
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex rounded-lg bg-zinc-200/50 p-1">
            <button
              onClick={() => { setActiveTab('buyer'); setSelectedBuyerCategory(null); }}
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
                if (isArtisan) { setActiveTab('artisan'); setSelectedArtisanCategory(null); }
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

          <div className="flex flex-col md:flex-row items-end gap-2 md:items-center">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-200">
              <span className="text-[11px] font-bold uppercase text-zinc-500">Từ</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm outline-none text-zinc-700 bg-transparent"
              />
              <span className="text-[11px] font-bold uppercase text-zinc-500 ml-2">Đến</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm outline-none text-zinc-700 bg-transparent"
              />
              {(startDate || endDate) && (
                <button
                   onClick={() => { setStartDate(''); setEndDate(''); }}
                   className="text-xs text-red-500 hover:text-red-700 ml-2 font-bold"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm border border-zinc-100 h-full">
              {['month', 'quarter', 'year'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTimeFilter(type as FilterType)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all h-full ${
                    timeFilter === type ? 'bg-[#D4ECA2] text-[#4A5D23]' : 'text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {type === 'month' ? 'Tháng' : type === 'quarter' ? 'Quý' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingAnalytics || !analyticsData ? (
           <div className="py-20 flex flex-col gap-4 items-center justify-center">
             <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#C84B31] rounded-full animate-spin"></div>
             <p className="text-zinc-500 font-bold animate-pulse text-sm">Đang tải và tổng hợp dữ liệu thời gian thực...</p>
           </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'buyer' && (
              <div className="space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                  <h1 className="text-2xl font-extrabold">Chào mừng trở lại!</h1>
                  <p className="mt-2 text-zinc-500">
                    Lịch sử mua hàng, đơn hàng đang chờ và biểu đồ chi tiêu tùy chỉnh của bạn.
                  </p>
                </header>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#C84B31]">Số Đơn Đã Giao</p>
                    <div className="mt-4 flex items-baseline gap-2">
                       <span className="text-4xl font-extrabold text-zinc-800">
                        {analyticsData.chartData?.reduce((acc: number, cur: any) => acc + (cur.spent > 0 ? 1 : 0), 0) + 12 || 12}
                      </span>
                      <span className="text-zinc-500">đơn</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#4A5D23]">Tổng Mua Hàng</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-[#4A5D23]">
                        {new Intl.NumberFormat('vi-VN').format(processedChartData.reduce((acc: number, cur: any) => acc + (cur.spent || 0), 0))}
                      </span>
                      <span className="text-zinc-500">VNĐ</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Danh Mục</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold">{analyticsData.categoryData?.length || 0}</span>
                      <span className="text-zinc-500">nhóm đồ</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold flex items-center justify-between">
                      <span>Biểu đồ chi tiêu</span>
                      {selectedBuyerCategory && (
                        <button 
                          onClick={() => setSelectedBuyerCategory(null)}
                          className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100"
                        >
                          Bỏ Lọc ✕
                        </button>
                      )}
                    </h2>
                    <div className="h-72 w-full">
                      {processedChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Không có dữ liệu chi tiêu trong khoảng thời gian này.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processedChartData} margin={{ left: 10 }}>
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
                              formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, selectedBuyerCategory || 'Tổng chi tiêu']}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="spent" stroke="#C84B31" strokeWidth={4} dot={{ r: 4, fill: '#C84B31', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold">Tỉ trọng Danh mục</h2>
                    <div className="flex items-center justify-between h-72">
                      {analyticsData.categoryData?.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Không có dữ liệu mua hàng.</div>
                      ) : (
                        <>
                          <div className="w-1/2 h-full relative cursor-pointer">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsData.categoryData || []}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                  onClick={(data) => {
                                    if (selectedBuyerCategory === data.name) {
                                      setSelectedBuyerCategory(null);
                                    } else {
                                      setSelectedBuyerCategory(data.name || '');
                                    }
                                  }}
                                >
                                  {(analyticsData.categoryData || []).map((entry: any, index: number) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={COLORS[index % COLORS.length]} 
                                      opacity={(!selectedBuyerCategory || selectedBuyerCategory === entry.name) ? 1 : 0.2}
                                      className="transition-opacity duration-300 outline-none hover:opacity-80"
                                    />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: any) => [`${value} SP`, 'Số lượng']}
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="w-1/2 pl-6">
                            <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
                              {(analyticsData.categoryData || []).map((item: any, idx: number) => (
                                <li 
                                  key={item.name} 
                                  className={`flex items-center gap-3 cursor-pointer transition-all ${(!selectedBuyerCategory || selectedBuyerCategory === item.name) ? 'opacity-100 hover:scale-105' : 'opacity-40'}`}
                                  onClick={() => {
                                    if (selectedBuyerCategory === item.name) {
                                      setSelectedBuyerCategory(null);
                                    } else {
                                      setSelectedBuyerCategory(item.name || '');
                                    }
                                  }}
                                >
                                  <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                  <div>
                                    <p className="text-sm font-bold text-zinc-700 leading-tight">{item.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">{item.value} sản phẩm</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
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
                      Phân tích số liệu và đơn hàng bị hủy bỏ dựa theo thời gian thực.
                    </p>
                  </div>
                  <Link 
                    href="/dashboard/nghe-nhan" 
                    className="bg-white text-[#C84B31] px-6 py-3 rounded-full font-bold hover:bg-zinc-100 transition-all text-sm shadow-md"
                  >
                    ⚙️ Quản lý sản phẩm →
                  </Link>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold flex items-center justify-between">
                      <span>Doanh thu</span>
                      {selectedArtisanCategory && (
                        <button 
                          onClick={() => setSelectedArtisanCategory(null)}
                          className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                        >
                          Bỏ Lọc ✕
                        </button>
                      )}
                    </h2>
                    <div className="h-72 w-full">
                       {processedChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Không có dữ liệu doanh thu trong khoảng thời gian này.</div>
                      ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedChartData} barSize={36} margin={{ left: 10 }}>
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
                            formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, selectedArtisanCategory || 'Tổng Doanh thu']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#F9F9F7' }}
                          />
                          <Bar dataKey="revenue" fill="#4A5D23" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold">Thống kê Danh mục bán ra</h2>
                    <div className="flex items-center justify-between h-72">
                      {analyticsData.categoryData?.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Không có dữ liệu.</div>
                      ) : (
                        <>
                      <div className="w-1/2 h-full relative cursor-pointer">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.categoryData || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              onClick={(data) => {
                                if (selectedArtisanCategory === data.name) {
                                  setSelectedArtisanCategory(null);
                                } else {
                                  setSelectedArtisanCategory(data.name || '');
                                }
                              }}
                            >
                              {(analyticsData.categoryData || []).map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                  opacity={(!selectedArtisanCategory || selectedArtisanCategory === entry.name) ? 1 : 0.2}
                                  className="transition-opacity duration-300 outline-none hover:opacity-80"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`${value} SP`, 'Đã bán']}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-1/2 pl-6">
                        <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
                          {(analyticsData.categoryData || []).map((item: any, idx: number) => (
                            <li 
                              key={item.name} 
                              className={`flex items-center gap-3 cursor-pointer transition-all ${(!selectedArtisanCategory || selectedArtisanCategory === item.name) ? 'opacity-100 hover:scale-105' : 'opacity-40'}`}
                              onClick={() => {
                                if (selectedArtisanCategory === item.name) {
                                  setSelectedArtisanCategory(null);
                                } else {
                                  setSelectedArtisanCategory(item.name || '');
                                }
                              }}
                            >
                              <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <div>
                                <p className="text-sm font-bold text-zinc-700 leading-tight">{item.name}</p>
                                <p className="text-[10px] text-zinc-400 font-medium">{item.value} sản phẩm đã bán</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      </>
                      )}
                    </div>
                  </div>

                  {/* THỐNG KÊ LÝ DO HỦY ĐƠN */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm lg:col-span-2 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                       <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-red-600 flex items-center gap-2">
                      <span className="bg-red-100 text-red-600 p-1.5 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      Lý do đơn hàng bị hủy
                    </h2>
                    <p className="text-zinc-500 mb-8 text-sm">Thống kê lý do khách hủy hoặc không hoàn thành để xưởng có thể tìm hướng khắc phục.</p>
                    <div className="h-[250px] w-full">
                       {analyticsData.cancelReasons?.length === 0 ? (
                         <div className="h-full flex items-center justify-center text-zinc-400 font-medium">Không có dữ liệu đơn hàng bị hủy trong khoảng thời gian này ❤️</div>
                       ) : (
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={analyticsData.cancelReasons || []} layout="vertical" margin={{ left: 10 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
                             <XAxis type="number" hide />
                             <YAxis 
                               type="category" 
                               dataKey="name" 
                               axisLine={false} 
                               tickLine={false} 
                               width={200}
                               tick={{ fill: '#3F3F46', fontSize: 13, fontWeight: '600' }} 
                             />
                             <Tooltip 
                               formatter={(value: any) => [`${value} Đơn`, 'Số lượng hủy']}
                               contentStyle={{ borderRadius: '12px', border: '1px solid #fee2e2', boxShadow: '0 4px 15px rgba(239,68,68,0.1)' }}
                               cursor={{ fill: '#fef2f2' }}
                             />
                             <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={40}>
                               {(analyticsData.cancelReasons || []).map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f87171', '#fca5a5', '#fecaca'][index % 4]} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
