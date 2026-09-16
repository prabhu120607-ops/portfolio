'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Check, CreditCard, Landmark, Truck, Wallet, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, discountAmount, tax, shippingCost, total, coupon, clearCart } = useCart();
  const { user } = useAuth();

  // Step Wizard: 1 = Contact, 2 = Shipping, 3 = Payment, 4 = Success
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name.split(' ')[1] || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [shippingMethod, setShippingMethod] = useState('Standard Delivery');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Credit Card mock inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Result Order details
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      processOrderCheckout();
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const processOrderCheckout = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const orderPayload = {
      userId: user?.id || null,
      contactEmail: email,
      shippingAddress: {
        name: `${firstName} ${lastName}`,
        address,
        city,
        state,
        postalCode,
        country,
        phone
      },
      billingAddress: {
        name: `${firstName} ${lastName}`,
        address,
        city,
        state,
        postalCode,
        country,
        phone
      },
      shippingMethod,
      subtotal,
      discountAmount,
      tax,
      shippingCost,
      total,
      paymentMethod,
      couponCode: coupon?.code || null,
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit order');
        setIsSubmitting(false);
        return;
      }

      setCreatedOrder(data);
      clearCart();
      setStep(4);
    } catch (err) {
      console.error(err);
      setSubmitError('A network connectivity error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="font-serif text-2xl font-bold uppercase">Empty Checkout</h2>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          You do not have any items in your checkout session.
        </p>
        <Link href="/shop" className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 text-xs tracking-widest font-bold uppercase transition-colors inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full font-sans text-left">
      
      {/* Checkout Header */}
      <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-gray-900 mb-12 text-center md:text-left">
        Secure Checkout
      </h1>

      {step === 4 ? (
        /* STEP 4: SUCCESS CONFIRMATION SCREEN */
        <div className="max-w-xl mx-auto text-center space-y-8 bg-white border border-[#E5E4E0] p-12 shadow-sm animate-slide-up">
          <CheckCircle className="mx-auto text-emerald-500 stroke-[1.2]" size={72} />
          
          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-bold text-gray-900 uppercase">Order Confirmed</h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Thank you for curating with NOVA. Your order is registered in our dashboard and processing has begun.
            </p>
          </div>

          <div className="bg-[#F3F2EE] p-4 text-xs font-semibold text-left space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-400">Order ID:</span>
              <span className="text-gray-900">#{createdOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipment Status:</span>
              <span className="text-emerald-700 uppercase font-bold">{createdOrder?.orderStatus}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-bold">
              <span>Total Paid:</span>
              <span>₹{createdOrder?.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-light leading-relaxed">
            A confirmation receipt containing delivery tracking parameters has been dispatched to <strong>{createdOrder?.contactEmail}</strong>.
          </div>

          <div className="pt-4">
            <Link 
              href="/shop" 
              className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors inline-block"
            >
              Continue Styling
            </Link>
          </div>
        </div>
      ) : (
        /* STEPS 1-3: ACTIVE CHECKOUT LAYOUT */
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: Multi-step Checkout Form */}
          <div className="flex-grow space-y-8">
            
            {/* Steps Progress Indicator */}
            <div className="flex items-center gap-4 text-xs tracking-wider uppercase border-b border-[#E5E4E0] pb-6">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black font-bold' : 'text-gray-300'}`}>
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
                <span>Contact</span>
              </div>
              <span className="text-gray-300">/</span>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black font-bold' : 'text-gray-300'}`}>
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
                <span>Shipping</span>
              </div>
              <span className="text-gray-300">/</span>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-black font-bold' : 'text-gray-300'}`}>
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
                <span>Payment</span>
              </div>
            </div>

            {/* Steps Forms Container */}
            <form onSubmit={handleNextStep} className="space-y-6">
              
              {/* STEP 1: CONTACT INFO */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-serif text-xl font-bold uppercase">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        placeholder="client@nova.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto"
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SHIPPING ADDRESS & METHOD */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-serif text-xl font-bold uppercase">Shipping Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, unit, house number"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                        required
                      />
                    </div>
                  </div>

                  {/* Delivery Courier Selection */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">Delivery Courier Method</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light">
                      <label className={`border p-4 flex justify-between items-center cursor-pointer transition-colors ${
                        shippingMethod === 'Standard Delivery' ? 'border-black bg-[#F3F2EE]' : 'border-gray-200'
                      }`}>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingMethod === 'Standard Delivery'} 
                            onChange={() => setShippingMethod('Standard Delivery')}
                            className="accent-black"
                          />
                          <div>
                            <span className="font-semibold block">Standard Delivery</span>
                            <span className="text-gray-400">Takes 4-6 business days</span>
                          </div>
                        </div>
                        <span className="font-semibold">FREE</span>
                      </label>

                      <label className={`border p-4 flex justify-between items-center cursor-pointer transition-colors ${
                        shippingMethod === 'Express Delivery' ? 'border-black bg-[#F3F2EE]' : 'border-gray-200'
                      }`}>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingMethod === 'Express Delivery'} 
                            onChange={() => setShippingMethod('Express Delivery')}
                            className="accent-black"
                          />
                          <div>
                            <span className="font-semibold block">Express Courier Air</span>
                            <span className="text-gray-400">Takes 1-2 business days</span>
                          </div>
                        </div>
                        <span className="font-semibold">₹350</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT TYPE */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-serif text-xl font-bold uppercase">Select Payment</h3>
                  
                  {/* Options */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-center">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Credit Card')}
                      className={`border p-4 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'Credit Card' ? 'border-black bg-[#F3F2EE]' : 'border-gray-200'
                      }`}
                    >
                      <CreditCard size={18} />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`border p-4 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'UPI' ? 'border-black bg-[#F3F2EE]' : 'border-gray-200'
                      }`}
                    >
                      <Wallet size={18} />
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`border p-4 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'Cash on Delivery' ? 'border-black bg-[#F3F2EE]' : 'border-gray-200'
                      }`}
                    >
                      <Landmark size={18} />
                      COD
                    </button>
                  </div>

                  {/* Card Fields if selected */}
                  {paymentMethod === 'Credit Card' && (
                    <div className="p-4 border border-gray-200 space-y-4 bg-white animate-fade-in">
                      <div className="flex items-center gap-2 text-xs text-gray-500 pb-2 border-b border-gray-100 mb-2">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Payment credentials will not be stored on servers (SSL Architecture).</span>
                      </div>
                      
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          defaultValue={`${firstName} ${lastName}`}
                          className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div className="p-4 border border-gray-200 space-y-4 bg-white animate-fade-in">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">UPI Address ID</label>
                        <input
                          type="text"
                          placeholder="username@okaxis"
                          className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Cash on Delivery' && (
                    <div className="p-4 border border-gray-200 bg-[#F3F2EE] text-xs font-light text-gray-600 leading-relaxed animate-fade-in">
                      COD fee of ₹50 may apply. Please ensure cash is available at the destination shipping address upon courier receipt.
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                      {submitError}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? 'Processing...' : 'Complete Payment & Order'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* RIGHT: Order Details list summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0 bg-[#F3F2EE] border border-[#E5E4E0] p-6 h-fit space-y-6">
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#E5E4E0] pb-4">
              Your Selections
            </h3>

            {/* List */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs leading-normal">
                  <div className="w-12 h-16 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 uppercase mt-0.5">Size: {item.size} | Color: {item.color}</p>
                    <p className="text-gray-500 mt-1">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[#E5E4E0] pt-4 space-y-2 text-xs text-gray-600 leading-normal">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%):</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E4E0] pt-3 text-sm font-bold text-gray-900">
                <span>Total:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
