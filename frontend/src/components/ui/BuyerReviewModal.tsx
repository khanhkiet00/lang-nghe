'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface BuyerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  orderId: string;
  buyerId: string;
  buyerName: string;
}

export default function BuyerReviewModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  buyerId,
  buyerName,
}: BuyerReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        reviewee_id: buyerId,
        order_id: orderId,
        rating_quality: rating,
        rating_accuracy: rating,
        rating_shipping: rating,
        rating_communication: rating,
        rating_payment: rating,
        comment,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          onSuccess(data?.message || 'Bạn đã đánh giá người mua cho đơn này rồi');
          onClose();
          return;
        }
        throw new Error(data?.message || 'Không thể gửi đánh giá người mua');
      }

      onSuccess('Đã gửi đánh giá người mua');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitting ? undefined : onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#1A1C1C]">Đánh giá người mua</h2>
              <p className="mt-1 text-sm font-medium text-zinc-500">Khách hàng: {buyerName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-zinc-50 p-8">
              <span className="text-base font-black text-zinc-700">Trải nghiệm làm việc với người mua</span>
              <span className="text-center text-xs font-semibold text-zinc-400">
                Ví dụ: phản hồi, phối hợp nhận hàng, thanh toán và thái độ giao tiếp.
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`material-symbols-outlined text-[40px] transition-all hover:scale-110 ${
                      rating >= star ? 'text-yellow-400' : 'text-zinc-300'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Nhận xét về người mua (Không bắt buộc)
              </label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Chia sẻ ngắn gọn về trải nghiệm xử lý đơn hàng với khách..."
                className="min-h-[120px] w-full rounded-2xl border-2 border-zinc-200 bg-white p-4 text-sm font-medium transition-colors focus:border-[#a6331b] focus:outline-none focus:ring-4 focus:ring-[#a6331b]/10"
              />
            </div>

            <div className="flex gap-3 border-t border-zinc-100 pt-4">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-zinc-100 py-4 font-bold text-zinc-600 transition-all hover:bg-zinc-200"
              >
                Trở lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] rounded-xl bg-[#a6331b] py-4 font-bold text-white shadow-lg shadow-[#a6331b]/20 transition-all hover:bg-orange-800 disabled:opacity-70"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
