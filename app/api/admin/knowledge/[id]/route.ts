import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { learnFromKnowledgeBase, ensureInitialized } from '@/lib/learningEngine';

// PUT - Update knowledge entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
<<<<<<< HEAD
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { source, type, name, text, imageUrl, imageDescription } = body;
=======
    const body = await request.json();
    const { source, type, name, text } = body;
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff

    if (!source || !type || !name || !text) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const knowledge = await prisma.knowledge.update({
      where: { id },
      data: {
        source: source.trim(),
        type: type.trim(),
        name: name.trim(),
        text: text.trim(),
<<<<<<< HEAD
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
        imageDescription: imageDescription && imageDescription.trim() ? imageDescription.trim() : null,
=======
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'KNOWLEDGE_UPDATE',
        entityType: 'Knowledge',
        entityId: knowledge.id,
        severity: 'INFO',
      },
    });

    // Ensure learning engine is ready, then learn from updated knowledge (async, don't wait)
    ensureInitialized().then(() => {
      learnFromKnowledgeBase().catch(err => {
        console.error('Error learning from updated knowledge:', err);
      });
    }).catch(() => {
      // If initialization fails, still try to learn
      learnFromKnowledgeBase().catch(err => {
        console.error('Error learning from updated knowledge:', err);
      });
    });

    return NextResponse.json(knowledge);
<<<<<<< HEAD
  } catch (error: any) {
    console.error('Knowledge PUT error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    
    // Ensure we always return valid JSON
    const errorMessage = error?.message || 'Internal server error';
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error?.code || 'UNKNOWN_ERROR',
      },
=======
  } catch (error) {
    console.error('Knowledge PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
      { status: 500 }
    );
  }
}

// DELETE - Delete knowledge entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.knowledge.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'KNOWLEDGE_DELETE',
        entityType: 'Knowledge',
        entityId: id,
        severity: 'INFO',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

