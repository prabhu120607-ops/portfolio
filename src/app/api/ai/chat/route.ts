import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatHistory } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await aiService.chatAssistant(message, chatHistory || []);
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
