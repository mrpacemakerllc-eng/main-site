import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await prisma.quizLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Failed to fetch quiz leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
