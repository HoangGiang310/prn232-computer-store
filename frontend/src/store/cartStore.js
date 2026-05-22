import { create } from "zustand";

export const useCartStore = create((set) => ({
  cartItems: [],
  discount: 0,
  payMethod: "CASH",
  customerId: null,

  addToCart: (product, serialCode) =>
    set((state) => {
      const isSerialExist = state.cartItems.some(
        (item) => item.serialCode === serialCode,
      );
      if (isSerialExist) return state;
      return {
        cartItems: [...state.cartItems, { ...product, serialCode }],
      };
    }),

  removeFromCart: (serialCode) =>
    set((state) => ({
      cartItems: state.cartItems.filter(
        (item) => item.serialCode !== serialCode,
      ),
    })),

  setDiscount: (amount) => set({ discount: amount }),
  setPayMethod: (method) => set({ payMethod: method }),
  setCustomerId: (id) => set({ customerId: id }),
  clearCart: () =>
    set({ cartItems: [], discount: 0, payMethod: "CASH", customerId: null }),
}));
