'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/services/dbService';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Trash2, 
  Plus, 
  Minus,
  Sparkles,
  ChevronRight,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartItems, removeItem, updateQuantity, subtotal, total, coupon, removeCoupon } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  // Navigation Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close drawers when navigating
  useEffect(() => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [pathname, searchParams]);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('nova_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Close account menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Debouncing & Fetching
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Save recent
    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('nova_recent_searches', JSON.stringify(updated));

    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
  };

  const handleRecentClick = (q: string) => {
    setSearchQuery(q);
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E4E0] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-[#1A1A1A] hover:opacity-75 transition-opacity"
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Link href="/" className="font-serif text-3xl font-bold tracking-widest text-[#1A1A1A]">
              NOVA
            </Link>
          </div>

          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-[#2C2A29]">
            <Link href="/shop?category=women" className="hover:text-black transition-colors py-2 border-b border-transparent hover:border-black">Women</Link>
            <Link href="/shop?category=men" className="hover:text-black transition-colors py-2 border-b border-transparent hover:border-black">Men</Link>
            <Link href="/shop?category=accessories" className="hover:text-black transition-colors py-2 border-b border-transparent hover:border-black">Accessories</Link>
            <Link href="/shop?sort=newest" className="hover:text-black transition-colors py-2 border-b border-transparent hover:border-black">New Arrivals</Link>
            <Link href="/shop?category=all&sort=price-low-high" className="hover:text-red-700 transition-colors py-2 border-b border-transparent hover:border-red-700">Sale</Link>
          </nav>

          {/* Icons Toolbar */}
          <div className="flex items-center space-x-6 text-[#1A1A1A]">
            
            {/* Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="hover:opacity-70 transition-opacity"
              aria-label="Search items"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Account Icon Menu */}
            <div className="relative" ref={accountMenuRef}>
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="hover:opacity-70 transition-opacity flex items-center gap-1"
                aria-label="User Menu"
              >
                <User size={20} strokeWidth={1.5} />
                {isAuthenticated && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#FAF9F6] border border-[#E5E4E0] shadow-xl p-2 z-50 text-xs tracking-wider">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-[#E5E4E0] mb-1">
                        <p className="font-semibold text-gray-500">SIGNED IN AS</p>
                        <p className="font-bold text-[#1A1A1A] truncate">{user?.name}</p>
                        <p className="text-gray-400 text-[10px] truncate">{user?.email}</p>
                      </div>
                      
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-2 px-3 py-2 text-[#1A1A1A] hover:bg-gray-100 transition-colors font-semibold"
                        >
                          <LayoutDashboard size={14} />
                          ADMIN PORTAL
                        </Link>
                      )}
                      
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User size={14} />
                        MY ACCOUNT
                      </Link>

                      <button 
                        onClick={() => { logout(); setIsAccountMenuOpen(false); router.push('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={14} />
                        LOGOUT
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      <p className="text-[10px] text-gray-400 font-light text-center leading-relaxed">
                        Access orders, wishlists, and personalized styling services.
                      </p>
                      <Link 
                        href="/auth" 
                        className="block w-full bg-[#1A1A1A] text-white hover:bg-black py-2.5 text-center font-bold uppercase transition-colors"
                      >
                        Sign In / Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link 
              href="/wishlist" 
              className="relative hover:opacity-70 transition-opacity" 
              aria-label="Wishlist items"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A1A1A] text-[#FAF9F6] text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart Toggle */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Open shopping bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A1A1A] text-[#FAF9F6] text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 1. SLIDE-OUT CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E5E4E0] flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                  SHOPPING BAG ({totalCartCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-[#1A1A1A] hover:opacity-75">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                    <ShoppingBag size={48} className="text-gray-300 stroke-[1.2]" />
                    <p className="text-sm font-light text-gray-500">Your shopping bag is empty.</p>
                    <Link 
                      href="/shop" 
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#1A1A1A] text-white hover:bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Shop Selections
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-[#E5E4E0]/60">
                      <div className="w-20 h-24 bg-gray-100 overflow-hidden relative flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                            <Link href={`/product/${item.productId}`} onClick={() => setIsCartOpen(false)} className="hover:underline truncate max-w-[180px]">
                              {item.productName}
                            </Link>
                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 tracking-wider uppercase mt-1">
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>

                        <div className="flex justify-between items-center">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-[#E5E4E0] bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-400 hover:text-black transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-3 py-1 text-xs">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-400 hover:text-black transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-[#F3F2EE] border-t border-[#E5E4E0] space-y-4">
                  {coupon && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 px-3 py-2 border border-emerald-200">
                      <span>Promo applied: {coupon.code}</span>
                      <button onClick={removeCoupon} className="hover:underline font-bold text-[10px]">REMOVE</button>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-[#2C2A29]">
                    <div className="flex justify-between">
                      <span className="font-light">Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-emerald-700">
                        <span className="font-light">Discount</span>
                        <span>-₹{Math.min((subtotal * coupon.discountValue)/100, coupon.maxDiscountValue).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-light">Estimated Tax (GST 18%)</span>
                      <span className="font-semibold">₹{((subtotal - (coupon ? Math.min((subtotal * coupon.discountValue)/100, coupon.maxDiscountValue) : 0)) * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E4E0] pt-3 text-sm text-[#1A1A1A] font-bold">
                      <span>Est. Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 gap-3 flex flex-col">
                    <Link 
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="block w-full text-center border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white py-3 text-xs tracking-widest font-semibold uppercase transition-all"
                    >
                      View Cart Details
                    </Link>
                    <Link 
                      href="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="block w-full text-center bg-[#1A1A1A] text-white hover:bg-black py-3 text-xs tracking-widest font-semibold uppercase transition-all"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FULLSCREEN SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF9F6] overflow-y-auto animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 py-8">
            
            {/* Search Header */}
            <div className="flex justify-between items-center mb-16">
              <span className="font-serif text-xl tracking-wider font-semibold uppercase">Search Selections</span>
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="text-[#1A1A1A] hover:opacity-75 p-2 rounded-full border border-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative mb-12">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#1A1A1A] py-4 text-2xl placeholder-gray-300 focus:outline-none font-light tracking-wide text-[#1A1A1A]"
                autoFocus
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#1A1A1A]">
                <Search size={28} strokeWidth={1.5} />
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Popular Links */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-6">Popular Collections</h4>
                <ul className="space-y-4 text-sm font-light text-gray-700">
                  <li><Link href="/shop?category=women" onClick={() => setIsSearchOpen(false)} className="hover:text-black flex items-center justify-between"><span>Women's Campaign</span><ChevronRight size={14} /></Link></li>
                  <li><Link href="/shop?category=men" onClick={() => setIsSearchOpen(false)} className="hover:text-black flex items-center justify-between"><span>Men's Tailoring</span><ChevronRight size={14} /></Link></li>
                  <li><Link href="/shop?category=accessories" onClick={() => setIsSearchOpen(false)} className="hover:text-black flex items-center justify-between"><span>Leather Accessories</span><ChevronRight size={14} /></Link></li>
                  <li><Link href="/shop?sort=newest" onClick={() => setIsSearchOpen(false)} className="hover:text-black flex items-center justify-between"><span>New Seasonal Drops</span><ChevronRight size={14} /></Link></li>
                </ul>
              </div>

              {/* Recent Searches */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-6">Recent Queries</h4>
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-gray-400 font-light">No recent searches.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleRecentClick(q)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 transition-colors font-light"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Suggestions */}
              <div className="md:col-span-1">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-6">Matching Products</h4>
                
                {isSearching ? (
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-100 animate-pulse"></div>
                    <div className="h-10 bg-gray-100 animate-pulse"></div>
                  </div>
                ) : searchQuery.length > 0 && searchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 font-light">No product results found.</p>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((p) => (
                      <Link 
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 hover:bg-gray-50 p-1.5 transition-colors"
                      >
                        <div className="w-10 h-12 bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-[#1A1A1A] truncate max-w-[180px]">{p.name}</p>
                          <p className="text-gray-400 mt-0.5">₹{p.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-light">Enter terms (e.g., &quot;Blazer&quot;, &quot;Cashmere&quot;).</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF9F6] shadow-xl flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E4E0] flex justify-between items-center">
              <span className="font-serif text-lg tracking-widest font-bold">NOVA</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] p-1.5 rounded-full border border-gray-200">
                <X size={18} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              <div className="space-y-4 flex flex-col font-serif text-xl tracking-wider text-[#1A1A1A]">
                <Link href="/shop?category=women" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">Women's Campaign</Link>
                <Link href="/shop?category=men" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">Men's Wardrobe</Link>
                <Link href="/shop?category=accessories" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">Fine Accessories</Link>
                <Link href="/shop?sort=newest" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">New Collections</Link>
                <Link href="/shop?category=all&sort=price-low-high" onClick={() => setIsMobileMenuOpen(false)} className="text-red-700 hover:opacity-70 transition-opacity">Sale Archives</Link>
              </div>

              <div className="border-t border-[#E5E4E0]/80 pt-6 space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Account Access</h4>
                {isAuthenticated ? (
                  <div className="space-y-3 text-xs tracking-wider">
                    {isAdmin && (
                      <Link href="/admin" className="block text-emerald-700 font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                        ADMIN PORTAL
                      </Link>
                    )}
                    <Link href="/dashboard" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                      My Profile & Dashboard
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); router.push('/'); }}
                      className="text-red-600 block"
                    >
                      Logout Session
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth" 
                    className="block bg-[#1A1A1A] text-white hover:bg-black text-center py-2.5 text-xs font-bold uppercase tracking-widest"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login / Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-6 bg-gray-50 border-t border-[#E5E4E0] text-[10px] text-gray-400 text-center font-light leading-relaxed">
              Global shipping. Free returns on all products within 14 days. Secure SSL checkout architecture.
            </div>

          </div>
        </div>
      )}
    </>
  );
}
