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

    // Get total purchases and revenue
    const purchases = await prisma.purchase.findMany({
      where: {
        status: 'completed',
      },
    });

    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

    // Get recent purchases
    const recentPurchases = await prisma.purchase.findMany({
      where: {
        status: 'completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
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

    return NextResponse.json({
      totalPageViews,
      totalPurchases,
      totalRevenue,
      recentPurchases,
      topPages,
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
