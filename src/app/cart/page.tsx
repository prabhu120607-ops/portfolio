'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check } from 'lucide-react';

export default function CartPage() {
  const { 
    cartItems, 
    removeItem, 
    updateQuantity, 
    applyCoupon, 
    removeCoupon, 
    coupon, 
    couponError, 
    subtotal, 
    discountAmount, 
    tax, 
    shippingCost, 
    total 
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponSuccessMsg(null);
    const res = await applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponSuccessMsg(res.message);
      setCouponCodeInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full font-sans text-left">
      
      {/* Page Title */}
      <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-900 mb-12">
        Shopping Bag
      </h1>

      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 space-y-6 bg-white border border-[#E5E4E0] p-12">
          <ShoppingBag size={64} className="mx-auto text-gray-300 stroke-[1.2]" />
          <div>
            <h2 className="font-serif text-xl font-bold">Your Bag is Empty</h2>
            <p className="text-xs text-gray-400 font-light mt-1">There are currently no items added to your seasonal wardrobe.</p>
          </div>
          <Link 
            href="/shop" 
            className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 text-xs tracking-widest font-bold uppercase transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: Items List */}
          <div className="flex-grow space-y-6">
            <div className="border-b border-[#E5E4E0] pb-4 hidden md:grid grid-cols-5 text-[10px] uppercase font-bold tracking-widest text-gray-400">
              <span className="col-span-2">Product Description</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>

            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 pb-6 border-b border-[#E5E4E0]/60"
              >
                {/* Image + Info */}
                <div className="col-span-2 flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <Link href={`/product/${item.productId}`} className="text-sm font-bold text-gray-800 hover:underline truncate block max-w-[200px]">
                        {item.productName}
                      </Link>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                    
                    {/* Delete on Mobile */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 mt-2 md:hidden"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center text-xs font-semibold text-gray-800">
                  <span className="md:hidden text-[10px] uppercase font-bold tracking-widest text-gray-400 mr-2">Price:</span>
                  ₹{item.price.toLocaleString()}
                </div>

                {/* Qty Selector */}
                <div className="flex justify-center">
                  <div className="flex items-center border border-gray-300 bg-white">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-400 hover:text-black transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="px-4 text-xs font-semibold text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-gray-400 hover:text-black transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Item Total + Trash can */}
                <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                  <span className="md:hidden text-[10px] uppercase font-bold tracking-widest text-gray-400">Total:</span>
                  <div className="text-xs font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-600 transition-colors hidden md:block"
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Navigation links */}
            <div className="pt-6">
              <Link 
                href="/shop" 
                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors inline-flex items-center gap-2 border-b border-transparent hover:border-black pb-1"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="w-full lg:w-[350px] flex-shrink-0 bg-[#F3F2EE] border border-[#E5E4E0] p-6 h-fit space-y-6">
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#E5E4E0] pb-4">
              Order Summary
            </h3>

            {/* Calculations list */}
            <div className="space-y-3 text-xs text-[#2C2A29] leading-relaxed">
              <div className="flex justify-between">
                <span className="font-light">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1.5 border border-emerald-100 items-center">
                  <span className="font-light flex items-center gap-1"><Check size={12} /> {coupon.code} Applied</span>
                  <button onClick={removeCoupon} className="hover:underline font-bold text-[9px] uppercase tracking-wider">Remove</button>
                </div>
              )}

              {coupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="font-light">Promo Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-light">Estimated Shipping</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-[10px] text-gray-400 font-light">
                  Free shipping is available for orders above ₹5,000. Add ₹{(5000 - (subtotal - discountAmount)).toLocaleString()} more.
                </p>
              )}

              <div className="flex justify-between">
                <span className="font-light">Tax (GST 18%)</span>
                <span className="font-semibold">₹{tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-t border-[#E5E4E0] pt-4 text-sm font-bold text-gray-900">
                <span>Est. Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo coupon form */}
            <div className="border-t border-[#E5E4E0] pt-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">Promo Coupon</span>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SUMMER40"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black uppercase tracking-wider text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2 transition-colors"
                >
                  Apply
                </button>
              </form>
              
              {couponError && (
                <p className="text-[10px] text-red-600 font-semibold mt-2">{couponError}</p>
              )}
              {couponSuccessMsg && (
                <p className="text-[10px] text-emerald-700 font-semibold mt-2">{couponSuccessMsg}</p>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#E5E4E0]">
              <Link 
                href="/checkout"
                className="w-full bg-[#1A1A1A] hover:bg-black text-white text-center py-4 text-xs font-bold uppercase tracking-widest transition-colors block flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
