'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '@/lib/images';

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
  buyer: { profile: { display_name: string; village: string } };
  status: string;
  subtotal: number;
  createdAt: string;
  shippingAddress: any;
  orderItems: OrderItem[];
  trackingCode?: string;
  noteFromBuyer?: string;
}

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, data?: any) => void;
}

interface Action {
  label: string;
  status: string;
  color: string;
  isCancel?: boolean;
  needsTracking?: boolean;
}

export default function OrderDetailDrawer({ order, isOpen, onClose, onUpdateStatus }: Props) {
  const [trackingCode, setTrackingCode] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  if (!order) return null;

  const address = order.shippingAddress || {};
  
  const getNextStatusActions = (): Action[] => {
    switch (order.status.toLowerCase()) {
      case 'pending':
        return [
          { label: 'Xác nhận & Xử lý', status: 'processing', color: 'bg-[#c84b31]' },
          { label: 'Hủy đơn', status: 'cancelled', color: 'bg-red-600', isCancel: true }
        ];
      case 'processing':
        return [
          { label: 'Đã hoàn tất đóng gói & Giao hàng', status: 'shipped', color: 'bg-[#52652a]', needsTracking: true }
        ];
      case 'shipped':
        return [
          { label: 'Khách đã nhận & Hoàn tất', status: 'completed', color: 'bg-[#c84b31]' }
        ];
      default:
        return [];
    }
  };

  const handleAction = (status: string, isCancel = false, needsTracking = false) => {
    if (isCancel && !showCancelInput) {
      setShowCancelInput(true);
      return;
    }
    if (isCancel && !cancelReason) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    if (needsTracking && !trackingCode) {
      toast.error('Vui lòng nhập mã vận đơn hoặc SĐT shipper');
      return;
    }

    const payload: any = { status };
    if (isCancel) payload.cancelReason = cancelReason;
    if (needsTracking) payload.trackingCode = trackingCode;

    onUpdateStatus(order.id, status, payload);
    onClose();
    setShowCancelInput(false);
    setCancelReason('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1a1c1c]/5 flex items-center justify-between bg-[#fdfcfb]">
              <div>
                <h2 className="text-xl font-black text-on-surface">Chi tiết đơn hàng</h2>
                <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">
                  #{order.id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Customer Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c84b31] text-lg">person</span>
                  <h3 className="font-bold text-on-surface uppercase text-[10px] tracking-widest">Thông tin khách hàng</h3>
                </div>
                <div className="bg-[#f9f9f9] p-6 rounded-2xl border border-[#1a1c1c]/5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase mb-1">Họ tên</p>
                    <p className="font-bold text-sm text-on-surface">{address.fullName || order.buyer.profile.display_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase mb-1">Số điện thoại</p>
                    <p className="font-bold text-sm text-on-surface">{address.phone || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase mb-1">Địa chỉ nhận hàng</p>
                    <p className="font-medium text-sm text-on-surface leading-relaxed">
                      {address.address}, {address.village}, {address.district}, {address.city}
                    </p>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c84b31] text-lg">package</span>
                  <h3 className="font-bold text-on-surface uppercase text-[10px] tracking-widest">Sản phẩm ({order.orderItems.length})</h3>
                </div>
                <div className="divide-y divide-[#1a1c1c]/5">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="py-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-black/5">
                        <img 
                          src={resolveImageUrl(item.product?.images?.[0]?.url, productFallbackImage)}
                          className="w-full h-full object-cover"
                          alt={item.product?.title}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface text-sm line-clamp-1">{item.product?.title}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-1">
                          {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right font-black text-sm text-on-surface">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
                {order.noteFromBuyer && (
                   <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 italic text-sm text-amber-800">
                      &ldquo;{order.noteFromBuyer}&rdquo;
                   </div>
                )}
              </section>

              {/* Summary */}
              <section className="pt-6 border-t border-[#1a1c1c]/5">
                <div className="flex justify-between items-center text-on-surface">
                  <span className="font-bold text-sm opacity-50 uppercase tracking-widest">Tổng tiền thanh toán</span>
                  <span className="text-3xl font-black text-[#c84b31]">{order.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-[#1a1c1c]/5 bg-[#fdfcfb]">
              {showCancelInput ? (
                <div className="space-y-4">
                  <textarea
                    placeholder="Nhập lý do hủy đơn hàng..."
                    className="w-full p-4 bg-white border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowCancelInput(false)}
                      className="flex-1 py-4 font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Quay lại
                    </button>
                    <button 
                      onClick={() => handleAction('cancelled', true)}
                      className="flex-[2] py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                    >
                      Xác nhận Hủy đơn
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {getNextStatusActions().map((action) => (
                    <div key={action.status} className="w-full space-y-4">
                      {action.needsTracking && (
                        <input
                          placeholder="Mã vận đơn / Tên & SĐT Shipper..."
                          className="w-full p-4 bg-white border border-[#1a1c1c]/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#c84b31]/10 shadow-sm"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                        />
                      )}
                      <button
                        onClick={() => handleAction(action.status, action.isCancel, action.needsTracking)}
                        className={`w-full py-4 ${action.color} text-white rounded-xl font-bold shadow-xl shadow-black/5 hover:opacity-90 active:scale-[0.98] transition-all`}
                      >
                        {action.label}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
