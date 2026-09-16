import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let orders;
    if (userId) {
      orders = dbService.getOrdersByUser(userId);
    } else {
      orders = dbService.getOrders();
    }

    // Sort by newest orders first
    orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      contactEmail,
      shippingAddress,
      billingAddress,
      shippingMethod,
      subtotal,
      discountAmount,
      tax,
      shippingCost,
      total,
      paymentMethod,
      couponCode,
      items
    } = body;

    if (!contactEmail || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    // Check inventory availability first
    const products = dbService.getProducts();
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Product ${item.productName} not found` }, { status: 400 });
      }
      const variant = prod.variants.find(v => v.id === item.variantId);
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${item.productName} (${item.color} / ${item.size}). Available: ${variant ? variant.stock : 0}` 
        }, { status: 400 });
      }
    }

    const newOrder = dbService.createOrder({
      userId: userId || null,
      contactEmail,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod || 'Standard Delivery',
      subtotal: parseFloat(subtotal),
      discountAmount: parseFloat(discountAmount || 0),
      tax: parseFloat(tax),
      shippingCost: parseFloat(shippingCost || 0),
      total: parseFloat(total),
      paymentMethod: paymentMethod || 'Credit Card',
      couponCode: couponCode || null,
      items
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
