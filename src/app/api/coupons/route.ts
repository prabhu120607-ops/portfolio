import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotalStr = searchParams.get('subtotal');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = dbService.getCouponByCode(code);
    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    // Check expiry
    const expiry = new Date(coupon.expiryDate);
    const now = new Date();
    if (expiry < now) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' }, { status: 400 });
    }

    // Check minimum order value
    if (subtotalStr) {
      const subtotal = parseFloat(subtotalStr);
      if (subtotal < coupon.minOrderValue) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ valid: true, coupon });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiryDate, active } = body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return NextResponse.json({ error: 'Missing required coupon fields' }, { status: 400 });
    }

    const newCoupon = dbService.createCoupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: parseFloat(minOrderValue || 0),
      maxDiscountValue: parseFloat(maxDiscountValue || 999999),
      expiryDate,
      active: active !== undefined ? active : true
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    dbService.deleteCoupon(id);
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
