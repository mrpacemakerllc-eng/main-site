import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Check if user is admin
async function isAdmin(session: any) {
  if (!session?.user?.email) return false;
  const adminEmails = ['eric_g_singh@yahoo.com', 'egsingh@gmail.com'];
  return adminEmails.includes(session.user.email.toLowerCase()) || session.user.role === 'admin';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!await isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get total page views
    const totalPageViews = await prisma.pageView.count();

    // Get all purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        status: 'completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

    // Get all registered users
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Get all quiz leads (emails from quizzes)
    const quizLeads = await prisma.quizLead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get top pages
    const pageViews = await prisma.pageView.groupBy({
      by: ['path'],
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 8,
    });

    const topPages = pageViews.map((pv) => ({
      path: pv.path,
      views: pv._count.path,
    }));

    // Build activity feed - combine all events
    const activity: Array<{
      type: 'purchase' | 'signup' | 'quiz_lead';
      email: string;
      details: string;
      createdAt: string;
    }> = [];

    purchases.forEach(p => {
      activity.push({
        type: 'purchase',
        email: p.email,
        details: `Bought ${p.productName} ($${(p.amount / 100).toFixed(2)})`,
        createdAt: p.createdAt.toISOString(),
      });
    });

    users.forEach(u => {
      activity.push({
        type: 'signup',
        email: u.email,
        details: 'Created account',
        createdAt: u.createdAt.toISOString(),
      });
    });

    quizLeads.forEach(q => {
      activity.push({
        type: 'quiz_lead',
        email: q.email,
        details: q.source ? `Quiz: ${q.source}` : 'Took a quiz',
        createdAt: q.createdAt.toISOString(),
      });
    });

    // Sort by date
    activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      totalPageViews,
      totalPurchases,
      totalRevenue,
      totalUsers: users.length,
      totalQuizLeads: quizLeads.length,
      recentPurchases: purchases,
      users,
      quizLeads,
      topPages,
      activity,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({
      totalPageViews: 0,
      totalPurchases: 0,
      totalRevenue: 0,
      recentPurchases: [],
      topPages: [],
    });
  }
}
