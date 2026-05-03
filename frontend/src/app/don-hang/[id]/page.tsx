'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import { Navbar } from '@/components/ui/Navbar';
import ConfirmModal from '@/components/ui/ConfirmModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#8c716b', icon: 'schedule' },
  processing: { label: 'Đang xử lý', color: '#1d4ed8', icon: 'conveyor_belt' },
  shipped: { label: 'Đang giao hàng', color: '#52652a', icon: 'local_shipping' },
  completed: { label: 'Hoàn thành', color: '#16a34a', icon: 'check_circle' },
  cancelled: { label: 'Đã hủy', color: '#dc2626', icon: 'cancel' },
};

const TIMELINE_STEPS = ['pending', 'processing', 'shipped', 'completed'];

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
      } else {
        router.push('/don-hang');
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, {
        status: 'cancelled',
        cancelReason: cancelReason.trim()
      });
      if (res.ok) {
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#c84b31] border-t-transparent"></div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIndex = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const totalAmount = order.subtotal + (order.shippingFee || 0);

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#1A1C1C]">
      <Navbar showSearch={false} />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <button 
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm font-bold text-[#58413C] hover:text-[#a6331b]"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại
            </button>
            <h1 className="text-3xl font-black tracking-tight text-[#1A1C1C] md:text-4xl">
              Chi tiết đơn hàng <span className="text-[#a6331b]">#{order.id.split('-')[0].toUpperCase()}</span>
            </h1>
            <p className="mt-2 font-medium text-[#58413C]">
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {order.status === 'pending' && (
              <button 
                onClick={() => setCancelModalOpen(true)}
                className="rounded-xl border-2 border-red-100 bg-white px-6 py-3 font-bold text-red-600 transition-all hover:bg-red-50"
              >
                Hủy đơn hàng
              </button>
            )}
            <Link 
              href="/"
              className="rounded-xl bg-[#a6331b] px-8 py-3 font-bold text-white shadow-lg transition-all hover:translate-y-[-2px] hover:opacity-90"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Status Timeline Section */}
        {!isCancelled && (
          <div className="mb-12 rounded-3xl bg-white p-8 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)] md:p-12">
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:gap-0">
              {/* Timeline Line (Desktop) */}
              <div className="absolute left-0 top-1/2 hidden h-1 w-full -translate-y-1/2 bg-[#f3f3f3] md:block">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStatusIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                  className="h-full bg-[#52652a]"
                />
              </div>

              {TIMELINE_STEPS.map((step, idx) => {
                const isActive = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const config = STATUS_CONFIG[step];

                return (
                  <div key={step} className="relative z-10 flex flex-row items-center gap-4 md:flex-col md:gap-4">
                    <div 
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-4 transition-all duration-500 md:h-16 md:w-16 ${
                        isActive 
                          ? 'border-[#52652a] bg-[#d4eca2] text-[#52652a]' 
                          : 'border-[#f3f3f3] bg-white text-zinc-300'
                      } ${isCurrent ? 'scale-110 shadow-lg ring-4 ring-[#d4eca2]/50' : ''}`}
                    >
                      <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                        {config.icon}
                      </span>
                    </div>
                    <div className="text-left md:text-center">
                      <p className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-[#1A1C1C]' : 'text-zinc-400'}`}>
                        {config.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] font-bold text-[#52652a] opacity-80">Đang ở bước này</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mb-12 rounded-3xl bg-red-50 p-8 border-2 border-red-100 flex items-center gap-6">
            <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-full bg-red-100 text-red-600">
               <span className="material-symbols-outlined text-4xl">cancel</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700">Đơn hàng đã bị hủy</h3>
              <p className="text-red-600 font-medium">Lý do: {order.cancelReason || 'Không có lý do cụ thể'}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content (Items) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <section className="rounded-3xl bg-white p-8 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)]">
              <h3 className="mb-8 text-xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-[#a6331b]">shopping_bag</span>
                Sản phẩm đã chọn
              </h3>
              <div className="divide-y divide-zinc-100">
                {order.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex gap-6 py-6 first:pt-0 last:pb-0 group">
                    <Link 
                      href={`/san-pham/${item.product?.slug || item.product?.id}`}
                      className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                    >
                      <img 
                        src={resolveImageUrl(item.product?.images?.[0]?.url)} 
                        alt={item.product?.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link 
                          href={`/san-pham/${item.product?.slug || item.product?.id}`}
                          className="text-lg font-bold hover:text-[#a6331b] transition-colors"
                        >
                          {item.product?.title}
                        </Link>
                        <p className="text-sm font-medium text-[#58413C]">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#a6331b]">{formatVnd(item.price)}</span>
                        <span className="text-sm text-zinc-400 font-medium">Tổng: {formatVnd(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Info */}
            <section className="rounded-3xl bg-white p-8 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)]">
              <h3 className="mb-8 text-xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-[#a6331b]">location_on</span>
                Thông tin giao hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest font-black text-zinc-400">Người nhận</p>
                  <div>
                    <p className="text-lg font-bold">{order.shippingAddress?.name}</p>
                    <p className="font-medium text-[#58413C]">{order.shippingAddress?.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest font-black text-zinc-400">Địa chỉ</p>
                  <p className="font-medium leading-relaxed text-[#58413C]">
                    {order.shippingAddress?.address}<br />
                    {order.shippingAddress?.ward}, {order.shippingAddress?.district}<br />
                    {order.shippingAddress?.province}
                  </p>
                </div>
              </div>

              {order.trackingCode && (
                <div className="mt-8 rounded-2xl bg-[#52652a]/5 p-6 border border-[#52652a]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#52652a]">Mã vận đơn</p>
                      <p className="mt-1 text-xl font-black text-[#52652a]">{order.trackingCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-[#52652a]">Đơn vị vận chuyển</p>
                      <p className="mt-1 font-bold text-[#52652a]">{order.shippingProvider || 'Giao Hàng Nhanh'}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Content (Summary) */}
          <div className="space-y-8">
            <section className="sticky top-[120px] rounded-3xl bg-white p-8 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)]">
              <h3 className="mb-8 text-xl font-bold">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 border-b border-zinc-100 pb-6">
                <div className="flex justify-between font-medium text-[#58413C]">
                  <span>Tạm tính</span>
                  <span>{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-[#58413C]">
                  <span>Phí vận chuyển</span>
                  <span>{formatVnd(order.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between font-medium text-[#58413C]">
                  <span>Giảm giá</span>
                  <span className="text-[#52652a]">-0₫</span>
                </div>
              </div>

              <div className="py-6">
                <div className="mb-6 flex items-end justify-between">
                  <span className="text-sm font-black uppercase tracking-widest text-zinc-400">Tổng cộng</span>
                  <span className="text-3xl font-black text-[#a6331b]">{formatVnd(totalAmount)}</span>
                </div>
                
                <div className="rounded-2xl bg-[#fdfcfb] p-4 border border-[#f3f3f3]">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Thanh toán</p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a6331b]">
                      {order.paymentMethod === 'cod' ? 'payments' : 'account_balance'}
                    </span>
                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                  </p>
                  <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-[#52652a]' : 'text-orange-600'}`}>
                    Trạng thái: {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>

              {order.noteFromBuyer && (
                <div className="mt-4 rounded-2xl bg-[#f2f4f2]/50 p-4 border border-dashed border-[#e8e8e8]">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Ghi chú của bạn</p>
                  <p className="text-sm italic text-[#58413C]">&ldquo;{order.noteFromBuyer}&rdquo;</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelReason('');
        }}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn hàng?"
        message={
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.</p>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Lý do hủy đơn</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-xl border-2 border-[#f3f3f3] p-4 text-sm focus:border-[#a6331b] outline-none"
                placeholder="Vui lòng nhập lý do hủy..."
                rows={3}
              />
            </div>
          </div>
        }
        confirmText={isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
        type="danger"
      />
    </div>
  );
}
