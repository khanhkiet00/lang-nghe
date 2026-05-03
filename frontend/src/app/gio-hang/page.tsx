'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { resolveImageUrl } from '@/lib/images';
import { Navbar } from '@/components/ui/Navbar';
import {
  CART_CHANGED_EVENT,
  getCartItems,
  saveCartItems,
  type CartItem,
} from '@/lib/cart';

const productFallbackImage =
  'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=600&auto=format&fit=crop';
const CHECKOUT_SELECTION_KEY = 'langnghe_checkout_item_ids';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [voucher, setVoucher] = useState('');
  const [notice, setNotice] = useState('');
  const [itemPendingDelete, setItemPendingDelete] = useState<CartItem | null>(null);

  useEffect(() => {
    const refreshCart = () => {
      const nextItems = getCartItems();
      setItems(nextItems);
      setSelectedItemIds((current) => {
        const itemIds = nextItems.map((item) => item.id);
        const keptIds = current.filter((id) => itemIds.includes(id));
        return current.length === 0 ? itemIds : keptIds;
      });
    };
    refreshCart();
    window.addEventListener(CART_CHANGED_EVENT, refreshCart);
    window.addEventListener('storage', refreshCart);

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, refreshCart);
      window.removeEventListener('storage', refreshCart);
    };
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds],
  );
  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = items.length > 0 && selectedItemIds.length === items.length;
  const shippingFee = selectedItems.length === 0 || subtotal >= 500000 ? 0 : 30000;
  const artisanDiscount = voucher.trim().toUpperCase() === 'LANGNGHE' ? 50000 : 0;
  const appliedDiscount = selectedItems.length > 0 ? artisanDiscount : 0;
  const total = Math.max(0, subtotal + shippingFee - appliedDiscount);

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    setSelectedItemIds((current) =>
      current.filter((id) => nextItems.some((item) => item.id === id)),
    );
    saveCartItems(nextItems);
  }

  function toggleItemSelection(itemId: string) {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  }

  function toggleAllSelection() {
    setSelectedItemIds(allSelected ? [] : items.map((item) => item.id));
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    updateItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const maxQuantity = item.stock ?? 99;
        return {
          ...item,
          quantity: Math.min(Math.max(1, nextQuantity), maxQuantity),
        };
      }),
    );
  }

  function removeItem(itemId: string) {
    updateItems(items.filter((item) => item.id !== itemId));
  }

  function confirmRemoveItem() {
    if (!itemPendingDelete) return;
    removeItem(itemPendingDelete.id);
    setNotice(`Đã xóa ${itemPendingDelete.title} khỏi giỏ hàng`);
  }

  function applyVoucher() {
    if (voucher.trim().toUpperCase() === 'LANGNGHE') {
      setNotice('Đã áp dụng ưu đãi nghệ nhân');
      return;
    }
    setNotice('Mã chưa hợp lệ');
  }

  function handleCheckout() {
    if (items.length === 0) {
      setNotice('Giỏ hàng đang trống');
      return;
    }

    if (selectedItems.length === 0) {
      setNotice('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    const artisanIds = Array.from(new Set(selectedItems.map((item) => item.artisanId)));
    if (artisanIds.length > 1) {
      setNotice('Hiện mỗi đơn chỉ hỗ trợ sản phẩm từ một nghệ nhân. Vui lòng tách đơn.');
      return;
    }

    sessionStorage.setItem(
      CHECKOUT_SELECTION_KEY,
      JSON.stringify(selectedItems.map((item) => item.id)),
    );
    router.push('/thanh-toan');
  }

  return (
    <main className="min-h-screen bg-[#F9F9F7] pb-20 text-[#1A1C1C]">
      <Navbar showSearch={false} activePage="none" />

      <div className="mx-auto max-w-7xl px-6 pt-28 md:px-8">
        <header className="mb-12">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tighter md:text-5xl">
            Giỏ hàng của bạn
          </h1>
          <p className="font-medium text-[#58413C]">
            Bạn đang chọn {selectedQuantity} trong {items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm được chế tác thủ công.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <section className="space-y-8 lg:col-span-8">
            {items.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C84B31]/5">
                  <span className="material-symbols-outlined text-3xl text-[#C84B31]/50">shopping_cart</span>
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  Giỏ hàng đang trống
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-2xl bg-[#1A1C1C] px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#C84B31]"
                >
                  Tiếp tục khám phá
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-[#58413C]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAllSelection}
                      className="h-5 w-5 rounded border-[#C84B31]/30 text-[#C84B31] focus:ring-[#C84B31]/20"
                    />
                    Chọn tất cả
                  </label>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {selectedItems.length}/{items.length} dòng sản phẩm
                  </span>
                </div>

              {items.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);

                return (
                <article
                  key={item.id}
                  className={`group flex flex-col gap-6 rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(26,28,28,0.08)] md:flex-row ${
                    isSelected ? 'ring-2 ring-[#C84B31]/15' : 'opacity-75'
                  }`}
                >
                  <label className="flex cursor-pointer items-center self-start md:self-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(item.id)}
                      aria-label={`Chọn ${item.title}`}
                      className="h-5 w-5 rounded border-[#C84B31]/30 text-[#C84B31] focus:ring-[#C84B31]/20"
                    />
                  </label>
                  <Link
                    href={`/san-pham/${item.slug || item.id}`}
                    className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#EEEEEE] md:w-32"
                  >
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={resolveImageUrl(item.imageUrl, productFallbackImage)}
                      alt={item.title}
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {item.categoryName && (
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#52652A]">
                            {item.categoryName}
                          </span>
                        )}
                        <Link
                          href={`/san-pham/${item.slug || item.id}`}
                          className="text-xl font-bold transition-colors hover:text-[#C84B31]"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-[#58413C]">
                          Nghệ nhân: <span className="font-semibold">{item.artisanName}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setItemPendingDelete(item)}
                        className="text-[#58413C] transition-colors hover:text-[#BA1A1A]"
                        aria-label="Xóa khỏi giỏ hàng"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div className="flex items-center gap-4 rounded-full bg-[#F3F3F3] px-4 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-[#58413C] hover:text-[#C84B31]"
                          aria-label="Giảm số lượng"
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-[#58413C] hover:text-[#C84B31]"
                          aria-label="Tăng số lượng"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#A6331B]">
                          {formatVnd(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-xs font-bold text-zinc-400">
                            {formatVnd(item.price)} mỗi sản phẩm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                );
              })}
              </>
            )}
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-[#F3F3F3] p-8">
              <h2 className="mb-8 text-2xl font-bold tracking-tight">
                Tổng kết đơn hàng
              </h2>
              <div className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#58413C]">
                Đã chọn {selectedItems.length} dòng, {selectedQuantity} sản phẩm
              </div>
              <div className="mb-8 space-y-4">
                <div className="flex justify-between text-[#58413C]">
                  <span className="font-medium">Tạm tính</span>
                  <span>{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#58413C]">
                  <span className="font-medium">Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[#58413C]">
                  <span className="font-medium">Ưu đãi nghệ nhân</span>
                  <span className="text-[#52652A]">-{formatVnd(appliedDiscount)}</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-[#E0BFB9]/40 pt-4">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <span className="text-3xl font-extrabold tracking-tighter text-[#A6331B]">
                    {formatVnd(total)}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#58413C]">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border-0 border-b border-[#E0BFB9]/50 bg-transparent text-sm placeholder:text-[#58413C]/40 focus:border-[#A6331B] focus:ring-0"
                    placeholder="Nhập mã..."
                    type="text"
                    value={voucher}
                    onChange={(event) => setVoucher(event.target.value)}
                  />
                  <button
                    onClick={applyVoucher}
                    className="text-sm font-bold text-[#A6331B] transition-opacity hover:opacity-70"
                  >
                    ÁP DỤNG
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#C84B31] py-4 text-lg font-bold text-white shadow-xl shadow-[#A6331B]/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Thanh toán
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              {notice && (
                <p className="mt-4 text-center text-xs font-bold text-[#58413C]">
                  {notice}
                </p>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#58413C]">
                <span className="material-symbols-outlined text-sm">verified</span>
                Cam kết bảo tồn giá trị nghệ nhân 100%
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(itemPendingDelete)}
        onClose={() => setItemPendingDelete(null)}
        onConfirm={confirmRemoveItem}
        title="Xóa sản phẩm?"
        message={
          itemPendingDelete
            ? `Bạn có muốn xóa "${itemPendingDelete.title}" khỏi giỏ hàng không?`
            : ''
        }
        confirmText="Xóa"
        cancelText="Giữ lại"
        type="danger"
      />
    </main>
  );
}
