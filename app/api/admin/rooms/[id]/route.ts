import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT - Update room
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
    const body = await request.json();
    const { roomCode, buildingName, floor, textDirections, latitude, longitude, imageUrl } = body;

    // Validate required fields
    if (!roomCode || !roomCode.trim()) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }
    if (!buildingName || !buildingName.trim()) {
      return NextResponse.json(
        { error: 'Building name is required' },
        { status: 400 }
      );
    }
    if (!floor || !floor.trim()) {
      return NextResponse.json(
        { error: 'Floor is required' },
        { status: 400 }
      );
    }

    // Validate latitude and longitude if provided
    let lat: number | null = null;
    let lng: number | null = null;
    
    if (latitude !== null && latitude !== undefined && latitude !== '') {
      lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { error: 'Latitude must be a number between -90 and 90' },
          { status: 400 }
        );
      }
    }
    
    if (longitude !== null && longitude !== undefined && longitude !== '') {
      lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'Longitude must be a number between -180 and 180' },
          { status: 400 }
        );
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        roomCode: roomCode.trim(),
        buildingName: buildingName.trim(),
        floor: floor.trim(),
        textDirections: textDirections?.trim() || null,
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    // Audit log (non-blocking - don't fail if this fails)
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.userId,
          action: 'ROOM_UPDATE',
          entityType: 'Room',
          entityId: room.id,
          severity: 'INFO',
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Continue even if audit log fails
    }

    return NextResponse.json(room);
  } catch (error: any) {
    console.error('Room PUT error:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Room code already exists. Please use a different room code.' },
        { status: 400 }
      );
    }
    
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete room
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
    await prisma.room.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'ROOM_DELETE',
        entityType: 'Room',
        entityId: id,
        severity: 'WARNING',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Room DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

