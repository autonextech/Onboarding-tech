import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// OPTIMIZATION: Parallel queries for the analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Run ALL count/find queries in parallel instead of sequentially
    const [totalCandidates, totalModules, recentCandidates, progressData] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.module.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.findMany({
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
      }),
      // Compute real average progress from CandidateProgress table
      (prisma.candidateProgress as any).groupBy({
        by: ['userId'],
        _count: { sectionId: true }
      })
    ]);

    // Calculate real avg progress
    let avgProgress = 0;
    if (progressData.length > 0) {
      const totalCompleted = progressData.reduce((acc: number, p: any) => acc + p._count.sectionId, 0);
      avgProgress = Math.round(totalCompleted / progressData.length);
    }

    res.json({
      metrics: {
        totalCandidates,
        avgProgress,
        modulesCompleted: progressData.length,
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
