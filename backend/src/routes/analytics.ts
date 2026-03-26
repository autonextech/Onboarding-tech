import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/dashboard', async (req, res) => {
  try {
    const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const totalModules = await prisma.module.count({ where: { status: 'published' } });
    
    // In a full implementation, you'd calculate this from an Enrollment/Progress table
    // For now, we return mock percentages for UI binding
    const avgProgress = 42; 
    const modulesCompleted = 14; 

    // Recent Joinees
    const recentCandidates = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        createdAt: true
      }
    });

    res.json({
      metrics: {
        totalCandidates,
        avgProgress,
        modulesCompleted,
        totalModules
      },
      recentCandidates
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
