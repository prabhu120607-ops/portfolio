'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product, Review } from '@/services/dbService';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/product/ProductCard';
import { 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  RefreshCw, 
  Truck,
  Plus,
  Minus,
  AlertTriangle,
  X,
  MessageSquare
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  // Component States
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [alsoLikeProducts, setAlsoLikeProducts] = useState<Product[]>([]);
  const [completeLookProducts, setCompleteLookProducts] = useState<Product[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zoom feature state
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Modal States
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // New Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch product data and details
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          setError('Product not found.');
          setIsLoading(false);
          return;
        }
        const data: Product = await res.json();
        setProduct(data);
        
        // Set default selections
        if (data.variants && data.variants.length > 0) {
          const firstStockVariant = data.variants.find(v => v.stock > 0) || data.variants[0];
          setSelectedColor(firstStockVariant.color);
          setSelectedSize(firstStockVariant.size);
        }

        // Fetch reviews
        const revRes = await fetch(`/api/reviews?productId=${data.id}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }

        // Fetch recommendations (also like + complete look)
        const allProductsRes = await fetch('/api/products');
        if (allProductsRes.ok) {
          const allProducts: Product[] = await allProductsRes.json();
          
          // Replicate recommendation engine locally
          const alsoLike = allProducts
            .filter(p => p.categoryId === data.categoryId && p.id !== data.id)
            .slice(0, 4);
          setAlsoLikeProducts(alsoLike);

          const completeLook = data.categoryId === 'accessories'
            ? allProducts.filter(p => p.categoryId !== 'accessories').slice(0, 4)
            : allProducts.filter(p => p.categoryId === 'accessories').slice(0, 4);
          setCompleteLookProducts(completeLook);
        }

      } catch (err) {
        console.error(err);
        setError('Network error loading product details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Handle Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-sm font-light text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
        <AlertTriangle className="mx-auto text-red-500 stroke-[1.2]" size={48} />
        <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
        <p className="text-sm font-light text-gray-500">The silhouette you are looking for does not exist or has been archived.</p>
        <Link href="/shop" className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 text-xs tracking-widest font-bold uppercase transition-colors inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Find variant selected
  const activeVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizesForColor = product.variants.filter(v => v.color === selectedColor);
  const wishlisted = isInWishlist(product.id);

  const handleAddToBag = () => {
    if (!activeVariant || activeVariant.stock <= 0) {
      alert('Selected size/color combo is out of stock.');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      image: product.images[0],
      price: product.price,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variantId: activeVariant.id,
      maxStock: activeVariant.stock
    });
    alert(`${quantity}x ${product.name} (Size: ${selectedSize}) added to your bag!`);
  };

  const handleBuyNow = () => {
    if (!activeVariant || activeVariant.stock <= 0) {
      alert('Selected size/color combo is out of stock.');
      return;
    }
    
    // Clear cart and add this item
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.images[0],
      price: product.price,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      variantId: activeVariant.id,
      maxStock: activeVariant.stock
    });

    router.push('/checkout');
  };

  // Submit Review Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to submit a product review.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user?.id,
          userName: user?.name,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });

      if (res.ok) {
        const newRev = await res.json();
        setReviews([newRev, ...reviews]);
        setIsReviewFormOpen(false);
        setReviewTitle('');
        setReviewComment('');
        alert('Review submitted successfully!');
      } else {
        alert('Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full font-sans text-left">
      
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-400 font-light flex gap-2 items-center mb-8">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categoryId}`} className="hover:text-black transition-colors uppercase">{product.categoryId}</Link>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-[120px]">{product.name}</span>
      </nav>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-24">
        
        {/* LEFT COLUMN: IMAGES GALLERY & ZOOM */}
        <div className="lg:w-[55%] flex flex-col md:flex-row gap-4">
          
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-16 h-20 bg-gray-100 flex-shrink-0 border-2 overflow-hidden ${
                  activeImageIdx === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Large display image with zoom overlay */}
          <div 
            className="flex-1 bg-gray-100 aspect-[3/4] overflow-hidden relative cursor-zoom-in order-1 md:order-2 border border-gray-200"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={product.images[activeImageIdx]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {/* Zoom lens box container */}
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-[#FAF9F6] border border-gray-300"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${product.images[activeImageIdx]})`,
                backgroundSize: '200%'
              }}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: METADATA, VARIATION CONTROLS, CART CTA */}
        <div className="lg:w-[45%] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">
              {product.brandId === '1' ? 'AETHER' : product.brandId === '2' ? 'SABLE' : product.brandId === '3' ? 'VALE' : 'NOMAD'}
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-wider text-gray-900 mb-3">{product.name}</h1>
            
            {/* Review Average Rating header */}
            <div className="flex items-center gap-1.5 mb-6 text-xs">
              <div className="flex text-[#1A1A1A]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(product.ratingsAverage) ? '#1A1A1A' : 'transparent'} 
                    className={i < Math.round(product.ratingsAverage) ? 'text-black' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-800">{product.ratingsAverage}</span>
              <span className="text-gray-400">({reviews.length} Customer reviews)</span>
            </div>

            {/* Price display */}
            <div className="flex items-center gap-3 mb-8 border-b border-[#E5E4E0] pb-6">
              {product.discountPercent > 0 ? (
                <>
                  <span className="text-2xl font-bold text-red-700">₹{product.price.toLocaleString()}</span>
                  <span className="text-base text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 border border-red-200">
                    -{product.discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#1A1A1A]">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Color selection */}
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2.5">Color: {selectedColor}</span>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(c);
                      // Set first size for color
                      const variants = product.variants.filter(v => v.color === c && v.stock > 0);
                      if (variants.length > 0) {
                        setSelectedSize(variants[0].size);
                      }
                    }}
                    className={`text-xs px-4 py-2 border transition-all ${
                      selectedColor === c
                        ? 'border-black bg-[#1A1A1A] text-white font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Size: {selectedSize}</span>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2">
                {sizesForColor.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={v.stock <= 0}
                    className={`w-12 h-12 text-xs border flex items-center justify-center transition-all ${
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

            {/* Stock details */}
            <div className="mb-8 flex items-center gap-2 text-xs">
              {activeVariant ? (
                activeVariant.stock > 0 ? (
                  activeVariant.stock <= 5 ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Only {activeVariant.stock} items left in stock.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Available in stock. Ready to ship.
                    </span>
                  )
                ) : (
                  <span className="text-red-700 font-bold flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Sold out in selected color & size.
                  </span>
                )
              ) : (
                <span className="text-red-700 font-semibold">Stock unavailable.</span>
              )}
            </div>

            {/* Quantity Selector + CTAs */}
            <div className="flex gap-4 mb-8">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 bg-white px-2">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-gray-400 hover:text-black"
                  disabled={!activeVariant || activeVariant.stock <= 0}
                >
                  <Minus size={12} />
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(activeVariant?.stock || 1, prev + 1))}
                  className="p-2 text-gray-400 hover:text-black"
                  disabled={!activeVariant || activeVariant.stock <= 0 || quantity >= (activeVariant?.stock || 0)}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Add to Bag */}
              <button
                onClick={handleAddToBag}
                disabled={!activeVariant || activeVariant.stock <= 0}
                className="flex-1 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Add to Bag
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={!activeVariant || activeVariant.stock <= 0}
                className="flex-1 bg-transparent hover:bg-gray-50 text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest py-4 transition-all disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`px-4 border transition-all flex items-center justify-center ${
                  wishlisted 
                    ? 'border-red-200 bg-red-50 text-red-500' 
                    : 'border-gray-300 text-gray-400 hover:border-black hover:text-black'
                }`}
                aria-label="Wishlist Item"
              >
                <Heart size={18} fill={wishlisted ? '#EF4444' : 'transparent'} />
              </button>
            </div>
          </div>

          {/* Details Accordion info */}
          <div className="border-t border-[#E5E4E0] pt-6 space-y-4 text-xs text-gray-600 font-light leading-relaxed">
            <div>
              <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[9px] mb-1">Details & Silhouette</h4>
              <p>{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[9px] mb-1">Fabric & Details</h4>
                <p>100% Organic, double-faced premium grade weaves.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[9px] mb-1">Garment Care</h4>
                <p>Dry clean only. Hang on structured wooden hangers.</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 flex gap-4 text-gray-400">
              <span className="flex items-center gap-1.5">
                <Truck size={12} /> Global Shipping
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} /> Free 14-day Returns
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      {alsoLikeProducts.length > 0 && (
        <section className="border-t border-[#E5E4E0] py-16 mb-8">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 text-center">AI RECOMMENDATIONS</span>
          <h3 className="font-serif text-2xl font-bold tracking-wider mb-10 text-center">You May Also Like</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {alsoLikeProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {completeLookProducts.length > 0 && (
        <section className="border-t border-[#E5E4E0] py-16 mb-16">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 text-center">COMPLETE THE LOOK</span>
          <h3 className="font-serif text-2xl font-bold tracking-wider mb-10 text-center">Curated Accents</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {completeLookProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CUSTOMER REVIEWS SECTION */}
      <section className="border-t border-[#E5E4E0] pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Reviews summary */}
          <div className="lg:col-span-1 text-left space-y-6">
            <h3 className="font-serif text-2xl font-bold text-gray-900 uppercase tracking-wide">Customer Reviews</h3>
            
            <div className="flex items-center gap-4">
              <span className="text-5xl font-serif font-bold text-gray-900">{product.ratingsAverage}</span>
              <div>
                <div className="flex text-[#1A1A1A] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.round(product.ratingsAverage) ? '#1A1A1A' : 'transparent'} 
                      className={i < Math.round(product.ratingsAverage) ? 'text-black' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Store Average rating</p>
              </div>
            </div>

            {/* Distribution */}
            <div className="space-y-2 text-xs text-gray-500 font-light max-w-xs">
              <div className="flex items-center gap-3">
                <span className="w-12">5 Star</span>
                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A1A1A] h-full" style={{ width: '80%' }}></div>
                </div>
                <span className="w-8 text-right">80%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12">4 Star</span>
                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A1A1A] h-full" style={{ width: '15%' }}></div>
                </div>
                <span className="w-8 text-right">15%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12">3 Star</span>
                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A1A1A] h-full" style={{ width: '5%' }}></div>
                </div>
                <span className="w-8 text-right">5%</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="w-12">2 Star</span>
                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A1A1A] h-full" style={{ width: '0%' }}></div>
                </div>
                <span className="w-8 text-right">0%</span>
              </div>
            </div>

            {/* Submit rating trigger */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please login to write a review.');
                  router.push('/auth');
                } else {
                  setIsReviewFormOpen(true);
                }
              }}
              className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={14} />
              Write A Review
            </button>
          </div>

          {/* Review list details */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-6">Review Feed</h4>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 font-light py-6 border-b border-gray-100">
                No verified reviews listed yet. Be the first to express feedback!
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="pb-6 border-b border-gray-100 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{rev.userName}</span>
                      <span className="text-[10px] text-gray-400 font-light">• Verified Purchase</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-light">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex text-[#1A1A1A]">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < rev.rating ? '#1A1A1A' : 'transparent'} 
                        className={i < rev.rating ? 'text-black' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-xs font-bold text-gray-800">{rev.title}</p>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SIZE GUIDE MODAL POPUP */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative bg-[#FAF9F6] w-full max-w-lg shadow-2xl p-8 text-left animate-slide-up">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Size Guide & Specifications</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            {/* Content Table */}
            <div className="overflow-x-auto text-xs text-[#2C2A29]">
              <p className="font-light text-gray-500 mb-4 leading-relaxed">
                Our silhouettes are cut with varying drapes. Please consult the standard chest, waist, and hip parameters below (in inches).
              </p>
              
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-3 font-semibold uppercase tracking-wider">Size</th>
                    <th className="p-3 font-semibold uppercase tracking-wider">Chest</th>
                    <th className="p-3 font-semibold uppercase tracking-wider">Waist</th>
                    <th className="p-3 font-semibold uppercase tracking-wider">Hip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-light">
                  <tr>
                    <td className="p-3 font-semibold">XS</td>
                    <td className="p-3">32 - 34</td>
                    <td className="p-3">26 - 28</td>
                    <td className="p-3">34 - 36</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">S</td>
                    <td className="p-3">34 - 36</td>
                    <td className="p-3">28 - 30</td>
                    <td className="p-3">36 - 38</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">M</td>
                    <td className="p-3">36 - 38</td>
                    <td className="p-3">30 - 32</td>
                    <td className="p-3">38 - 40</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">L</td>
                    <td className="p-3">38 - 40</td>
                    <td className="p-3">32 - 34</td>
                    <td className="p-3">40 - 42</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">XL</td>
                    <td className="p-3">40 - 42</td>
                    <td className="p-3">34 - 36</td>
                    <td className="p-3">42 - 44</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 font-light text-gray-500 leading-relaxed text-[10px]">
                <strong>How to Measure:</strong> Chest: Wrap tape around the fullest part. Waist: Wrap around narrowest crease. Hips: Wrap around widest hip point with heels together.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REVIEW FORM SUBMISSION MODAL */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setIsReviewFormOpen(false)} />
          <div className="relative bg-[#FAF9F6] w-full max-w-md shadow-2xl p-8 text-left animate-slide-up">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Write A Product Review</h3>
              <button onClick={() => setIsReviewFormOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2">Rating Scale:</span>
                <div className="flex gap-1.5 text-gray-300">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReviewRating(val)}
                      className={`text-xl focus:outline-none transition-colors ${
                        val <= reviewRating ? 'text-[#1A1A1A]' : 'text-gray-300 hover:text-[#1A1A1A]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Fit is spectacular! Perfect cashmeres"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Feedback Description</label>
                <textarea
                  placeholder="Tell others about fit, materials, sewing, and styling details."
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-black font-light text-gray-800 resize-none leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold uppercase tracking-widest py-3 text-[10px] transition-colors"
                >
                  Publish Review
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
