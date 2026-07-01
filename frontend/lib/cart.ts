export type CheckoutCartItem = {
  productId: string;
  name: string;
  productCode?: string;
  brand?: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  mainImage?: string;
  specifications?: string;
};

const storageKey = "computer-store-checkout-cart";
const buyNowStorageKey = "computer-store-buy-now-cart";

export function readCheckoutCart(): CheckoutCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckoutCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCheckoutCart(items: CheckoutCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export function addCheckoutItem(item: CheckoutCartItem) {
  const current = readCheckoutCart();
  const existing = current.find((entry) => entry.productId === item.productId);

  let next: CheckoutCartItem[];
  if (existing) {
    next = current.map((entry) =>
      entry.productId === item.productId
        ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, item.stockQuantity || entry.stockQuantity) }
        : entry,
    );
  } else {
    next = [...current, item];
  }

  saveCheckoutCart(next);
  return next;
}

export function clearCheckoutCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}

// Buy Now Cart Functions (using sessionStorage - temporary)
export function readBuyNowCart(): CheckoutCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(buyNowStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckoutCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuyNowCart(items: CheckoutCartItem[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(buyNowStorageKey, JSON.stringify(items));
}

export function addBuyNowItem(item: CheckoutCartItem) {
  const current = readBuyNowCart();
  // Buy Now chỉ lưu 1 sản phẩm, không cộng gộp
  const next: CheckoutCartItem[] = [{ ...item, quantity: 1 }];
  saveBuyNowCart(next);
  return next;
}

export function clearBuyNowCart() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(buyNowStorageKey);
}
