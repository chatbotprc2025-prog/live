import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all conversations
export async function GET(request: NextRequest) {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
      },
    });

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error('Conversations POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

=======
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
