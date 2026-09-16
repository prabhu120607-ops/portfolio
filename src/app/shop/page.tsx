'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/services/dbService';
import { Filter, X, ChevronDown, Grid, SlidersHorizontal } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read initial values from URL search params
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [brand, setBrand] = useState('all');
  const [color, setColor] = useState('all');
  const [size, setSize] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('all');

  // Available Filter Options
  const categoriesList = [
    { id: 'all', name: 'All Collections' },
    { id: 'women', name: 'Women' },
    { id: 'men', name: 'Men' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const brandsList = [
    { id: 'all', name: 'All Brands' },
    { id: '1', name: 'AETHER' },
    { id: '2', name: 'SABLE' },
    { id: '3', name: 'VALE' },
    { id: '4', name: 'NOMAD' }
  ];

  const colorsList = [
    'all', 'Camel', 'Charcoal', 'Ivory', 'Black', 'Oatmeal', 'Khaki', 'Olive', 
    'Tan', 'Nero', 'Indigo', 'Emerald', 'Champagne', 'Cream', 'Sage', 'Espresso'
  ];

  const sizesList = ['all', 'XS', 'S', 'M', 'L', 'XL', '8', '9', '10'];

  // Sync state with URL search params when they change
  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setSort(searchParams.get('sort') || 'featured');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch filtered products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category !== 'all') queryParams.append('category', category);
        if (brand !== 'all') queryParams.append('brand', brand);
        if (color !== 'all') queryParams.append('color', color);
        if (size !== 'all') queryParams.append('size', size);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (rating !== 'all') queryParams.append('rating', rating);
        if (sort) queryParams.append('sort', sort);
        if (search) queryParams.append('search', search);
        
        // Append all status just in case
        queryParams.append('status', 'active');

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [category, brand, color, size, minPrice, maxPrice, rating, sort, search]);

  const handleResetFilters = () => {
    setCategory('all');
    setBrand('all');
    setColor('all');
    setSize('all');
    setMinPrice('');
    setMaxPrice('');
    setRating('all');
    setSort('featured');
    setSearch('');
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full font-sans text-left">
      
      {/* 1. BREADCRUMBS & HEADER TITLE */}
      <div className="mb-10">
        <nav className="text-xs text-gray-400 font-light flex gap-2 items-center mb-4">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Shop</span>
        </nav>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wider text-gray-900 uppercase">
          {category === 'all' ? 'All Selections' : `${category}`}
        </h1>
        {search && (
          <p className="text-xs text-gray-500 font-light mt-2">
            Showing results for &quot;<span className="font-semibold text-black">{search}</span>&quot;
          </p>
        )}
      </div>

      {/* 2. TOOLBAR: COUNT, MOBILE FILTER TOGGLE, SORTING */}
      <div className="border-y border-[#E5E4E0] py-4 mb-8 flex justify-between items-center text-xs tracking-wider">
        <span className="text-gray-500 font-light uppercase">
          {isLoading ? 'Counting...' : `${products.length} Silhouettes`}
        </span>
        
        <div className="flex items-center gap-6">
          {/* Mobile Filter Button */}
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 hover:opacity-75 font-semibold"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-light uppercase hidden sm:inline">Sort By:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent font-semibold border-none focus:outline-none appearance-none pr-6 cursor-pointer text-[#1A1A1A] uppercase text-xs"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="best-selling">Best Selling</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: SIDEBAR FILTERS + PRODUCT GRID */}
      <div className="flex gap-10">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          
          {/* Category Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Categories</h4>
            <div className="space-y-2 text-xs font-light text-gray-600">
              {categoriesList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`block hover:text-black transition-colors ${
                    category === c.id ? 'text-black font-semibold border-b border-black' : ''
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Brands</h4>
            <div className="space-y-2 text-xs font-light text-gray-600">
              {brandsList.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  className={`block hover:text-black transition-colors ${
                    brand === b.id ? 'text-black font-semibold border-b border-black' : ''
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Sizes</h4>
            <div className="flex flex-wrap gap-2">
              {sizesList.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`text-[10px] border px-3 py-1.5 transition-all uppercase ${
                    size === s 
                      ? 'border-black bg-[#1A1A1A] text-white font-bold' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Colors</h4>
            <div className="flex flex-wrap gap-2">
              {colorsList.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`text-[10px] border px-2.5 py-1.5 transition-all ${
                    color === c 
                      ? 'border-black bg-[#1A1A1A] text-white font-bold' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Price Range</h4>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 text-xs px-2 py-2 focus:outline-none focus:border-black font-light"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 text-xs px-2 py-2 focus:outline-none focus:border-black font-light"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-4">Ratings</h4>
            <div className="space-y-2 text-xs font-light text-gray-600">
              <button onClick={() => setRating('all')} className={`block ${rating === 'all' ? 'text-black font-semibold' : ''}`}>All Ratings</button>
              <button onClick={() => setRating('4.5')} className={`block ${rating === '4.5' ? 'text-black font-semibold' : ''}`}>4.5 Stars & Up</button>
              <button onClick={() => setRating('4.8')} className={`block ${rating === '4.8' ? 'text-black font-semibold' : ''}`}>4.8 Stars & Up</button>
            </div>
          </div>

          {/* Reset Action */}
          <button
            onClick={handleResetFilters}
            className="w-full text-center border border-[#1A1A1A] py-2.5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            Clear Filters
          </button>
        </aside>

        {/* PRODUCTS GRID AREA */}
        <main className="flex-grow">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-gray-200 animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
                  <div className="h-3 bg-gray-200 animate-pulse w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 space-y-6">
              <SlidersHorizontal size={48} className="mx-auto text-gray-300 stroke-[1.2]" />
              <div>
                <p className="text-base font-light text-gray-600">No silhouettes match your current criteria.</p>
                <p className="text-xs text-gray-400 font-light mt-1">Try modifying sizes, price limitations, or keywords.</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 text-xs tracking-widest font-bold uppercase transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Grid */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 animate-fade-in">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* 4. MOBILE FILTERS DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-4/5 max-w-sm bg-[#FAF9F6] shadow-xl flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E4E0] flex justify-between items-center">
              <span className="font-serif text-base tracking-widest font-semibold uppercase">Filter Selections</span>
              <button 
                onClick={() => setIsMobileFilterOpen(false)} 
                className="p-1 border border-gray-200 rounded-full hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Filters list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Category */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {categoriesList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 border transition-all ${
                        category === c.id ? 'border-black bg-[#1A1A1A] text-white font-bold' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3">Brands</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {brandsList.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBrand(b.id)}
                      className={`px-3 py-1.5 border transition-all ${
                        brand === b.id ? 'border-black bg-[#1A1A1A] text-white font-bold' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`text-[10px] border px-3 py-1.5 transition-all uppercase ${
                        size === s 
                          ? 'border-black bg-[#1A1A1A] text-white font-bold' 
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3">Price Range</h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-xs px-2 py-2 focus:outline-none focus:border-black font-light"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-xs px-2 py-2 focus:outline-none focus:border-black font-light"
                  />
                </div>
              </div>

            </div>

            {/* Drawer Actions Footer */}
            <div className="p-6 bg-gray-50 border-t border-[#E5E4E0] flex gap-3">
              <button
                onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
                className="w-1/2 text-center border border-gray-300 py-3 text-[10px] uppercase font-bold tracking-widest bg-white hover:border-black transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 text-center bg-[#1A1A1A] text-white py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-sm font-light text-gray-500">
        Loading collections...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
