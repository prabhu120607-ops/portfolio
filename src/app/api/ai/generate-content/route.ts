import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, brand, color, keywords } = body;

    if (!category || !brand || !color) {
      return NextResponse.json({ error: 'Category, brand, and color are required' }, { status: 400 });
    }

    const generated = await aiService.generateProductContent({
      category,
      brand,
      color,
      keywords: keywords || ''
    });

    return NextResponse.json(generated);
  } catch (error) {
    console.error('AI Content Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
