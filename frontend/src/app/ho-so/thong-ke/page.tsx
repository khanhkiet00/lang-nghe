'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Navbar } from '@/components/ui/Navbar';
import { api } from '@/lib/api';

const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30', '#3B82F6', '#8B5CF6'];

export default function BuyerStatsPage() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedBuyerCategory, setSelectedBuyerCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      try {
        const res = await api.get('/analytics/buyer?timeFilter=month');

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

  const categoryData = analyticsData?.categoryData || [];
  const totalSpent = analyticsData?.stats?.totalSales || 0;
  const totalOrders = analyticsData?.stats?.totalOrders || 0;
  const favoriteCategory = categoryData[0]?.name || 'Chưa có';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
         <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C84B31] border-t-transparent"></div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Đang tính toán chi tiêu...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F9F7] text-[#1A1C1C]">
      <Navbar showSearch={false} activePage="none" />

      <div className="mx-auto max-w-7xl space-y-8 px-6 pt-28 pb-20">
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-[#1A1C1C]">Thống Kê Mua Sắm</h1>
                <p className="text-zinc-500 mt-1 font-medium italic">Theo dõi thói quen mua sắm tinh hoa của bạn.</p>
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
                            {totalOrders}
                          </span>
                          <span className="text-zinc-400 font-bold">đơn hàng</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm group hover:border-[#4A5D23]/20 transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5D23]">Tổng Chi Tiêu</p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-black text-[#4A5D23]">
                            {new Intl.NumberFormat('vi-VN').format(totalSpent)}
                          </span>
                          <span className="text-zinc-400 font-bold">VNĐ</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm group hover:border-zinc-300 transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Danh Mục Ưa Thích</p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-black text-zinc-800">
                            {favoriteCategory}
                          </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-bold">Lịch sử chi tiêu</h3>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedBuyerCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!selectedBuyerCategory ? 'bg-[#C84B31] text-white' : 'bg-zinc-100 text-zinc-400'}`}
                          >
                            Tất cả
                          </button>
                          {categoryData.slice(0, 3).map((cat: any) => (
                            <button 
                              key={cat.name}
                              onClick={() => setSelectedBuyerCategory(cat.name)}
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedBuyerCategory === cat.name ? 'bg-[#C84B31] text-white' : 'bg-zinc-100 text-zinc-400'}`}
                            >
                              {cat.name}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }}
                            tickFormatter={(val) => `${val / 1000}k`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ fontWeight: 800, color: '#1A1C1C', marginBottom: '4px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="spent" 
                            stroke="#C84B31" 
                            strokeWidth={4} 
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-8">Phân bổ danh mục</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                      {categoryData.map((cat: any, index: number) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-sm font-bold text-zinc-600">{cat.name}</span>
                          </div>
                          <span className="text-sm font-black text-zinc-800">
                            {Math.round((cat.value / (categoryData.reduce((a: number, b: any) => a + b.value, 0) || 1)) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}
