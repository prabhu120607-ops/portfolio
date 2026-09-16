import { NextRequest, NextResponse } from 'next/server';
import { dbService, getDb, saveDb, Product } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const color = searchParams.get('color');
    const size = searchParams.get('size');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // admin filter

    let products = dbService.getProducts();

    // Default filter to only active products unless explicitly requested by admin
    if (status !== 'all') {
      products = products.filter(p => p.status === 'active');
    }

    // Category filter
    if (category && category !== 'all') {
      products = products.filter(p => p.categoryId.toLowerCase() === category.toLowerCase());
    }

    // Brand filter
    if (brand && brand !== 'all') {
      products = products.filter(p => p.brandId === brand);
    }

    // Color filter
    if (color && color !== 'all') {
      products = products.filter(p => 
        p.variants.some(v => v.color.toLowerCase() === color.toLowerCase() && v.stock > 0)
      );
    }

    // Size filter
    if (size && size !== 'all') {
      products = products.filter(p => 
        p.variants.some(v => v.size.toUpperCase() === size.toUpperCase() && v.stock > 0)
      );
    }

    // Price range filter
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Rating filter
    if (rating && rating !== 'all') {
      products = products.filter(p => p.ratingsAverage >= parseFloat(rating));
    }

    // Search query filter
    if (search) {
      const query = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'newest':
          // Mock sorting: higher id = newer
          products.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case 'price-low-high':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high-low':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'best-selling':
          // Sort by ratingsAverage or mock bestselling
          products.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
          break;
        case 'highest-rated':
          products.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
          break;
        default:
          break;
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, description, shortDescription, price, originalPrice, discountPercent, categoryId, brandId, tags, images, variants, status } = body;

    if (!name || !price || !categoryId || !brandId || !sku) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = dbService.createProduct({
      name,
      slug,
      sku,
      description: description || '',
      shortDescription: shortDescription || '',
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      discountPercent: discountPercent ? parseInt(discountPercent) : 0,
      categoryId,
      brandId,
      status: status || 'active',
      tags: tags || [],
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'],
      variants: variants || []
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
