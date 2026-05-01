'use client';

import { useState } from 'react';
import { addCartItem, type CartItem } from '@/lib/cart';

type AddToCartPanelProps = {
  item: Omit<CartItem, 'quantity'>;
};

export function AddToCartPanel({ item }: AddToCartPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const isOutOfStock = (item.stock ?? 1) <= 0;
  const maxQuantity = Math.max(1, item.stock ?? 99);

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.min(Math.max(1, nextQuantity), maxQuantity));
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      setMessage('Sản phẩm hiện đã hết hàng');
      return;
    }

    addCartItem({ ...item, quantity });
    setMessage('Đã thêm vào giỏ hàng');
    window.setTimeout(() => setMessage(''), 2200);
  }

  function handleBuyNow() {
    if (isOutOfStock) {
      setMessage('Sản phẩm hiện đã hết hàng');
      return;
    }

    addCartItem({ ...item, quantity });
    window.location.href = '/gio-hang';
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#58413c]">
          Số lượng
        </p>
        <div className="inline-flex items-center gap-5 rounded-full bg-[#F3F3F3] px-5 py-3">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isOutOfStock}
            className="text-[#58413c] transition-colors hover:text-[#C84B31]"
            aria-label="Giảm số lượng"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <span className="w-6 text-center text-sm font-black">{quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isOutOfStock}
            className="text-[#58413c] transition-colors hover:text-[#C84B31]"
            aria-label="Tăng số lượng"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="rounded-2xl bg-[#C84B31] px-8 py-5 text-lg font-bold text-white shadow-lg shadow-[#C84B31]/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="rounded-2xl bg-[#E2E2E2] px-8 py-5 text-lg font-bold text-[#1A1C1C] transition-all hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mua ngay
        </button>
      </div>

      {message && (
        <p className="text-sm font-bold text-[#52652a]">{message}</p>
      )}
    </div>
  );
}
