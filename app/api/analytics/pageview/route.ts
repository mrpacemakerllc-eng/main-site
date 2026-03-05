import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, path, referrer, duration } = await req.json();

    if (!sessionId || !path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get location from request headers (Vercel provides these)
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || null;
    const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity') || null;
    const userAgent = req.headers.get('user-agent') || null;

    await prisma.pageView.create({
      data: {
        sessionId,
        path,
        referrer,
        userAgent,
        country,
        city,
        duration,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pageview track error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
