'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  product: { title: string; images: { url: string }[] };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  buyer: { profile: { display_name: string; village: string } };
  status: string;
  subtotal: number;
  createdAt: string;
  shippingAddress: any;
  orderItems: OrderItem[];
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/artisan`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('langnghe_access_token'),
          }
        });
        const json = await res.json();
        setOrders(json.data?.items || json.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-secondary-container text-secondary border-secondary/20';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
     switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã giao hàng';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    return o.status.toUpperCase() === activeTab;
  });

  return (
    <main className="flex flex-col min-h-screen">
      <header className="px-10 pt-10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface">
            Quản lý Đơn hàng
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">
            Theo dõi và xử lý các đơn đặt hàng thủ công từ làng nghề.
          </p>
        </div>
      </header>

      <div className="px-10 mb-8 overflow-x-auto">
        <div className="flex gap-8 border-b border-outline-variant/20">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-[#c84b31] font-bold border-b-2 border-[#c84b31]'
                  : 'text-on-surface-variant hover:text-[#c84b31] font-semibold'
              }`}
            >
              {tab === 'ALL' ? 'Tất cả' : getStatusLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-10 pb-20 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4 animate-pulse">auto_stories</span>
            <p className="text-sm font-medium">Đang kết nối lò nung...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
            <p className="text-sm font-medium">Chưa có đơn hàng nào trong mục này.</p>
          </div>
        ) : filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-6 flex flex-col gap-6 shadow-sm border border-[#1a1c1c]/5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-[#c84b31]/10 text-[#c84b31] rounded-full font-bold text-[10px] tracking-widest uppercase">
                  #{order.id.slice(-6).toUpperCase()}
                </div>
                <span className="text-on-surface-variant text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                     day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-[10px] tracking-widest uppercase border ${getStatusColor(order.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-black/5">
                <img
                  className="w-full h-full object-cover"
                  src={order.orderItems?.[0]?.product?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                  alt="Order Item"
                />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c716b] mb-1 font-bold">Khách hàng</p>
                  <p className="font-bold text-on-surface">{order.buyer?.profile?.display_name || 'Khách ẩn danh'}</p>
                  <p className="text-sm text-on-surface-variant">{order.buyer?.profile?.village || 'Toàn quốc'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c716b] mb-1 font-bold">Sản phẩm</p>
                  <p className="font-bold text-on-surface truncate">
                    {order.orderItems?.[0]?.product?.title} {order.orderItems.length > 1 ? `(+${order.orderItems.length - 1} khác)` : ''}
                  </p>
                  <p className="text-sm text-on-surface-variant">Tổng số lượng: {order.orderItems.reduce((acc, i) => acc + i.quantity, 0)}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-[#8c716b] mb-1 font-bold">Tổng cộng</p>
                  <p className="font-bold text-xl text-[#c84b31]">{order.subtotal.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <button className="px-5 py-2 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors">
                Chi tiết
              </button>
              <button className="px-6 py-2 bg-[#c84b31] text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                Xác nhận đơn hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
