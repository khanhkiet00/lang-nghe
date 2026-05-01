'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CART_CHANGED_EVENT, getCartCount } from '@/lib/cart';

export function CartNavIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => setCount(getCartCount());
    refreshCount();
    window.addEventListener(CART_CHANGED_EVENT, refreshCount);
    window.addEventListener('storage', refreshCount);

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, refreshCount);
      window.removeEventListener('storage', refreshCount);
    };
  }, []);

  return (
    <Link
      href="/gio-hang"
      className="group relative text-zinc-600 transition-colors hover:text-[#C84B31]"
      aria-label="Mở giỏ hàng"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
        <path d="M3 4h2l2.5 11h10L21 7H8" />
        <circle cx="10" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C84B31] px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
