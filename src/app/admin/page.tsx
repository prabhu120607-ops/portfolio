'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, Product, User } from '@/services/dbService';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Sparkles,
  Percent,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  // Metrics States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Protect Admin route
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Load dashboard dataset
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoadingMetrics(true);
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products?status=all'),
          fetch('/api/auth') // simulated users fetch fallback or direct database logic
        ]);

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
        
        // Fetch users counts from mock API or defaults
        setCustomersCount(2); // Mock customer count in db.json
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  if (isLoading || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-sm font-light text-gray-500">
        Verifying administrator credentials...
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing');
  
  // Find low stock items
  const lowStockItems: { product: string; variant: string; stock: number }[] = [];
  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.stock <= 3) {
        lowStockItems.push({
          product: p.name,
          variant: `${v.color} / ${v.size}`,
          stock: v.stock
        });
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full font-sans text-left flex-grow flex flex-col lg:flex-row gap-10">
      
      {/* 1. LEFT ADMIN NAV BAR */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-[#E5E4E0] p-6 h-fit text-xs tracking-wider space-y-4">
        <div className="pb-4 border-b border-gray-100">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">ADMIN NAVIGATION</span>
          <span className="text-sm font-bold text-gray-900 mt-1 block">Nova Management</span>
        </div>
        
        <div className="space-y-1.5">
          <Link href="/admin" className="block w-full px-3 py-3 font-semibold bg-[#F3F2EE] text-black">
            ANALYTICS OVERVIEW
          </Link>
          <Link href="/admin/products" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            PRODUCT MANAGEMENT ({products.length})
          </Link>
          <Link href="/admin/orders" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            ORDER FULFILLMENT ({orders.length})
          </Link>
          <Link href="/admin/coupons" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            COUPONS & CAMPAIGNS
          </Link>
          <Link href="/admin/reviews" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            REVIEW MODERATION
          </Link>
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <Link href="/dashboard" className="block w-full text-center border border-gray-300 py-2.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-all">
              Go To Client Site
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT */}
      <main className="flex-grow space-y-10">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-gray-900 mb-2">Analytics Overview</h1>
          <p className="text-xs text-gray-500 font-light">Real-time summaries of NOVA storefront operations and fulfillment statuses.</p>
        </div>

        {loadingMetrics ? (
          <div className="text-center py-20 text-xs text-gray-400 font-light">Retrieving storefront parameters...</div>
        ) : (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Sales Revenue */}
              <div className="bg-white border border-[#E5E4E0] p-6 shadow-xs relative flex flex-col justify-between">
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Sales</span>
                  <DollarSign size={16} />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</span>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                    <TrendingUp size={10} /> +12.4% Since July
                  </p>
                </div>
              </div>

              {/* Orders count */}
              <div className="bg-white border border-[#E5E4E0] p-6 shadow-xs relative flex flex-col justify-between">
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Orders Handled</span>
                  <ShoppingBag size={16} />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">{orders.length}</span>
                  <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                    <Clock size={10} /> {pendingOrders.length} Pending Actions
                  </p>
                </div>
              </div>

              {/* Customer counts */}
              <div className="bg-white border border-[#E5E4E0] p-6 shadow-xs relative flex flex-col justify-between">
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Customers</span>
                  <Users size={16} />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">{customersCount}</span>
                  <p className="text-[9px] text-gray-400 font-light mt-1.5">
                    Verified Customer Registrations
                  </p>
                </div>
              </div>

              {/* Low stock alerts */}
              <div className="bg-white border border-[#E5E4E0] p-6 shadow-xs relative flex flex-col justify-between">
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Stock Warnings</span>
                  <AlertTriangle size={16} className={lowStockItems.length > 0 ? 'text-red-500' : ''} />
                </div>
                <div className="mt-4">
                  <span className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {lowStockItems.length}
                  </span>
                  <p className="text-[9px] text-gray-400 font-light mt-1.5">
                    Variants With Low Inventory
                  </p>
                </div>
              </div>

            </div>

            {/* Custom SVG Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Sales Curve SVG Chart */}
              <div className="bg-white border border-[#E5E4E0] p-6 text-left space-y-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">REVENUE TRENDS</span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase">Weekly Sales curve (August)</h3>
                </div>
                
                {/* SVG Graph */}
                <div className="w-full h-44 bg-gray-50 border border-gray-100 relative flex items-end">
                  <svg className="w-full h-full p-4" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#E5E4E0" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#E5E4E0" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#E5E4E0" strokeWidth="0.5" strokeDasharray="3" />
                    
                    {/* Area curve under line */}
                    <path
                      d="M 10 90 Q 90 60 170 80 T 320 20 L 390 40 L 390 90 L 10 90 Z"
                      fill="rgba(200, 162, 200, 0.15)"
                    />
                    {/* Trend Line */}
                    <path
                      d="M 10 90 Q 90 60 170 80 T 320 20 L 390 40"
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="2"
                    />
                    
                    {/* Nodes */}
                    <circle cx="10" cy="90" r="3" fill="#1A1A1A" />
                    <circle cx="90" cy="65" r="3" fill="#1A1A1A" />
                    <circle cx="170" cy="80" r="3" fill="#1A1A1A" />
                    <circle cx="250" cy="45" r="3" fill="#1A1A1A" />
                    <circle cx="320" cy="20" r="3" fill="#1A1A1A" />
                    <circle cx="390" cy="40" r="3" fill="#1A1A1A" />
                  </svg>
                  
                  {/* Labels */}
                  <div className="absolute inset-x-4 bottom-1 flex justify-between text-[8px] uppercase tracking-widest text-gray-400 font-bold">
                    <span>Wk 1</span>
                    <span>Wk 2</span>
                    <span>Wk 3</span>
                    <span>Wk 4</span>
                  </div>
                </div>
              </div>

              {/* Best Sellers distribution Chart */}
              <div className="bg-white border border-[#E5E4E0] p-6 text-left space-y-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">CATEGORIES ANALYSIS</span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase">Sales distribution by category</h3>
                </div>
                
                {/* Horizontal Bar Chart */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-600">
                      <span>Women (Coats, Blazers, Slips)</span>
                      <span>55%</span>
                    </div>
                    <div className="bg-gray-100 h-2 w-full overflow-hidden">
                      <div className="bg-[#1A1A1A] h-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-600">
                      <span>Men (Denim, Trench, Knitwear)</span>
                      <span>30%</span>
                    </div>
                    <div className="bg-gray-100 h-2 w-full overflow-hidden">
                      <div className="bg-[#1A1A1A] h-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-600">
                      <span>Accessories (Bags, Shoes)</span>
                      <span>15%</span>
                    </div>
                    <div className="bg-gray-100 h-2 w-full overflow-hidden">
                      <div className="bg-[#1A1A1A] h-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Warnings list & Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Low stock table list */}
              <div className="bg-white border border-[#E5E4E0] p-6 md:col-span-2 text-xs text-left shadow-xs space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
                  Critical Low Inventory Warnings
                </h3>

                {lowStockItems.length === 0 ? (
                  <p className="text-gray-400 font-light py-2">All variant counts are healthy.</p>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto pr-1">
                    {lowStockItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2.5 font-light text-gray-600">
                        <div>
                          <span className="font-bold text-gray-800">{item.product}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-0.5">Variant: {item.variant}</span>
                        </div>
                        <span className="text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 h-fit text-[10px]">
                          Stock: {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white border border-[#E5E4E0] p-6 text-xs text-left shadow-xs space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-gray-100 pb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2 flex flex-col font-semibold">
                  <Link href="/admin/products?action=new" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 flex justify-between items-center transition-colors">
                    <span>Create New Product</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link href="/admin/orders" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 flex justify-between items-center transition-colors">
                    <span>Process Shipments</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link href="/admin/coupons" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 flex justify-between items-center transition-colors">
                    <span>New Coupon Code</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
