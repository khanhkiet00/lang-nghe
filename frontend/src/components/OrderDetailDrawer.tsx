'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  buyer: { profile: { display_name: string; avatar_url?: string } };
  status: string;
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  artisanAmount: number;
  createdAt: string;
  shippingAddress: any;
  orderItems: OrderItem[];
  trackingCode?: string;
  shippingProvider?: string;
  noteFromBuyer?: string;
  cancelReason?: string;
  paymentMethod?: string;
  paymentStatus?: string;
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

  useEffect(() => {
    if (order?.trackingCode) {
      setTrackingCode(order.trackingCode);
    } else {
      setTrackingCode('');
    }
  }, [order]);

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
          { label: 'Giao cho đơn vị vận chuyển', status: 'shipped', color: 'bg-[#52652a]', needsTracking: true }
        ];
      case 'shipped':
        return [
          { label: 'Xác nhận Khách đã nhận', status: 'completed', color: 'bg-[#c84b31]' }
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
      toast.error('Vui lòng nhập mã vận đơn hoặc thông tin shipper');
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

  const formatVnd = (val: number) => val.toLocaleString('vi-VN') + '₫';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-all"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1a1c1c]/5 flex items-center justify-between bg-[#fdfcfb]">
              <div>
                <h2 className="text-xl font-black text-[#1A1C1C]">Chi tiết đơn hàng</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  #{order.id.split('-')[0].toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
              >
                <span className="material-symbols-outlined text-zinc-400">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Customer Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c84b31] text-lg">person</span>
                  <h3 className="font-bold text-[#1A1C1C] uppercase text-[10px] tracking-widest">Thông tin khách hàng</h3>
                </div>
                <div className="bg-[#f9f9f9] p-6 rounded-2xl border border-[#1a1c1c]/5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Họ tên</p>
                    <p className="font-bold text-sm text-[#1A1C1C]">{address.name || order.buyer.profile.display_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Số điện thoại</p>
                    <p className="font-bold text-sm text-[#1A1C1C]">{address.phone || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Địa chỉ nhận hàng</p>
                    <p className="font-medium text-sm text-[#58413C] leading-relaxed">
                      {address.address}<br/>
                      {address.ward || address.village}, {address.district}, {address.province || address.city}
                    </p>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c84b31] text-lg">package_2</span>
                  <h3 className="font-bold text-[#1A1C1C] uppercase text-[10px] tracking-widest">Sản phẩm ({order.orderItems.length})</h3>
                </div>
                <div className="divide-y divide-[#1a1c1c]/5 bg-white border border-[#1a1c1c]/5 rounded-2xl overflow-hidden">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 border border-black/5 flex-shrink-0">
                        <img 
                          src={resolveImageUrl(item.product?.images?.[0]?.url, productFallbackImage)}
                          className="w-full h-full object-cover"
                          alt={item.product?.title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1C1C] text-sm truncate">{item.product?.title}</p>
                        <p className="text-xs text-zinc-500 font-medium mt-1">
                          {formatVnd(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right font-bold text-sm text-[#1A1C1C]">
                        {formatVnd(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                {order.noteFromBuyer && (
                   <div className="p-4 bg-orange-50 rounded-xl border border-orange-100/50 italic text-sm text-[#8c716b]">
                      &ldquo;{order.noteFromBuyer}&rdquo;
                   </div>
                )}
              </section>

              {/* Delivery & Tracking */}
              {(order.trackingCode || order.status === 'shipped' || order.status === 'completed') && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c84b31] text-lg">local_shipping</span>
                    <h3 className="font-bold text-[#1A1C1C] uppercase text-[10px] tracking-widest">Vận chuyển</h3>
                  </div>
                  <div className="p-5 bg-[#52652a]/5 border border-[#52652a]/10 rounded-2xl">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#52652a] opacity-60">Mã vận đơn</p>
                          <p className="text-lg font-black text-[#52652a] mt-1">{order.trackingCode || 'Chưa cập nhật'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#52652a] opacity-60">Đơn vị</p>
                          <p className="font-bold text-[#52652a] mt-1">{order.shippingProvider || 'Giao hàng nhanh'}</p>
                       </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Financial Summary */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c84b31] text-lg">analytics</span>
                  <h3 className="font-bold text-[#1A1C1C] uppercase text-[10px] tracking-widest">Tóm tắt tài chính</h3>
                </div>
                <div className="bg-white border border-[#1a1c1c]/5 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between text-sm font-medium text-[#58413C]">
                    <span>Giá trị hàng hóa</span>
                    <span>{formatVnd(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-[#58413C]">
                    <span>Phí sàn (5%)</span>
                    <span className="text-red-500">-{formatVnd(order.platformFee || Math.round(order.subtotal * 0.05))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-[#58413C]">
                    <span>Phí vận chuyển (Khách trả)</span>
                    <span>{formatVnd(order.shippingFee)}</span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-zinc-200 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest text-[#1A1C1C]">Thực nhận (Dự kiến)</span>
                    <span className="text-2xl font-black text-[#52652a]">{formatVnd(order.artisanAmount || (order.subtotal - Math.round(order.subtotal * 0.05)))}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-400 font-medium italic">
                    * Lưu ý: Tiền thực nhận sẽ được cộng vào ví sau khi đơn hàng hoàn thành.
                  </div>
                </div>
              </section>

              {order.status === 'cancelled' && (
                <section className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Lý do hủy đơn</p>
                  <p className="text-sm font-bold text-red-700">{order.cancelReason || 'Không xác định'}</p>
                </section>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-[#1a1c1c]/5 bg-[#fdfcfb]">
              {showCancelInput ? (
                <div className="space-y-4">
                  <textarea
                    placeholder="Vui lòng nhập lý do hủy đơn hàng..."
                    className="w-full p-4 bg-white border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowCancelInput(false)}
                      className="flex-1 py-4 font-bold text-zinc-500 hover:text-[#1A1C1C] transition-colors"
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
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Thông tin vận chuyển</p>
                           <input
                            placeholder="Nhập Mã vận đơn hoặc Tên & SĐT Shipper..."
                            className="w-full p-4 bg-white border border-[#1a1c1c]/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#c84b31]/20 shadow-sm"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handleAction(action.status, action.isCancel, action.needsTracking)}
                        className={`w-full py-4 ${action.color} text-white rounded-xl font-bold shadow-xl shadow-black/5 hover:opacity-95 active:scale-[0.98] transition-all`}
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
