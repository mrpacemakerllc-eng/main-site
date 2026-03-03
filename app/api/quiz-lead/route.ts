import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, score, total, source } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Save to database (upsert - update if exists)
    await prisma.quizLead.upsert({
      where: { email },
      update: {
        score,
        total,
        source,
        updatedAt: new Date(),
      },
      create: {
        email,
        score,
        total,
        source,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save quiz lead:', error);
    // Still return success - don't block the user experience
    return NextResponse.json({ success: true });
  }
}
