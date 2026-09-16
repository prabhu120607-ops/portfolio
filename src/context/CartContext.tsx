'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coupon } from '@/services/dbService';

export interface CartItem {
  id: string; // Unique combination key: productId + '-' + variantId
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  variantId: string;
  maxStock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  coupon: Coupon | null;
  couponError: string | null;
  subtotal: number;
  discountAmount: number;
  tax: number;
  shippingCost: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('nova_cart_items');
    const storedCoupon = localStorage.getItem('nova_cart_coupon');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedCoupon) {
      setCoupon(JSON.parse(storedCoupon));
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('nova_cart_items', JSON.stringify(items));
  };

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const uniqueId = `${item.productId}-${item.variantId}`;
    const existingIndex = cartItems.findIndex(i => i.id === uniqueId);
    
    if (existingIndex !== -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + item.quantity;
      updated[existingIndex].quantity = Math.min(newQty, item.maxStock);
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...item, id: uniqueId }]);
    }
  };

  const removeItem = (id: string) => {
    const filtered = cartItems.filter(item => item.id !== id);
    saveCart(filtered);
  };

  const updateQuantity = (id: string, qty: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const updated = cartItems.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) };
      }
      return i;
    });
    saveCart(updated);
  };

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await fetch(`/api/coupons?code=${code}&subtotal=${subtotal}`);
      const data = await res.json();
      
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Failed to apply coupon');
        return { success: false, message: data.error || 'Failed to apply coupon' };
      }
      
      setCoupon(data.coupon);
      localStorage.setItem('nova_cart_coupon', JSON.stringify(data.coupon));
      return { success: true, message: 'Coupon applied successfully!' };
    } catch (err) {
      console.error(err);
      setCouponError('Network error validating coupon');
      return { success: false, message: 'Network error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
    localStorage.removeItem('nova_cart_coupon');
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.discountType === 'percent') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
    } else {
      discountAmount = coupon.discountValue;
    }
  }

  // Tax (GST / VAT) - 18% of discounted subtotal
  const tax = parseFloat(((subtotal - discountAmount) * 0.18).toFixed(2));

  // Shipping - Free above ₹5000, otherwise ₹150
  const shippingCost = subtotal > 0 && (subtotal - discountAmount) < 5000 ? 150 : 0;

  const total = Math.max(0, parseFloat((subtotal - discountAmount + tax + shippingCost).toFixed(2)));

  // Automatically remove coupon if subtotal falls below minimum
  useEffect(() => {
    if (coupon && subtotal < coupon.minOrderValue) {
      removeCoupon();
    }
  }, [subtotal, coupon]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        coupon,
        couponError,
        subtotal,
        discountAmount,
        tax,
        shippingCost,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
