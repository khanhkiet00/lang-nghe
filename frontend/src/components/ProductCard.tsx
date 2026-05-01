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
}

export function ProductCard({
  id,
  title,
  price,
  imageUrl,
  artisanName,
  categoryName,
  slug,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  const displayImage = resolveImageUrl(
    imageUrl,
    'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=800&auto=format&fit=crop',
  );

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

        <div className="mt-5 flex flex-col h-[180px]">
          <div className="flex items-center gap-0.5 text-[11px] text-amber-500 mb-2">
            <span>★★★★★</span>
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
          </div>

          <div className="mt-auto">
            <button className="w-full py-4 rounded-2xl bg-[#1a1c1c] text-white text-xs font-black uppercase tracking-widest transition-all hover:bg-[#c84b31] shadow-xl shadow-black/5 active:scale-95">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
