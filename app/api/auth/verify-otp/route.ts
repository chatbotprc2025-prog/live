import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP, isOTPExpired } from '@/lib/otpUtils';

/**
 * POST /api/auth/verify-otp
 * 
 * Verifies the OTP entered by the user
 * 
 * Security Rules:
 * - Max 3 verification attempts
 * - OTP expires after 5 minutes
 * - Delete OTP after successful verification or expiry
 * - Mark user email as verified on success
 */
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // 1. Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Fetch OTP record by email
    const otpRecord = await prisma.emailOTP.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new OTP' },
        { status: 404 }
      );
    }

    // 3. Check if OTP has expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      // Delete expired OTP record
      await prisma.emailOTP.delete({
        where: { id: otpRecord.id },
      });
      
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP' },
        { status: 400 }
      );
    }

    // 4. Check if max attempts exceeded (3 attempts)
    if (otpRecord.attempts >= 3) {
      // Delete OTP record after max attempts
      await prisma.emailOTP.delete({
        where: { id: otpRecord.id },
      });
      
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new OTP' },
        { status: 400 }
      );
    }

    // 5. Verify OTP by comparing hashed values
    const isValid = await verifyOTP(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      await prisma.emailOTP.update({
        where: { id: otpRecord.id },
        data: {
          attempts: otpRecord.attempts + 1,
        },
      });

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      
      return NextResponse.json(
        { 
          error: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Maximum attempts exceeded.'}`,
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
        },
        { status: 400 }
      );
    }

    // 6. OTP is correct - mark as verified and update user
    // Mark OTP record as verified
    await prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: {
        verified: true,
      },
    });

    // Update or create user with email_verified = true
    let clientUser = await prisma.clientUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (clientUser) {
      // Update existing user
      clientUser = await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: {
          emailVerified: true,
        },
      });
    } else {
      // User doesn't exist yet (shouldn't happen in normal flow, but handle gracefully)
      // This means user needs to complete registration first
      return NextResponse.json(
        { error: 'User not found. Please complete registration first' },
        { status: 404 }
      );
    }

    // 7. Delete OTP record after successful verification
    await prisma.emailOTP.delete({
      where: { id: otpRecord.id },
    });


    // 8. Return success with user info
    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: clientUser.id,
          email: clientUser.email,
          emailVerified: clientUser.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error in verify-otp endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP', details: error.message },
      { status: 500 }
    );
  }
}

