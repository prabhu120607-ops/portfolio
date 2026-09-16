'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/services/dbService';
import { 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  X,
  ChevronDown,
  ExternalLink,
  ClipboardList
} from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/auth');
    }
  }, [isAdmin, isLoading, router]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin]);

  const handleUpdateStatus = async (id: string, newStatus: Order['orderStatus']) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update in-memory arrays
        setOrders(orders.map(o => o.id === id ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        alert(`Order #${id} status updated to ${newStatus}.`);
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full font-sans text-left flex-grow flex flex-col lg:flex-row gap-10">
      
      {/* 1. LEFT ADMIN NAV BAR */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-[#E5E4E0] p-6 h-fit text-xs tracking-wider space-y-4">
        <div className="pb-4 border-b border-gray-100">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">ADMIN NAVIGATION</span>
          <span className="text-sm font-bold text-gray-900 mt-1 block">Nova Management</span>
        </div>
        
        <div className="space-y-1.5">
          <Link href="/admin" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            ANALYTICS OVERVIEW
          </Link>
          <Link href="/admin/products" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            PRODUCT MANAGEMENT ({orders.length})
          </Link>
          <Link href="/admin/orders" className="block w-full px-3 py-3 font-semibold bg-[#F3F2EE] text-black">
            ORDER FULFILLMENT ({orders.length})
          </Link>
          <Link href="/admin/coupons" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            COUPONS & CAMPAIGNS
          </Link>
          <Link href="/admin/reviews" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            REVIEW MODERATION
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-grow space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-gray-900 mb-2">Order Fulfillment</h1>
          <p className="text-xs text-gray-500 font-light">Process payments, update shipping tracking, and inspect invoice logs.</p>
        </div>

        {loadingOrders ? (
          <div className="text-center py-20 text-xs text-gray-400 font-light">Accessing invoices timeline...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-[#E5E4E0] bg-gray-50 text-xs text-gray-500 font-light">
            No customer orders registered on servers.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Orders list table (Left Column) */}
            <div className="xl:col-span-2 bg-white border border-[#E5E4E0] overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E5E4E0] text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Date Placed</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-light text-gray-600">
                  {orders.map((o) => (
                    <tr key={o.id} className={`hover:bg-gray-50/50 ${selectedOrder?.id === o.id ? 'bg-[#F3F2EE]/30' : ''}`}>
                      <td className="p-4 font-mono font-bold text-gray-900">#{o.id}</td>
                      <td className="p-4">
                        <span className="block font-semibold text-gray-800">{o.shippingAddress.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{o.contactEmail}</span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-gray-900">₹{o.total.toLocaleString()}</td>
                      
                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          o.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>

                      {/* View Button */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="text-[#1A1A1A] hover:underline font-bold uppercase text-[10px] tracking-wider"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Order Details Receipt card (Right Column) */}
            <div className="xl:col-span-1">
              {selectedOrder ? (
                <div className="bg-[#F3F2EE] border border-[#E5E4E0] p-6 text-xs text-left space-y-6 shadow-xs animate-slide-up">
                  <div className="flex justify-between items-center border-b border-[#E5E4E0] pb-4">
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900">Invoice Details</h3>
                      <span className="font-mono text-gray-400">Order ID: #{selectedOrder.id}</span>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Shipment Status Modifier */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2">Fulfillment Action:</span>
                    <div className="relative">
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                        className="w-full bg-white border border-gray-300 px-3 py-2.5 font-semibold text-gray-800 focus:outline-none focus:border-black appearance-none cursor-pointer uppercase text-[10px] tracking-wider"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>
                  </div>

                  {/* Courier Address */}
                  <div className="space-y-1.5 font-light text-gray-600">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Shipping Destination</span>
                    <p className="font-bold text-gray-800">{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                    <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>

                  {/* Items List */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">Items list ({selectedOrder.items.length})</span>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-200/50 pb-2">
                          <div>
                            <span className="font-bold text-gray-800">{item.productName}</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider block mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-[#E5E4E0] pt-4 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                        <span>-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{selectedOrder.shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (GST 18%):</span>
                      <span>₹{selectedOrder.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E4E0] pt-3 text-sm font-bold text-gray-900">
                      <span>Total Invoice:</span>
                      <span>₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="border border-dashed border-[#E5E4E0] p-12 text-center text-xs text-gray-400 font-light flex flex-col items-center justify-center h-64 bg-gray-50/50">
                  <ClipboardList size={36} className="text-gray-300 mb-4 stroke-[1.2]" />
                  <span>Select an invoice from the ledger to inspect details.</span>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
