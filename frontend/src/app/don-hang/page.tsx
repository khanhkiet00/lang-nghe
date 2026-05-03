'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ReviewModal from '@/components/ui/ReviewModal';
import { addCartItem } from '@/lib/cart';
import { Navbar } from '@/components/ui/Navbar';

const TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-orange-100 text-orange-800' },
  processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Đang giao', className: 'bg-[#52652a] text-white' },
  completed: { label: 'Hoàn thành', className: 'bg-[#d4eca2] text-[#3b4d14]' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'info';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    orderId: string;
    artisanId: string;
    productName: string;
    products: Array<{ id: string; title: string }>;
  }>({ isOpen: false, orderId: '', artisanId: '', productName: '', products: [] });
  const [reviewNotice, setReviewNotice] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(activeTab, 1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]);

  const fetchOrders = async (status: string, page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      let url = `/orders/buyer?page=${page}&limit=5`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data.items || []);
        setPagination(json.data.pagination);
      } else if (res.status === 401) {
        router.push('/auth?mode=login');
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(activeTab, newPage, searchTerm);
  };

  const handleCancelOrder = (orderId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/orders/${orderId}/status`, {
            status: 'cancelled',
            cancelReason: 'Khách hàng yêu cầu hủy từ giao diện lịch sử mua hàng',
          });
          if (res.ok) {
            fetchOrders(activeTab);
          } else {
            const err = await res.json();
            alert(err.message || 'Không thể hủy đơn hàng lúc này.');
          }
        } catch (error) {
          console.error('Lỗi khi hủy đơn hàng:', error);
          alert('Đã xảy ra lỗi khi hủy đơn hàng.');
        }
      }
    });
  };

  const handleBuyAgain = (order: any) => {
    order.orderItems?.forEach((item: any) => {
      addCartItem({
        id: item.productId,
        slug: item.product.slug,
        title: item.product.title,
        price: item.price,
        imageUrl: item.product.images?.[0]?.url,
        artisanId: order.artisanId,
        artisanName: order.artisan?.artisanProfile?.fullName || 'Nghệ nhân',
        quantity: item.quantity,
      });
    });
    router.push('/gio-hang');
  };

  const showReviewNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setReviewNotice({ message, type });
    window.setTimeout(() => setReviewNotice(null), 3500);
  };

  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#1A1C1C]">
      <Navbar 
        showSearch={true}
        searchPlaceholder="Tìm mã đơn hàng hoặc tên sản phẩm..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        activePage="orders"
      />

      {reviewNotice && (
        <div
          className={`fixed left-1/2 top-24 z-[110] -translate-x-1/2 rounded-full px-6 py-4 text-sm font-bold shadow-2xl ${
            reviewNotice.type === 'success'
              ? 'bg-[#4A5D23] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {reviewNotice.message}
        </div>
      )}

      <div className="mx-auto min-h-screen max-w-[1000px] px-6 pb-20 pt-28">
        <header className="mb-12">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-[#1A1C1C] md:text-5xl">Đơn hàng của tôi</h1>
          <p className="font-medium text-[#58413C]">Theo dõi và quản lý các tác phẩm thủ công bạn đã chọn.</p>
        </header>

        <div className="no-scrollbar mb-10 flex items-center space-x-2 overflow-x-auto pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-full px-6 py-2 font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-[#a6331b] text-white shadow-md'
                  : 'bg-[#f3f3f3] text-[#58413C] hover:bg-[#e8e8e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#c84b31] border-t-transparent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-8 h-32 w-32 text-[#8c716b]">
                <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'wght' 200" }}>
                  inventory_2
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-[#1A1C1C]">Chưa có đơn hàng nào</h3>
              <p className="mb-8 max-w-sm text-[#58413C]">
                Bạn chưa có đơn hàng nào trong mục này. Hãy khám phá những tác phẩm độc bản từ các nghệ nhân của chúng tôi.
              </p>
              <Link
                href="/"
                className="rounded-xl bg-[#a6331b] px-10 py-4 font-bold text-white shadow-lg transition-all hover:translate-y-[-2px]"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const firstItem = order.orderItems?.[0];
              const product = firstItem?.product;
              const totalAmount = order.subtotal + (order.shippingFee || 0);
              const badge = STATUS_BADGE[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-800' };
              const hasReviewed = order.reviews?.some(
                (review: any) =>
                  review.reviewer_id === order.buyerId &&
                  review.reviewee_id === order.artisanId,
              );

              return (
                <div
                  key={order.id}
                  className="group rounded-xl bg-white p-6 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)] transition-all hover:shadow-[0_20px_40px_-12px_rgba(26,28,28,0.12)] md:p-8"
                >
                  <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <Link href={`/don-hang/${order.id}`} className="text-sm font-bold uppercase tracking-widest text-[#58413C] hover:text-[#a6331b] transition-colors">
                          #{order.id.split('-')[0].toUpperCase()}
                        </Link>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e0bfb9]"></span>
                        <span className="text-sm font-medium text-[#58413C]">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="text-left md:text-right">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#58413C]">
                          Tổng cộng
                        </span>
                        <span className="text-2xl font-extrabold text-[#a6331b]">{formatVnd(totalAmount)}</span>
                      </div>
                      <Link 
                        href={`/don-hang/${order.id}`}
                        className="text-xs font-bold uppercase tracking-widest text-[#a6331b] hover:underline flex items-center gap-1"
                      >
                        Xem chi tiết
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row">
                    <Link
                      href={product ? `/san-pham/${product.slug || product.id}` : '#'}
                      className="relative aspect-[4/5] w-full flex-shrink-0 overflow-hidden rounded-lg bg-[#eeeeee] sm:w-32"
                    >
                      {product?.images?.[0]?.url ? (
                        <img
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={resolveImageUrl(product.images[0].url)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="material-symbols-outlined text-gray-400">image</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-grow">
                      <h3 className="mb-1 text-xl font-bold text-[#1A1C1C]">{product?.title || 'Sản phẩm không tồn tại'}</h3>
                      <p className="mb-4 text-sm font-medium text-[#52652a]">
                        {order.artisan?.artisanProfile?.fullName || 'Nghệ nhân'}
                      </p>
                      
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-[#58413C]">
                              <span className="font-semibold text-zinc-600 line-clamp-1 max-w-[200px] md:max-w-[400px] inline-block align-bottom">{item.product?.title}</span>
                              <span className="mx-2">x</span> {item.quantity}
                            </span>
                            <span className="font-bold">{formatVnd(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {order.shippingFee > 0 && (
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-[#58413C]">Phí vận chuyển</span>
                          <span className="font-bold">{formatVnd(order.shippingFee)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-[#e2e2e2] pt-6">
                    {order.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => handleBuyAgain(order)}
                          className="flex-1 rounded-xl bg-[#e2e2e2] px-8 py-3 font-bold text-[#1A1C1C] transition-all hover:bg-[#e0bfb9] md:flex-none"
                        >
                          Mua lại
                        </button>
                        {hasReviewed ? (
                          <div className="flex items-center gap-2 rounded-xl bg-[#4A5D23]/10 px-5 py-3 text-sm font-bold text-[#4A5D23]">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Đã đánh giá
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReviewModal({
                              isOpen: true,
                              orderId: order.id,
                              artisanId: order.artisanId,
                              productName: product?.title || 'Sản phẩm',
                              products: (order.orderItems || [])
                                .filter((item: any) => item.product?.id)
                                .map((item: any) => ({
                                  id: item.product.id,
                                  title: item.product.title || 'Sản phẩm',
                                })),
                            })}
                            className="flex-1 rounded-xl bg-[#a6331b] px-8 py-3 font-bold text-white shadow-md transition-all hover:opacity-90 md:flex-none"
                          >
                            Đánh giá
                          </button>
                        )}
                      </>
                    )}

                    {order.status === 'shipped' && (
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e2e2e2] px-10 py-3 font-bold text-[#1A1C1C] transition-all hover:bg-[#e0bfb9] md:w-auto">
                        <span className="material-symbols-outlined text-xl">local_shipping</span>
                        Theo dõi đơn hàng
                      </button>
                    )}

                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 rounded-xl border border-[#e0bfb9] px-8 py-3 font-bold text-[#1A1C1C] transition-all hover:bg-stone-100 md:flex-none"
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {order.status === 'processing' && (
                      <div className="w-full text-[#58413C] text-sm font-medium italic">
                        Đơn hàng đang được nghệ nhân chuẩn bị...
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {!loading && orders.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-4">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm transition-all hover:bg-stone-50 disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`h-12 w-12 rounded-xl font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-orange-900 text-white shadow-lg'
                        : 'bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm transition-all hover:bg-stone-50 disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 rounded-t-[3rem] bg-[#1A1C1C] px-8 py-20 text-zinc-400">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-2xl font-bold tracking-tight text-white">Làng Nghề</p>
            <p className="mt-5 max-w-sm leading-relaxed">
              Nơi hội tụ những giá trị thủ công nguyên bản. Mỗi tạo tác là một mảnh linh hồn của văn hóa Việt Nam.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Hành trình</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-[#C84B31]">Trang chủ</Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#C84B31]">Danh bạ Nghệ nhân</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Liên hệ</p>
            <p className="mt-5 text-sm leading-loose">
              Hà Nội, Việt Nam<br />
              contact@heritagehearth.vn<br />
              (+84) 900 000 000
            </p>
          </div>
        </div>
      </footer>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <ReviewModal
        isOpen={reviewModal.isOpen}
        orderId={reviewModal.orderId}
        artisanId={reviewModal.artisanId}
        productName={reviewModal.productName}
        products={reviewModal.products}
        onClose={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={(message) => {
          fetchOrders(activeTab);
          showReviewNotice(message || 'Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm!');
        }}
      />
    </main>
  );
}
