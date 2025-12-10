import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
<<<<<<< HEAD

    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

=======
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

<<<<<<< HEAD
    // Parse images from JSON string for each message
    const conversationWithParsedImages = {
      ...conversation,
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        images: msg.images ? (() => {
          try {
            const parsed = JSON.parse(msg.images);
            return Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        })() : null,
      })),
    };

    return NextResponse.json(conversationWithParsedImages);
  } catch (error: any) {
    console.error('Conversation GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a conversation and its messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Attempt delete; cascade takes care of related messages
    await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Conversation DELETE error:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
    });

    // Handle not found explicitly
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
=======
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
      { status: 500 }
    );
  }
}

