'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import OrderDetailDrawer from '@/components/OrderDetailDrawer';
import { resolveImageUrl } from '@/lib/images';
import BuyerReviewModal from '@/components/ui/BuyerReviewModal';

const productFallbackImage =
  'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=400&auto=format&fit=crop';

interface OrderItem {
  id: string;
  product: { title: string; images: { url: string }[] };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  artisanId: string;
  buyerId: string;
  buyer: { id: string; profile: { display_name: string; avatar_url?: string } };
  status: string;
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  artisanAmount: number;
  createdAt: string;
  shippingAddress: any;
  orderItems: OrderItem[];
  trackingCode?: string;
  noteFromBuyer?: string;
  reviews?: Array<{
    id: string;
    reviewer_id: string;
    reviewee_id: string;
    order_id: string;
  }>;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [buyerReviewModal, setBuyerReviewModal] = useState<{
    isOpen: boolean;
    orderId: string;
    buyerId: string;
    buyerName: string;
  }>({ isOpen: false, orderId: '', buyerId: '', buyerName: '' });

  const fetchOrders = useCallback(async (page: number, status: string, search: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsFetching(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      });
      if (status !== 'ALL') query.append('status', status.toLowerCase());

      const res = await api.get(`/orders/artisan?${query.toString()}`);
      const json = await res.json();
      const items = json.data?.items || json.data || [];
      setOrders(items);
      setTotalOrders(json.data?.pagination?.total || items.length);
      setTotalPages(json.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string, data: any = {}) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status, ...data });

      if (res.ok) {
        toast.success('Cập nhật trạng thái thành công');
        fetchOrders(currentPage, activeTab, searchTerm, false);
      } else {
        const err = await res.json();
        toast.error('Lỗi: ' + (err.message || 'Không thể cập nhật'));
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    }
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const hasReviewedBuyer = (order: Order) =>
    order.reviews?.some(
      (review) =>
        review.reviewer_id === order.artisanId &&
        review.reviewee_id === order.buyerId,
    );

  // Initial load
  useEffect(() => {
    fetchOrders(1, 'PENDING', '', true);
  }, [fetchOrders]);

  // Handle Tab change
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1);
      fetchOrders(1, activeTab, searchTerm, false);
    }
  }, [activeTab]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        setCurrentPage(1);
        fetchOrders(1, activeTab, searchTerm, false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Page change
  useEffect(() => {
    if (currentPage !== 1 && !loading) {
      fetchOrders(currentPage, activeTab, searchTerm, false);
    }
  }, [currentPage]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]';
      case 'processing': return 'bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]';
      case 'shipped': return 'bg-[#f5f3ff] text-[#6d28d9] border-[#ede9fe]';
      case 'completed': return 'bg-[#f0fdf4] text-[#15803d] border-[#dcfce7]';
      case 'cancelled': return 'bg-[#fef2f2] text-[#b91c1c] border-[#fee2e2]';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
     switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang chuẩn bị hàng';
      case 'shipped': return 'Đang vận chuyển';
      case 'completed': return 'Giao hàng thành công';
      case 'cancelled': return 'Đã hủy đơn';
      default: return status;
    }
  };

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

        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-[#c84b31] transition-colors">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#1a1c1c]/5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-[#c84b31]/20 outline-none shadow-sm"
            placeholder="Tìm theo Mã đơn, Tên khách hoặc Sản phẩm..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </header>

      <div className="px-10 mb-8 overflow-x-auto">
        <div className="flex gap-8 border-b border-outline-variant/20">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((tab) => (
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

      <div className={`px-10 pb-20 space-y-4 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4 animate-pulse">auto_stories</span>
            <p className="text-sm font-medium">Đang kết nối lò nung...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
            <p className="text-sm font-medium">Chưa có đơn hàng nào trong mục này.</p>
          </div>
        ) : orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-6 flex flex-col gap-6 shadow-sm border border-[#1a1c1c]/5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-[#c84b31]/10 text-[#c84b31] rounded-full font-bold text-[10px] tracking-widest uppercase">
                  #{order.id.split('-')[0].toUpperCase()}
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
                  src={resolveImageUrl(order.orderItems?.[0]?.product?.images?.[0]?.url, productFallbackImage)}
                  alt="Order Item"
                />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c716b] mb-1 font-bold">Khách hàng</p>
                  <p className="font-bold text-on-surface">{order.buyer?.profile?.display_name || 'Khách ẩn danh'}</p>
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
                  <p className="font-bold text-xl text-[#c84b31]">{(order.subtotal + (order.shippingFee || 0)).toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <button 
                onClick={() => openDetail(order)}
                className="px-5 py-2 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors"
              >
                Chi tiết
              </button>
              {order.status.toLowerCase() === 'pending' && (
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'processing')}
                  className="px-6 py-2 bg-[#c84b31] text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                >
                  Xác nhận & Xử lý
                </button>
              )}
              {order.status.toLowerCase() === 'processing' && (
                <button 
                  onClick={() => openDetail(order)}
                  className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                >
                  Giao hàng
                </button>
              )}
              {order.status.toLowerCase() === 'completed' && (
                hasReviewedBuyer(order) ? (
                  <div className="flex items-center gap-2 rounded-lg bg-[#52652a]/10 px-4 py-2 text-sm font-bold text-[#52652a]">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Đã đánh giá người mua
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setBuyerReviewModal({
                        isOpen: true,
                        orderId: order.id,
                        buyerId: order.buyerId,
                        buyerName: order.buyer?.profile?.display_name || 'Khách ẩn danh',
                      })
                    }
                    className="px-6 py-2 bg-[#52652a] text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Đánh giá người mua
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-10 pb-10">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <OrderDetailDrawer 
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      <BuyerReviewModal
        isOpen={buyerReviewModal.isOpen}
        orderId={buyerReviewModal.orderId}
        buyerId={buyerReviewModal.buyerId}
        buyerName={buyerReviewModal.buyerName}
        onClose={() => setBuyerReviewModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={(message) => {
          toast.success(message || 'Đã gửi đánh giá người mua');
          fetchOrders(currentPage, activeTab, searchTerm, false);
        }}
      />
    </main>
  );
}
