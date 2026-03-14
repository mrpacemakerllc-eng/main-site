import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Check if user is admin
async function isAdmin(session: any) {
  if (!session?.user?.email) return false;
  // Add your admin email(s) here
  const adminEmails = ['eric_g_singh@yahoo.com', 'egsingh@gmail.com'];
  return adminEmails.includes(session.user.email.toLowerCase()) || session.user.role === 'admin';
}

// GET - List all manually granted access
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!await isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        stripeSessionId: {
          startsWith: 'manual_',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Failed to fetch access list:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Grant access to a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!await isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email and product required' }, { status: 400 });
    }

    // Check if access already exists
    const existing = await prisma.purchase.findFirst({
      where: {
        email: email.toLowerCase(),
        productId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'User already has access' }, { status: 400 });
    }

    // Create manual purchase record
    const purchase = await prisma.purchase.create({
      data: {
        email: email.toLowerCase(),
        productId,
        productName: productId === 'paced_ecg_booklet' ? 'How to Read a Paced ECG' : 'ECG Rhythm Library',
        amount: 0, // Free - manually granted
        stripeSessionId: `manual_${Date.now()}`,
        status: 'completed',
      },
    });

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('Failed to grant access:', error);
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
  }
}

// DELETE - Revoke access
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!await isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.purchase.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke access:', error);
    return NextResponse.json({ error: 'Failed to revoke' }, { status: 500 });
  }
}
