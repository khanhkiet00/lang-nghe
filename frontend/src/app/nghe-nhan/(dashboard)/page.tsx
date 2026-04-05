'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30', '#3B82F6', '#8B5CF6'];

export default function ArtisanDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const token = localStorage.getItem('langnghe_access_token');
      try {
        const res = await fetch(`${API_BASE}/analytics/artisan?timeFilter=${timeFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Fetch artisan analytics error', err);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [timeFilter]);

  if (loading && !analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C84B31] border-t-transparent"></div>
          <p className="text-sm text-zinc-500">Đang khởi tạo lò nung dữ liệu...</p>
        </div>
      </div>
    );
  }

  const { stats, salesOverTime, categorySales } = analytics || {
    stats: { totalSales: 0, totalOrders: 0, totalProducts: 0, avgOrderValue: 0 },
    salesOverTime: [],
    categorySales: []
  };

  return (
    <main className="p-8 md:p-12 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1C1C] tracking-tight">
            Xin chào, Nghệ nhân!
          </h1>
          <p className="text-[#58413C] mt-2 font-medium">
            Đây là tình hình kinh doanh các tác phẩm của bạn.
          </p>
        </div>
        
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-black/5">
          {['month', 'year'].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                timeFilter === f 
                ? 'bg-[#C84B31] text-white shadow-md' 
                : 'text-[#58413C] hover:bg-zinc-50'
              }`}
            >
              {f === 'month' ? 'Tháng này' : 'Năm nay'}
            </button>
          ))}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Doanh thu', value: `${(stats?.totalSales || 0).toLocaleString()}₫`, icon: 'payments', color: '#C84B31' },
          { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: 'shopping_bag', color: '#52652a' },
          { label: 'Tác phẩm', value: stats?.totalProducts || 0, icon: 'inventory_2', color: '#00647d' },
          { label: 'Giá trị TB', value: `${(stats?.avgOrderValue || 0).toLocaleString()}₫`, icon: 'trending_up', color: '#F2AE30' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between group hover:border-[#C84B31]/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c716b]">
                {card.label}
              </span>
              <span className="material-symbols-outlined text-zinc-300 group-hover:text-[#C84B31] transition-colors">
                {card.icon}
              </span>
            </div>
            <div className="text-3xl font-black text-[#1A1C1C]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold">Biểu đồ Doanh thu</h3>
            <span className="text-xs font-bold text-[#c84b31] uppercase tracking-widest">VNĐ / Thời gian</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8c716b', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8c716b', fontSize: 12}}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                  formatter={(value: any) => [`${value.toLocaleString()}₫`, 'Doanh thu']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#C84B31" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#C84B31', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-xl font-bold mb-10">Tỷ lệ Danh mục</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySales.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {categorySales.slice(0, 4).map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-[#58413C]">{entry.name}</span>
                </div>
                <span className="text-sm font-bold">{entry.value} đơn</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
