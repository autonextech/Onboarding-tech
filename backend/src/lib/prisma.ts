import { PrismaClient } from '@prisma/client';

// SINGLETON: Reuse the same PrismaClient across the entire application.
// Creating multiple instances opens redundant connection pools, which
// exhausts the database's connection limit and adds massive latency.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
