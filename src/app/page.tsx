import React from 'react';
import Link from 'next/link';
import { dbService } from '@/services/dbService';
import ProductCard from '@/components/product/ProductCard';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const revalidate = 0; // Dynamic rendering

export default async function HomePage() {
  const products = dbService.getProducts().filter(p => p.status === 'active');
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);

  const testimonials = [
    {
      id: 1,
      quote: "The cashmere coat is a work of art. The stitching, material weight, and drape are comparable to heritage houses charging five times the price.",
      author: "Eleanora G.",
      location: "London"
    },
    {
      id: 2,
      quote: "NOVA has redefined my capsule wardrobe. Minimalist, sophisticated designs that hold their structure through wear. Pure design intelligence.",
      author: "Julian V.",
      location: "New York"
    },
    {
      id: 3,
      quote: "Exceptional customer service and incredibly fast delivery. The leather backpack is perfect, with raw leather seams that look stunning.",
      author: "Siddharth R.",
      location: "Mumbai"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. CAMPAIGN HERO SECTION */}
      <section className="relative h-[85vh] bg-black overflow-hidden flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600" 
            alt="Nova Campaign Editorial" 
            className="w-full h-full object-cover opacity-75 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full text-white text-left select-none animate-slide-up">
          <span className="text-xs tracking-[0.3em] font-semibold text-gray-300 block mb-4 uppercase">AUTUMN / WINTER COLLECTIVE</span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-6 leading-none">
            DEFINE YOUR <br className="hidden md:inline" />STYLE
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-light max-w-md mb-10 leading-relaxed">
            Contemporary luxury fashion designed for modern silhouettes. Crafted with precision, longevity, and editorial details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/shop?category=women" 
              className="bg-white text-black hover:bg-black hover:text-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-center border border-white transition-all duration-300"
            >
              Shop Women
            </Link>
            <Link 
              href="/shop?category=men" 
              className="bg-transparent text-white hover:bg-white hover:text-black px-8 py-4 text-xs font-bold uppercase tracking-widest text-center border border-white transition-all duration-300"
            >
              Shop Men
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="bg-[#F3F2EE] border-b border-[#E5E4E0] py-8 text-xs tracking-wider font-semibold uppercase text-gray-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Truck size={16} strokeWidth={1.5} />
            <span>Complimentary Global Shipping</span>
          </div>
          <div className="flex items-center justify-center gap-3 border-y md:border-y-0 md:border-x border-[#E5E4E0] py-4 md:py-0">
            <RefreshCw size={16} strokeWidth={1.5} />
            <span>14-Day Free Editorial Returns</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={16} strokeWidth={1.5} />
            <span>Secure Checkout Architecture</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURED EDITORIAL CATEGORIES */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">ARCHIVES</span>
            <h2 className="font-serif text-3xl font-bold tracking-wider">Curated Collections</h2>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5">
            View All Selections <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Category Women */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800" 
              alt="Women" 
              className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-6 flex flex-col justify-end text-white text-left">
              <h3 className="font-serif text-2xl font-bold mb-2">Women</h3>
              <p className="text-[10px] font-light tracking-wide uppercase text-gray-200 mb-4">Tailored wool blazers, silk slips, and coats</p>
              <Link 
                href="/shop?category=women" 
                className="self-start text-[10px] font-bold tracking-widest uppercase border-b-2 border-white pb-1 hover:border-gray-300 transition-colors"
              >
                Explore Campaign
              </Link>
            </div>
          </div>

          {/* Category Men */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800" 
              alt="Men" 
              className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-6 flex flex-col justify-end text-white text-left">
              <h3 className="font-serif text-2xl font-bold mb-2">Men</h3>
              <p className="text-[10px] font-light tracking-wide uppercase text-gray-200 mb-4">Selvedge denim, heavy knitwear, and utility</p>
              <Link 
                href="/shop?category=men" 
                className="self-start text-[10px] font-bold tracking-widest uppercase border-b-2 border-white pb-1 hover:border-gray-300 transition-colors"
              >
                Explore Wardrobe
              </Link>
            </div>
          </div>

          {/* Category Accessories */}
          <div className="group relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800" 
              alt="Accessories" 
              className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-6 flex flex-col justify-end text-white text-left">
              <h3 className="font-serif text-2xl font-bold mb-2">Accessories</h3>
              <p className="text-[10px] font-light tracking-wide uppercase text-gray-200 mb-4">Calfskin boots, minimalist packs, and accents</p>
              <Link 
                href="/shop?category=accessories" 
                className="self-start text-[10px] font-bold tracking-widest uppercase border-b-2 border-white pb-1 hover:border-gray-300 transition-colors"
              >
                Explore Accents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="py-24 border-t border-[#E5E4E0] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">SELECT DROPS</span>
              <h2 className="font-serif text-3xl font-bold tracking-wider">New Seasonal Additions</h2>
            </div>
            <Link href="/shop?sort=newest" className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5">
              Browse New Drops <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRENDING EDITORIAL BANNER */}
      <section className="relative bg-[#FAF9F6] border-y border-[#E5E4E0] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Col */}
          <div className="text-left space-y-6 lg:max-w-md">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400">THE AUTUMN EDIT</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-wider text-[#1A1A1A]">
              Timeless silhouettes designed for modern versatility.
            </h2>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              Constructed from premium cashmere, luxury silk, and heavy Japanese raw denim. Our Autumn collections represent a commitment to durable luxury and refined silhouettes that transcend standard cycles.
            </p>
            <div className="pt-4">
              <Link 
                href="/shop?sort=best-selling" 
                className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors inline-block"
              >
                Explore Collection
              </Link>
            </div>
          </div>

          {/* Image Col */}
          <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800" 
              alt="Nova Styling Portrait" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">CURATED CLASSICS</span>
              <h2 className="font-serif text-3xl font-bold tracking-wider">Store Best Sellers</h2>
            </div>
            <Link href="/shop?sort=best-selling" className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5">
              Browse Best Sellers <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. PROMOTIONAL BANNER */}
      <section className="bg-[#1A1A1A] text-[#FAF9F6] py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 space-y-6">
          <span className="text-xs tracking-[0.2em] font-semibold text-[#C8A2C8] uppercase">SEASON REFRESH ARCHIVE</span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wider">UP TO 40% OFF SELECT SILHOUETTES</h2>
          <p className="text-sm font-light text-gray-400 max-w-lg mx-auto leading-relaxed">
            Apply coupon code <span className="font-bold text-white px-1.5 py-0.5 bg-[#2C2A29] rounded-xs">SUMMER40</span> at checkout to claim up to ₹2,500 off on select premium essentials. Excludes select new drops.
          </p>
          <div className="pt-4">
            <Link 
              href="/shop?sort=price-low-high" 
              className="bg-[#FAF9F6] text-[#1A1A1A] hover:bg-gray-200 px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors inline-block"
            >
              Shop Archives
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="py-24 border-t border-[#E5E4E0] bg-[#F3F2EE]/45">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-4">REVIEWS</span>
          <h2 className="font-serif text-3xl font-bold tracking-wider mb-16">Customer Testimonials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div 
                key={t.id} 
                className="bg-white border border-[#E5E4E0] p-8 flex flex-col justify-between shadow-xs text-left"
              >
                <div className="flex gap-1 mb-4 text-[#1A1A1A]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xs">★</span>
                  ))}
                </div>
                <p className="text-sm font-light text-gray-700 leading-relaxed mb-6 italic">
                  &quot;{t.quote}&quot;
                </p>
                <div>
                  <span className="text-xs font-bold text-[#1A1A1A] block">{t.author}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
