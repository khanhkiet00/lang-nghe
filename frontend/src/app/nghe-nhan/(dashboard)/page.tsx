'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COLORS = ['#C84B31', '#D4ECA2', '#4A5D23', '#F2AE30', '#3B82F6', '#8B5CF6'];

type FilterType = 'month' | 'quarter' | 'year';

export default function ArtisanDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // States for Analytics Filters
  const [timeFilter, setTimeFilter] = useState<FilterType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedArtisanCategory, setSelectedArtisanCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('langnghe_access_token');
      
      try {
        const queryParams = new URLSearchParams({ timeFilter });
        if (startDate) queryParams.append('startDate', new Date(startDate).toISOString());
        if (endDate) queryParams.append('endDate', new Date(endDate).toISOString());

        const res = await fetch(`${API_BASE}/analytics/artisan?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Fetch artisan analytics error', err);
      } finally {
        setLoadingAnalytics(false);
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [timeFilter, startDate, endDate]);

  const processedChartData = useMemo(() => {
    if (!analyticsData?.chartData) return [];
    return analyticsData.chartData.map((item: any) => ({
      name: item.name,
      revenue: selectedArtisanCategory
        ? item.revenueByCategory?.[selectedArtisanCategory] || 0
        : item.revenue
    }));
  }, [analyticsData, selectedArtisanCategory]);

  if (loading && !analyticsData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C84B31] border-t-transparent"></div>
          <p className="text-sm text-zinc-500">Đang khởi tạo lò nung dữ liệu...</p>
        </div>
      </div>
    );
  }

  const { stats } = analyticsData || {
    stats: { totalSales: 0, totalOrders: 0, totalProducts: 0, avgOrderValue: 0 }
  };

  return (
    <main className="p-8 md:p-12 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1C1C] tracking-tight">
            Quản Lý Xưởng
          </h1>
          <p className="text-[#58413C] mt-2 font-medium">
            Phân tích số liệu và đơn hàng theo thời gian thực.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-3 md:items-center">
          {/* Date Range Filters */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-black/5 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Từ</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs outline-none text-[#58413C] bg-transparent font-bold"
            />
            <span className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Đến</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs outline-none text-[#58413C] bg-transparent font-bold"
            />
            {(startDate || endDate) && (
              <button
                 onClick={() => { setStartDate(''); setEndDate(''); }}
                 className="text-[10px] text-red-500 hover:text-red-700 ml-2 font-black uppercase tracking-tighter"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-black/5">
            {['month', 'quarter', 'year'].map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f as FilterType)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
                  timeFilter === f 
                  ? 'bg-[#C84B31] text-white shadow-md' 
                  : 'text-[#58413C] hover:bg-zinc-50'
                }`}
              >
                {f === 'month' ? 'Tháng' : f === 'quarter' ? 'Quý' : 'Năm'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loadingAnalytics ? (
         <div className="py-20 flex flex-col gap-4 items-center justify-center">
           <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#C84B31] rounded-full animate-spin"></div>
           <p className="text-zinc-500 font-bold animate-pulse text-sm">Đang tổng hợp dữ liệu...</p>
         </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { label: 'Doanh thu', value: `${(stats?.totalSales || 0).toLocaleString()}₫`, icon: 'payments', colors: 'bg-red-50 text-[#C84B31]' },
              { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: 'shopping_bag', colors: 'bg-green-50 text-[#4A5D23]' },
              { label: 'Tác phẩm', value: stats?.totalProducts || 0, icon: 'inventory_2', colors: 'bg-blue-50 text-[#00647d]' },
              { label: 'Giá trị TB', value: `${(stats?.avgOrderValue || 0).toLocaleString()}₫`, icon: 'trending_up', colors: 'bg-orange-50 text-[#F2AE30]' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between group hover:border-[#C84B31]/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {card.label}
                  </span>
                  <div className={`p-2 rounded-lg ${card.colors}`}>
                    <span className="material-symbols-outlined text-xl">{card.icon}</span>
                  </div>
                </div>
                <div className="text-3xl font-black text-[#1A1C1C]">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-black/5">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">Biểu đồ Doanh thu</h3>
                  {selectedArtisanCategory && (
                    <button 
                      onClick={() => setSelectedArtisanCategory(null)}
                      className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors uppercase"
                    >
                      Bỏ Lọc Danh Mục ✕
                    </button>
                  )}
                </div>
                <span className="text-xs font-bold text-[#c84b31] uppercase tracking-widest">VNĐ / Thời gian</span>
              </div>
              <div className="h-[350px] w-full">
                {processedChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Không có dữ liệu doanh thu.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedChartData} barSize={36} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717A', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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

            {/* Category Pie */}
            <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-black/5">
              <h3 className="text-xl font-bold mb-10">Tỷ lệ Danh mục bán ra</h3>
              <div className="h-[300px] w-full">
                {analyticsData?.categoryData?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-sm italic">Chưa có dữ liệu bán hàng.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.categoryData || []}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        onClick={(data) => {
                          setSelectedArtisanCategory(selectedArtisanCategory === data.name ? null : (data.name ?? null));
                        }}
                      >
                        {(analyticsData?.categoryData || []).map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            opacity={(!selectedArtisanCategory || selectedArtisanCategory === entry.name) ? 1 : 0.2}
                            className="transition-opacity duration-300 outline-none hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-6 space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {(analyticsData?.categoryData || []).map((entry: any, i: number) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between cursor-pointer transition-all ${(!selectedArtisanCategory || selectedArtisanCategory === entry.name) ? 'opacity-100' : 'opacity-40'}`}
                    onClick={() => setSelectedArtisanCategory(selectedArtisanCategory === entry.name ? null : (entry.name ?? null))}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-[#58413C]">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold">{entry.value} đơn</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Reasons Section */}
            <div className="lg:col-span-12 rounded-2xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 text-red-600">
                 <span className="material-symbols-outlined text-[100px]">cancel</span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-red-600 flex items-center gap-2">
                <span className="bg-red-50 text-red-600 p-1.5 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">report_problem</span>
                </span>
                Lý do đơn hàng bị hủy
              </h2>
              <p className="text-zinc-500 mb-8 text-sm font-medium italic">Thống kê lý do khách hủy hoặc không hoàn thành để cải thiện dịch vụ của xưởng.</p>
              
              <div className="h-[250px] w-full">
                 {!analyticsData?.cancelReasons || analyticsData.cancelReasons.length === 0 ? (
                   <div className="h-full flex items-center justify-center text-zinc-400 font-medium">Không có dữ liệu đơn hàng bị hủy trong khoảng thời gian này ❤️</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={analyticsData.cancelReasons} layout="vertical" margin={{ left: 10 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
                       <XAxis type="number" hide />
                       <YAxis 
                         type="category" 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         width={220}
                         tick={{ fill: '#3F3F46', fontSize: 13, fontWeight: '700' }} 
                       />
                       <Tooltip 
                         formatter={(value: any) => [`${value} Đơn`, 'Số lượng']}
                         contentStyle={{ borderRadius: '12px', border: '1px solid #fee2e2', boxShadow: '0 4px 15px rgba(239,68,68,0.1)' }}
                         cursor={{ fill: '#fef2f2' }}
                       />
                       <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={40}>
                         {analyticsData.cancelReasons.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#ef4444', '#f87171', '#fca5a5', '#fecaca'][index % 4]} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
