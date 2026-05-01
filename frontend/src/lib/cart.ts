export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string | null;
  artisanId: string;
  artisanName: string;
  quantity: number;
  stock?: number;
};

const CART_KEY = 'langnghe_cart_items';
export const CART_CHANGED_EVENT = 'langnghe_cart_changed';

function notifyCartChanged() {
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notifyCartChanged();
}

export function addCartItem(item: CartItem) {
  const items = getCartItems();
  const existing = items.find((cartItem) => cartItem.id === item.id);

  if (existing) {
    const maxQuantity = existing.stock ?? item.stock ?? 99;
    existing.quantity = Math.min(existing.quantity + item.quantity, maxQuantity);
    saveCartItems(items);
    return existing.quantity;
  }

  saveCartItems([...items, item]);
  return item.quantity;
}

export function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}
