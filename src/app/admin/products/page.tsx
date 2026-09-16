'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Product, ProductVariant } from '@/services/dbService';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Sparkles, 
  Info,
  ChevronLeft,
  Loader2,
  Package
} from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading } = useAuth();

  // Mode: 'list' or 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [categoryId, setCategoryId] = useState('women');
  const [brandId, setBrandId] = useState('1');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Variants setup state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newColor, setNewColor] = useState('Black');
  const [newSize, setNewSize] = useState('M');
  const [newStock, setNewStock] = useState('10');

  // AI Content Generator state
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/auth');
    }
  }, [isAdmin, isLoading, router]);

  // Load products list
  const loadProducts = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/products?status=all');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      
      // Auto open form if URL action is "new"
      if (searchParams.get('action') === 'new') {
        handleOpenCreateForm();
      }
    }
  }, [isAdmin, searchParams]);

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setName('');
    setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice('');
    setOriginalPrice('');
    setDiscountPercent('0');
    setCategoryId('women');
    setBrandId('1');
    setStatus('active');
    setDescription('');
    setShortDescription('');
    setImagesInput('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800');
    setTagsInput('premium, luxury, essential');
    setVariants([
      { id: 'v-temp-1', color: 'Black', size: 'S', stock: 10 },
      { id: 'v-temp-2', color: 'Black', size: 'M', stock: 15 },
      { id: 'v-temp-3', color: 'Black', size: 'L', stock: 8 }
    ]);
    setViewMode('form');
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice.toString());
    setDiscountPercent(product.discountPercent.toString());
    setCategoryId(product.categoryId);
    setBrandId(product.brandId);
    setStatus(product.status);
    setDescription(product.description);
    setShortDescription(product.shortDescription || '');
    setImagesInput(product.images.join(', '));
    setTagsInput(product.tags.join(', '));
    setVariants([...product.variants]);
    setViewMode('form');
  };

  // Add Variant helper
  const handleAddVariant = () => {
    if (!newColor || !newSize || !newStock) return;
    const newV: ProductVariant = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      color: newColor,
      size: newSize.toUpperCase(),
      stock: parseInt(newStock) || 0
    };
    setVariants([...variants, newV]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  // AI Content API call
  const handleGenerateAiCopy = async () => {
    if (!categoryId || !brandId || !newColor) {
      alert('Please specify Category, Brand, and at least one primary color.');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const brandName = brandId === '1' ? 'AETHER' : brandId === '2' ? 'SABLE' : brandId === '3' ? 'VALE' : 'NOMAD';
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryId,
          brand: brandName,
          color: newColor,
          keywords: aiKeywords
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setName(data.title);
        setShortDescription(data.shortDescription);
        setDescription(data.description);
        setTagsInput(data.tags.join(', '));
        alert('AI copywriting generated and filled into forms. You can edit before publishing.');
      } else {
        alert('AI Content service unavailable.');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with AI endpoint.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const images = imagesInput.split(',').map(i => i.trim()).filter(Boolean);

    const payload = {
      name,
      sku,
      price,
      originalPrice: originalPrice || price,
      discountPercent: parseInt(discountPercent) || 0,
      categoryId,
      brandId,
      status,
      description,
      shortDescription,
      tags,
      images,
      variants
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Product details successfully committed to database.');
        setViewMode('list');
        loadProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating database file.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive and delete this product silhouette?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProducts();
      } else {
        alert('Failed to delete product.');
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
          <Link href="/admin/products" className="block w-full px-3 py-3 font-semibold bg-[#F3F2EE] text-black">
            PRODUCT MANAGEMENT ({products.length})
          </Link>
          <Link href="/admin/orders" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            ORDER FULFILLMENT ({products.length})
          </Link>
          <Link href="/admin/coupons" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            COUPONS & CAMPAIGNS
          </Link>
          <Link href="/admin/reviews" className="block w-full px-3 py-3 font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            REVIEW MODERATION
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow space-y-8">
        
        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-gray-900">Products Inventory</h1>
                <p className="text-xs text-gray-500 font-light mt-1">Manage catalog entries, pricing details, and variant stock counts.</p>
              </div>
              
              <button
                onClick={handleOpenCreateForm}
                className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-xs"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {loadingList ? (
              <div className="text-center py-20 text-xs text-gray-400 font-light">Accessing products catalog...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-[#E5E4E0] bg-gray-50 text-xs text-gray-500 font-light">
                No products found. Start by creating a product catalog entry.
              </div>
            ) : (
              <div className="bg-white border border-[#E5E4E0] overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#E5E4E0] text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="p-4">Silhouette Description</th>
                      <th className="p-4">SKU / Code</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Inventory Total</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-light text-gray-600">
                    {products.map((p) => {
                      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          {/* Image + Title */}
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-12 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block">{p.name}</span>
                              <span className="text-[10px] text-gray-400 uppercase block">{p.categoryId}</span>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="p-4 font-mono uppercase">{p.sku}</td>

                          {/* Price */}
                          <td className="p-4 font-semibold text-gray-900">₹{p.price.toLocaleString()}</td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          {/* Stock */}
                          <td className="p-4">
                            <span className={`font-semibold ${totalStock === 0 ? 'text-red-600 font-bold' : totalStock <= 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                              {totalStock} items
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => handleOpenEditForm(p)} className="text-gray-400 hover:text-black transition-colors" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-300 hover:text-red-600 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CREATE / EDIT FORM VIEW */}
        {viewMode === 'form' && (
          <div className="space-y-8 animate-fade-in text-xs font-light">
            
            {/* Form Header */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('list')}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-gray-900">
                  {editingProduct ? 'Edit Silhouette' : 'New Silhouette Drop'}
                </h1>
                <p className="text-xs text-gray-500 font-light mt-1">Fill out the styling metadata, inventory variants, and catalogs below.</p>
              </div>
            </div>

            {/* AI Assistant copywriter overlay panel */}
            <div className="bg-[#F3F2EE] border border-[#E5E4E0] p-6 space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <Sparkles size={16} className="text-purple-700" />
                <span className="text-[10px] uppercase tracking-widest">AI Copywriter Generator</span>
              </div>
              <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                Generate high-end luxury styling titles, meta descriptions, long features list, and keywords matching your details automatically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Keywords (e.g. Italian wool, cashmere, storm flap, oversized dress)"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 px-3 py-2 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiCopy}
                  disabled={isGeneratingAi}
                  className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2 font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      AI Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Row 1: Name, SKU, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-mono text-gray-800 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-semibold text-gray-800"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Price, Original Price, Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Original Retail Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    placeholder="If on sale (otherwise same as price)"
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Discount Percent (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  />
                </div>
              </div>

              {/* Row 3: Category, Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Store Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-semibold text-gray-800"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Brand Label</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-semibold text-gray-800"
                  >
                    <option value="1">AETHER</option>
                    <option value="2">SABLE</option>
                    <option value="3">VALE</option>
                    <option value="4">NOMAD</option>
                  </select>
                </div>
              </div>

              {/* Form Description & Content */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Short Punchy Tagline</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Full Description & Details</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800 leading-relaxed resize-none"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Images & Tags input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Campaign Images (Comma separated URLs)</label>
                  <input
                    type="text"
                    placeholder="https://image1.jpg, https://image2.jpg"
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Product Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="winter, coat, cashmere, luxury"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  />
                </div>
              </div>

              {/* DYNAMIC VARIANT MANAGEMENT */}
              <div className="border-t border-[#E5E4E0] pt-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                  <Package size={14} />
                  <span className="text-[10px] uppercase tracking-widest">Inventory Variants & Stock</span>
                </div>

                {/* Variant list */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                  {variants.map((v) => (
                    <div key={v.id} className="border border-gray-200 p-3 bg-gray-50 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-800 block text-[10px]">{v.color}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wide block mt-0.5">Size: {v.size} | Stock: {v.stock}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Variant Form */}
                <div className="flex flex-wrap md:flex-nowrap gap-3 items-end p-4 border border-dashed border-gray-200 bg-gray-50/50">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Color</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="bg-white border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Size</label>
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="bg-white border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black uppercase w-20"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Quantity Stock</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="bg-white border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-black w-24"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-[9px] transition-colors"
                  >
                    Add Variant record
                  </button>
                </div>
              </div>

              {/* Form Action CTAs */}
              <div className="flex gap-4 border-t border-[#E5E4E0] pt-6">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="border border-[#1A1A1A] hover:bg-gray-50 px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} /> Commit Changes to Database
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

    </div>
  );
}
