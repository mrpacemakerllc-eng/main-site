import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, event, data, path } = await req.json();

    if (!sessionId || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        event,
        data: data ? JSON.stringify(data) : null,
        path,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
