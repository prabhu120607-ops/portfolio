'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/services/dbService';
import { Heart, ShoppingBag, Eye, X, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '');

  // Wishlist state check
  const wishlisted = isInWishlist(product.id);

  // Group unique colors for indicators
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Find the first variant with stock > 0
    const availableVariant = product.variants.find(v => v.stock > 0);
    if (!availableVariant) {
      alert('This product is currently out of stock.');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      color: availableVariant.color,
      size: availableVariant.size,
      variantId: availableVariant.id,
      maxStock: availableVariant.stock
    });
    alert(`${product.name} (Size: ${availableVariant.size}) added to your bag!`);
  };

  const handleModalAdd = () => {
    const variant = product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    if (!variant || variant.stock <= 0) {
      alert('Selected size and color is out of stock.');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      variantId: variant.id,
      maxStock: variant.stock
    });
    setIsQuickViewOpen(false);
    alert(`${product.name} added to your bag!`);
  };

  return (
    <>
      <div 
        className="group relative flex flex-col bg-transparent font-sans"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Product Images Frame */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden mb-4">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={hovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
            />
          </Link>

          {/* Floating Wishlist Heart */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Toggle Wishlist"
          >
            <Heart 
              size={16} 
              fill={wishlisted ? '#EF4444' : 'transparent'} 
              className={wishlisted ? 'text-red-500' : ''} 
            />
          </button>

          {/* Discount Tag */}
          {product.discountPercent > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-red-700 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
              -{product.discountPercent}%
            </span>
          )}

          {/* Hover Actions Toolbar */}
          <div className="absolute inset-x-4 bottom-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="w-full bg-[#FAF9F6]/90 hover:bg-white text-[#1A1A1A] py-3 text-[10px] tracking-widest font-semibold uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Eye size={12} />
              Quick View
            </button>
            
            {product.variants.some(v => v.stock > 0) ? (
              <button
                onClick={handleQuickAdd}
                className="w-full bg-[#1A1A1A]/95 hover:bg-black text-white py-3 text-[10px] tracking-widest font-semibold uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag size={12} />
                Quick Add
              </button>
            ) : (
              <div className="w-full bg-gray-200/90 text-gray-500 py-3 text-[10px] tracking-widest font-semibold uppercase text-center cursor-not-allowed">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Product Meta details */}
        <div className="flex flex-col text-left">
          {/* Brand */}
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
            {product.brandId === '1' ? 'AETHER' : product.brandId === '2' ? 'SABLE' : product.brandId === '3' ? 'VALE' : 'NOMAD'}
          </span>

          {/* Name */}
          <Link href={`/product/${product.id}`} className="text-sm font-light text-gray-800 hover:text-black mb-1.5 truncate">
            {product.name}
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-2 text-xs">
            {product.discountPercent > 0 ? (
              <>
                <span className="font-semibold text-red-700">₹{product.price.toLocaleString()}</span>
                <span className="text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="font-semibold text-[#1A1A1A]">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Color indicators */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {uniqueColors.map((color, idx) => (
                <span 
                  key={idx}
                  title={color}
                  className="w-2.5 h-2.5 rounded-full border border-gray-300 cursor-pointer block"
                  style={{
                    backgroundColor: 
                      color.toLowerCase() === 'camel' ? '#C19A6B' :
                      color.toLowerCase() === 'charcoal' ? '#36454F' :
                      color.toLowerCase() === 'ivory' ? '#FFFFF0' :
                      color.toLowerCase() === 'black' ? '#000000' :
                      color.toLowerCase() === 'oatmeal' ? '#EAE6DF' :
                      color.toLowerCase() === 'khaki' ? '#C3B091' :
                      color.toLowerCase() === 'tan' ? '#D2B48C' :
                      color.toLowerCase() === 'nero' ? '#1E1E1E' :
                      color.toLowerCase() === 'indigo' ? '#4B0082' :
                      color.toLowerCase() === 'emerald' ? '#50C878' :
                      color.toLowerCase() === 'champagne' ? '#F7E7CE' :
                      color.toLowerCase() === 'cream' ? '#FFFDD0' :
                      color.toLowerCase() === 'sage' ? '#BCB88A' :
                      color.toLowerCase() === 'espresso' ? '#301F15' : '#D1D5DB'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. QUICK VIEW DIALOG MODAL */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsQuickViewOpen(false)} 
          />
          
          {/* Modal Container */}
          <div className="relative bg-[#FAF9F6] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row text-left animate-slide-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-black p-1.5 rounded-full bg-white/80 border border-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left Column: Image */}
            <div className="md:w-1/2 bg-gray-100 aspect-[3/4] relative">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Column: Content info */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">
                  {product.brandId === '1' ? 'AETHER' : product.brandId === '2' ? 'SABLE' : product.brandId === '3' ? 'VALE' : 'NOMAD'}
                </span>
                
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 text-xs text-[#1A1A1A]">
                  <Star size={14} fill="#1A1A1A" />
                  <span className="font-semibold">{product.ratingsAverage}</span>
                  <span className="text-gray-400 font-light">/ 5.0</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  {product.discountPercent > 0 ? (
                    <>
                      <span className="text-lg font-bold text-red-700">₹{product.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-[#1A1A1A]">₹{product.price.toLocaleString()}</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-light mb-6">
                  {product.shortDescription || product.description}
                </p>

                {/* Color Selection */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-2">Color: {selectedColor}</span>
                  <div className="flex gap-2">
                    {uniqueColors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(color);
                          // select first available size for this color
                          const sizesForColor = product.variants.filter(v => v.color === color && v.stock > 0);
                          if (sizesForColor.length > 0) {
                            setSelectedSize(sizesForColor[0].size);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 border transition-all ${
                          selectedColor === color 
                            ? 'border-black bg-[#1A1A1A] text-white font-bold' 
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-2">Size: {selectedSize}</span>
                  <div className="flex gap-2">
                    {product.variants
                      .filter(v => v.color === selectedColor)
                      .map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedSize(v.size)}
                          disabled={v.stock <= 0}
                          className={`text-xs w-10 h-10 border transition-all flex items-center justify-center ${
                            v.stock <= 0 
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                              : selectedSize === v.size
                                ? 'border-black bg-[#1A1A1A] text-white font-bold' 
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Add to Bag CTA */}
              <div>
                <button
                  onClick={handleModalAdd}
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-xs py-3.5 tracking-widest font-semibold uppercase transition-colors"
                >
                  Add Selection to Bag
                </button>
                <Link 
                  href={`/product/${product.id}`}
                  onClick={() => setIsQuickViewOpen(false)}
                  className="block text-center text-[10px] text-gray-400 hover:text-black uppercase tracking-widest font-bold mt-4"
                >
                  View Full Product Details
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
