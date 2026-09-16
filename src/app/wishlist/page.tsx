'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/services/dbService';
import { Trash2, ShoppingBag, Heart, AlertTriangle } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products matching wishlist IDs
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data: Product[] = await res.json();
          const filtered = data.filter(p => wishlistIds.includes(p.id));
          setWishlistProducts(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleMoveToCart = (product: Product) => {
    // Find the first variant with stock > 0
    const availableVariant = product.variants.find(v => v.stock > 0);
    if (!availableVariant) {
      alert('This product is out of stock.');
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

    // Remove from wishlist
    toggleWishlist(product.id);
    alert(`${product.name} moved to your shopping bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full font-sans text-left">
      
      <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-900 mb-12">
        My Wishlist
      </h1>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-light">Loading saved selections...</div>
      ) : wishlistProducts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 space-y-6 bg-white border border-[#E5E4E0] p-12">
          <Heart size={64} className="mx-auto text-gray-300 stroke-[1.2]" />
          <div>
            <h2 className="font-serif text-xl font-bold">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-400 font-light mt-1">Save silhouettes you admire to view or purchase them later.</p>
          </div>
          <Link 
            href="/shop" 
            className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 text-xs tracking-widest font-bold uppercase transition-colors inline-block"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        /* Wishlist Items List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div 
              key={product.id} 
              className="border border-[#E5E4E0] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative mb-4">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 bg-white p-1.5 rounded-full text-red-500 shadow-md hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block mb-1">
                  {product.brandId === '1' ? 'AETHER' : product.brandId === '2' ? 'SABLE' : product.brandId === '3' ? 'VALE' : 'NOMAD'}
                </span>
                
                <Link href={`/product/${product.id}`} className="text-sm font-light text-gray-800 hover:text-black block mb-2 truncate">
                  {product.name}
                </Link>
                
                <span className="text-xs font-bold text-gray-900 block mb-4">₹{product.price.toLocaleString()}</span>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {product.variants.some(v => v.stock > 0) ? (
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={12} />
                    Move to Bag
                  </button>
                ) : (
                  <div className="w-full bg-gray-100 text-gray-400 text-xs font-semibold uppercase py-2.5 text-center cursor-not-allowed">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
