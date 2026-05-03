'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  orderId: string;
  artisanId: string;
  productName: string;
  products?: Array<{ id: string; title: string }>;
}

const CRITERIA = [
  { id: 'quality', label: 'Chất lượng sản phẩm' },
  { id: 'accuracy', label: 'Đúng với mô tả' },
  { id: 'shipping', label: 'Vận chuyển & Đóng gói' },
  { id: 'communication', label: 'Thái độ của nghệ nhân' },
  { id: 'payment', label: 'Sự tiện lợi khi thanh toán' },
] as const;

type CriteriaId = typeof CRITERIA[number]['id'];

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  artisanId,
  productName,
  products = [],
}: ReviewModalProps) {
  const reviewProducts = products.length > 0 ? products : [{ id: '', title: productName }];
  const [artisanRating, setArtisanRating] = useState(5);
  const [artisanComment, setArtisanComment] = useState('');
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [productComments, setProductComments] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setError('Bạn chỉ được tải lên tối đa 5 file đính kèm');
        return;
      }
      setFiles((prev) => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      let imageUrls: string[] = [];
      
      // 1. Upload files if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        formData.append('folderType', 'reviews');

        const uploadRes = await api.post('/upload', formData);

        if (!uploadRes.ok) {
          throw new Error('Lỗi khi tải lên hình ảnh/video');
        }

        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
      }

      // 2. Submit review
      const res = await api.post('/reviews', {
        reviewee_id: artisanId,
        order_id: orderId,
        rating_quality: artisanRating,
        rating_accuracy: artisanRating,
        rating_shipping: artisanRating,
        rating_communication: artisanRating,
        rating_payment: artisanRating,
        comment: artisanComment,
        product_reviews: reviewProducts
          .filter((product) => product.id)
          .map((product) => ({
            product_id: product.id,
            rating: productRatings[product.id] ?? 5,
            comment: productComments[product.id] || undefined,
            images: imageUrls.length > 0 ? imageUrls : undefined,
          })),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          onSuccess(data?.message || 'Bạn đã đánh giá đơn hàng này rồi');
          onClose();
          return;
        }
        throw new Error(data?.message || 'Không thể gửi đánh giá');
      }

      onSuccess('Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitting ? undefined : onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl no-scrollbar"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1A1C1C]">Đánh giá đơn hàng</h2>
              <p className="mt-1 text-sm font-medium text-zinc-500">Sản phẩm: {productName}</p>
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
            {/* Artisan Rating */}
            <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-zinc-50 p-8">
              <span className="text-base font-black text-zinc-700">Đánh giá nghệ nhân</span>
              <span className="text-xs font-semibold text-zinc-400">Cách tư vấn, giao tiếp, đóng gói và trải nghiệm tổng thể</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setArtisanRating(star)}
                    className={`material-symbols-outlined text-[40px] transition-all hover:scale-110 ${
                      artisanRating >= star
                        ? 'text-yellow-400'
                        : 'text-zinc-300'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Nhận xét về nghệ nhân (Không bắt buộc)
              </label>
              <textarea
                value={artisanComment}
                onChange={(e) => setArtisanComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về cách nghệ nhân phục vụ đơn hàng..."
                className="min-h-[120px] w-full rounded-2xl border-2 border-zinc-200 bg-white p-4 text-sm font-medium transition-colors focus:border-[#a6331b] focus:outline-none focus:ring-4 focus:ring-[#a6331b]/10"
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5">
              <div>
                <h3 className="text-base font-black text-zinc-800">Đánh giá sản phẩm</h3>
                <p className="mt-1 text-xs font-medium text-zinc-400">
                  Mỗi sản phẩm trong đơn sẽ nhận một đánh giá riêng.
                </p>
              </div>

              {reviewProducts.map((product) => (
                <div key={product.id || product.title} className="rounded-2xl bg-zinc-50 p-4">
                  <p className="font-bold text-[#1A1C1C]">{product.title}</p>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setProductRatings((prev) => ({
                            ...prev,
                            [product.id]: star,
                          }))
                        }
                        className={`material-symbols-outlined text-3xl transition-all hover:scale-110 ${
                          (productRatings[product.id] ?? 5) >= star
                            ? 'text-yellow-400'
                            : 'text-zinc-300'
                        }`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={productComments[product.id] || ''}
                    onChange={(event) =>
                      setProductComments((prev) => ({
                        ...prev,
                        [product.id]: event.target.value,
                      }))
                    }
                    placeholder="Nhận xét riêng về sản phẩm này..."
                    className="mt-3 min-h-[90px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium outline-none transition-colors focus:border-[#a6331b]"
                  />
                </div>
              ))}
            </div>

            {/* File Upload */}
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Thêm hình ảnh / video sản phẩm
              </label>
              <div className="flex flex-wrap gap-4">
                {files.map((file, index) => {
                  const isVideo = file.type.startsWith('video/');
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative h-24 w-24 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200 group">
                      {isVideo ? (
                        <video src={url} className="h-full w-full object-cover" />
                      ) : (
                        <img src={url} alt="preview" className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                      {isVideo && (
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                          Video
                        </div>
                      )}
                    </div>
                  );
                })}
                {files.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition-colors hover:border-[#a6331b] hover:bg-[#a6331b]/5 hover:text-[#a6331b]"
                  >
                    <span className="material-symbols-outlined mb-1">add_photo_alternate</span>
                    <span className="text-xs font-bold">Thêm</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 pt-4 border-t border-zinc-100">
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
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#a6331b] py-4 font-bold text-white shadow-lg shadow-[#a6331b]/20 transition-all hover:bg-orange-800 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
