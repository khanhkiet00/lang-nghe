'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '@/lib/images';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  artisanName?: string;
  categoryName?: string;
  slug: string;
  averageRating?: number;
  reviewCount?: number;
  followerCount?: number;
}

export function ProductCard({
  id,
  title,
  price,
  imageUrl,
  artisanName,
  categoryName,
  slug,
  averageRating = 0,
  reviewCount = 0,
  followerCount = 0,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  const displayImage = resolveImageUrl(
    imageUrl,
    'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=800&auto=format&fit=crop',
  );
  const ratingLabel =
    reviewCount > 0 ? averageRating.toFixed(1).replace('.0', '') : 'Mới';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-black/[0.03]"
    >
      <Link href={`/san-pham/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
          <img
            src={displayImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {categoryName && (
            <span className="absolute left-3 top-3 rounded-full bg-[#D4ECA2]/90 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold tracking-widest text-[#4A5D23] uppercase">
              {categoryName}
            </span>
          )}
        </div>

        <div className="mt-5 flex h-[190px] flex-col">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-black text-amber-500">
              {reviewCount > 0 ? `★ ${ratingLabel}` : 'Chưa có đánh giá'}
            </span>
            {reviewCount > 0 && (
              <span className="font-bold text-zinc-400">
                {reviewCount} đánh giá
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-start gap-3 min-h-[56px]">
            <h3 className="text-lg font-bold leading-tight group-hover:text-[#c84b31] transition-colors line-clamp-2 overflow-hidden">
              {title}
            </h3>
            <span className="font-extrabold text-[#c84b31] whitespace-nowrap pt-0.5">
              {formattedPrice}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4A5D23]/60 italic">
              {artisanName || 'Nghệ nhân làng nghề'}
            </p>
            {followerCount > 0 && (
              <span className="text-[10px] font-bold text-zinc-400">
                {followerCount} theo dõi
              </span>
            )}
          </div>

          <div className="mt-auto">
            <span className="block w-full rounded-2xl bg-[#1a1c1c] py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-black/5 transition-all group-hover:bg-[#c84b31]">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
