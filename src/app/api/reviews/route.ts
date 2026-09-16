import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all'); // admin check

    let reviews;
    if (all === 'true') {
      reviews = dbService.getReviews();
    } else if (productId) {
      reviews = dbService.getReviewsByProduct(productId);
    } else {
      reviews = dbService.getReviews();
    }

    // Sort by newest reviews
    reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, title, comment, images } = body;

    if (!productId || !userId || !userName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const newReview = dbService.createReview({
      productId,
      userId,
      userName,
      rating: parseInt(rating),
      title: title || '',
      comment,
      images: images || []
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Review ID and status are required' }, { status: 400 });
    }

    const updated = dbService.updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
