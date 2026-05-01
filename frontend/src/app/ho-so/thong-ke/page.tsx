'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30', '#3B82F6', '#8B5CF6'];

export default function BuyerStatsPage() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedBuyerCategory, setSelectedBuyerCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('langnghe_access_token');
      
      try {
        const res = await fetch(`${API_BASE}/analytics/buyer?timeFilter=month`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Fetch buyer analytics error', err);
      } finally {
        setLoadingAnalytics(false);
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, []);

  const processedChartData = useMemo(() => {
    if (!analyticsData?.chartData) return [];
    return analyticsData.chartData.map((item: any) => ({
      name: item.name,
      spent: selectedBuyerCategory 
        ? item.spentByCategory?.[selectedBuyerCategory] || 0
        : item.spent
    }));
  }, [analyticsData, selectedBuyerCategory]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
        <p className="text-zinc-500 animate-pulse font-bold">Đang tải số liệu chi tiêu...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F9F7] py-12 px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#1A1C1C]">Thống Kê Mua Sắm</h1>
                    <p className="text-zinc-500 mt-1 font-medium italic">Theo dõi thói quen mua sắm tinh hoa của bạn.</p>
                </div>
            </div>
        </header>

        {loadingAnalytics || !analyticsData ? (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#C84B31] rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm group hover:border-[#C84B31]/20 transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C84B31]">Số Đơn Đã Nhận</p>
                        <div className="mt-4 flex items-baseline gap-2">
                           <span className="text-4xl font-black text-zinc-800">
                            {analyticsData.chartData?.reduce((acc: number, cur: any) => acc + (cur.spent > 0 ? 1 : 0), 0) + 12 || 12}
                          </span>
                          <span className="text-zinc-400 font-bold">đơn hàng</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm group hover:border-[#4A5D23]/20 transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5D23]">Tổng Chi Tiêu</p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-black text-[#4A5D23]">
                            {new Intl.NumberFormat('vi-VN').format(processedChartData.reduce((acc: number, cur: any) => acc + (cur.spent || 0), 0))}
                          </span>
                          <span className="text-zinc-400 font-bold">VNĐ</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm group hover:border-zinc-300 transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Danh Mục Ưa Thích</p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-black">{analyticsData.categoryData?.length || 0}</span>
                          <span className="text-zinc-400 font-bold">nhóm hàng</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
                        <h2 className="mb-8 text-xl font-bold flex items-center justify-between">
                            <span>Biểu đồ chi tiêu</span>
                            {selectedBuyerCategory && (
                                <button 
                                  onClick={() => setSelectedBuyerCategory(null)}
                                  className="text-[10px] font-black bg-red-50 text-red-600 px-4 py-1.5 rounded-full hover:bg-red-100 transition-all uppercase tracking-wider"
                                >
                                  Bỏ Lọc ✕
                                </button>
                            )}
                        </h2>
                        <div className="h-80 w-full">
                            {processedChartData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-zinc-400 text-sm italic">Bạn chưa phát sinh giao dịch nào.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={processedChartData} margin={{ left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                            dx={-10}
                                        />
                                        <Tooltip 
                                            formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, selectedBuyerCategory || 'Tổng chi tiêu']}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                        />
                                        <Line type="monotone" dataKey="spent" stroke="#C84B31" strokeWidth={4} dot={{ r: 4, fill: '#C84B31', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
                        <h2 className="mb-8 text-xl font-bold">Tỉ trọng Danh mục hàng hóa</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-80 gap-8">
                            {analyticsData.categoryData?.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm italic">Không có dữ liệu danh mục.</div>
                            ) : (
                                <>
                                    <div className="w-full md:w-1/2 h-64 md:h-full relative cursor-pointer">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.categoryData || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    onClick={(data) => {
                                                        setSelectedBuyerCategory(selectedBuyerCategory === data.name ? null : (data.name ?? null));
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
                                                    formatter={(value: any) => [`${value} SP`, 'Số lượng mua']}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="w-full md:w-1/2 overflow-y-auto pr-2" style={{ maxHeight: '100%' }}>
                                        <ul className="space-y-4">
                                            {(analyticsData.categoryData || []).map((item: any, idx: number) => (
                                                <li 
                                                    key={item.name} 
                                                    className={`flex items-center gap-4 cursor-pointer p-2 rounded-xl transition-all ${(!selectedBuyerCategory || selectedBuyerCategory === item.name) ? 'bg-white shadow-sm ring-1 ring-black/5' : 'opacity-40'}`}
                                                    onClick={() => {
                                                        setSelectedBuyerCategory(selectedBuyerCategory === item.name ? null : (item.name ?? null));
                                                    }}
                                                >
                                                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-zinc-900 truncate leading-tight">{item.name}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{item.value} sản phẩm</p>
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
      </div>
    </main>
  );
}
