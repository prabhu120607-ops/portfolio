'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/services/dbService';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Truck,
  Heart
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Addresses mock list (can be edited/saved in settings)
  const [addressBook, setAddressBook] = useState([
    {
      id: 1,
      name: user?.name || 'Prabhu Client',
      address: '123 Fashion Street, Sector 5',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 98765 43210',
      isDefault: true
    }
  ]);

  // Settings Forms
  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');

  // Redirect guest users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user orders
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingOrders(false);
        });
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-sm font-light text-gray-500">
        Accessing account session...
      </div>
    );
  }

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Account details updated successfully! (Mock Action)');
    setNewPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full font-sans text-left flex-grow flex flex-col lg:flex-row gap-10">
      
      {/* 1. LEFT SIDEBAR: USER INFO & TAB ACTIONS */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-[#E5E4E0] p-6 h-fit text-xs tracking-wider space-y-6">
        {/* User Card */}
        <div className="pb-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-gray-300 flex items-center justify-center font-bold text-gray-700 text-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 truncate max-w-[140px]">{user.name}</h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role} member</span>
          </div>
        </div>

        {/* Action Tabs list */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-3 font-semibold transition-colors ${
              activeTab === 'profile' ? 'bg-[#F3F2EE] text-black' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <User size={14} />
            MY PROFILE
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-3 font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-[#F3F2EE] text-black' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={14} />
            ORDER TIMELINE ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-3 font-semibold transition-colors ${
              activeTab === 'settings' ? 'bg-[#F3F2EE] text-black' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Settings size={14} />
            ACCOUNT SETTINGS
          </button>
          
          <Link
            href="/wishlist"
            className="w-full flex items-center gap-3 px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Heart size={14} />
            MY WISHLIST
          </Link>

          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-3 font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={14} />
            LOGOUT SESSION
          </button>
        </div>
      </aside>

      {/* 2. RIGHT PANEL CONTENT AREA */}
      <main className="flex-grow bg-white border border-[#E5E4E0] p-8">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in text-xs font-light">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2">My Profile</h2>
              <p className="text-gray-500">Overview of your account profile parameters and default addresses.</p>
            </div>

            {/* Profile Params */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Full Registered Name</span>
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Email Address</span>
                <span className="text-sm font-semibold text-gray-800">{user.email}</span>
              </div>
            </div>

            {/* Address Book */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-wider">Address Directory</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addressBook.map((addr) => (
                  <div key={addr.id} className="border border-[#E5E4E0] p-4 relative bg-white">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5">
                        DEFAULT
                      </span>
                    )}
                    <p className="font-bold text-gray-800 mb-2">{addr.name}</p>
                    <p className="text-gray-500 leading-relaxed mb-4">
                      {addr.address}, {addr.city}, <br />
                      {addr.state} - {addr.postalCode}, {addr.country}
                    </p>
                    <p className="text-gray-500">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS HISTORY TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2">Order History</h2>
              <p className="text-xs text-gray-500 font-light">View shipment tracking and item summaries of previous purchases.</p>
            </div>

            {loadingOrders ? (
              <div className="text-center py-10 text-xs text-gray-400 font-light">Accessing invoices...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-[#E5E4E0] bg-gray-50 text-xs text-gray-500 font-light">
                No orders placed on this account session yet.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-[#E5E4E0] p-6 space-y-4 text-xs font-light text-left bg-white">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-100 gap-2">
                      <div>
                        <span className="font-bold text-gray-800">Order ID: #{ord.id}</span>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Status indicator */}
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#F3F2EE] ${
                        ord.orderStatus === 'Delivered' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                        ord.orderStatus === 'Cancelled' ? 'text-red-700 bg-red-50 border border-red-200' :
                        'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}>
                        {ord.orderStatus === 'Delivered' && <CheckCircle size={10} />}
                        {ord.orderStatus === 'Pending' && <Clock size={10} />}
                        {ord.orderStatus === 'Processing' && <Clock size={10} />}
                        {ord.orderStatus === 'Shipped' && <Truck size={10} />}
                        {ord.orderStatus}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-gray-800">{item.productName}</p>
                            <p className="text-[9px] text-gray-400 uppercase mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Calculations */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                      <div className="text-gray-400 font-light leading-relaxed">
                        Shipping: {ord.shippingMethod} | Payment: {ord.paymentMethod}
                      </div>
                      <div>
                        Total Invoiced: <span className="font-bold text-sm text-gray-900">₹{ord.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in max-w-md text-left">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2">Account Settings</h2>
              <p className="text-xs text-gray-500 font-light">Manage your password hashes and profile name preferences.</p>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Full Profile Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Update Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
