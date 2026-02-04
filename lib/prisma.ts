import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

// Only create PrismaClient if we have a valid database URL (not SQLite in production)
const isDemoMode = process.env.DEMO_MODE === "true" ||
  (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('file:'))

let prismaClient: PrismaClient | null = null

if (!isDemoMode) {
  prismaClient = globalForPrisma.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }
}

// Export a proxy that throws helpful errors in demo mode
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (prismaClient) {
      return (prismaClient as any)[prop]
    }
    // In demo mode, return a mock that throws on actual use
    return () => {
      throw new Error('Database not available in demo mode')
    }
  }
})
