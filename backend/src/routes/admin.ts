import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Cache with 30s TTL
let dashCache: { data: any; ts: number } | null = null;
const CACHE_TTL = 30_000;

/**
 * GET /api/admin/dashboard
 * Single endpoint replacing:
 *   - GET /api/users
 *   - GET /api/analytics/dashboard
 *   - N × GET /api/candidates/:id/dashboard
 * Returns all metrics in ONE round trip.
 */
router.get('/dashboard', async (req, res) => {
  try {
    const now = Date.now();
    if (dashCache && now - dashCache.ts < CACHE_TTL) {
      return res.json(dashCache.data);
    }

    // Single parallel query for everything
    const [allUsers, modules, allProgress, allQuizAttempts] = await Promise.all([
      (prisma.user as any).findMany({
        select: {
          id: true, name: true, email: true, role: true,
          department: true, isActive: true, mentorId: true,
          mentor: { select: { id: true, name: true } },
          createdAt: true
        }
      }),
      prisma.module.findMany({
        where: { status: { in: ['published', 'PUBLISHED', 'Published'] } },
        include: { sections: { include: { questions: true } } }
      }),
      (prisma as any).candidateProgress.findMany({
        select: { userId: true, moduleId: true, sectionId: true }
      }),
      (prisma as any).quizAttempt.findMany({
        select: { userId: true, questionId: true, isCorrect: true }
      })
    ]);

    const candidates = allUsers.filter((u: any) => u.role === 'CANDIDATE');

    // Build lookup maps for O(1) access - no N+1
    const progressByUser = new Map<string, Map<string, number>>();
    for (const p of allProgress) {
      if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, new Map());
      const modMap = progressByUser.get(p.userId)!;
      modMap.set(p.moduleId, (modMap.get(p.moduleId) || 0) + 1);
    }

    const quizByUser = new Map<string, Map<string, boolean>>();
    for (const a of allQuizAttempts) {
      if (!quizByUser.has(a.userId)) quizByUser.set(a.userId, new Map());
      quizByUser.get(a.userId)!.set(a.questionId, a.isCorrect);
    }

    let totalProgressSum = 0;
    const enrichedCandidates = candidates.map((c: any) => {
      const progressMap = progressByUser.get(c.id) || new Map();
      const quizMap = quizByUser.get(c.id) || new Map();

      let totalProgress = 0;
      let totalQ = 0;
      let correctQ = 0;

      for (const mod of modules) {
        const completedSections = progressMap.get(mod.id) || 0;
        const totalSections = (mod as any).sections.length;
        const pct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        totalProgress += pct;

        for (const sec of (mod as any).sections) {
          for (const q of sec.questions) {
            totalQ++;
            if (quizMap.get(q.id)) correctQ++;
          }
        }
      }

      const overallProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;
      const quizScore = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      totalProgressSum += overallProgress;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        department: c.department,
        isActive: c.isActive,
        mentorName: c.mentor?.name || 'Unassigned',
        createdAt: c.createdAt,
        progress: overallProgress,
        quizScore,
        status: !c.isActive ? 'inactive' : overallProgress === 100 ? 'completed' : 'active'
      };
    });

    const avgProgress = candidates.length > 0 ? Math.round(totalProgressSum / candidates.length) : 0;
    const allCandidates = allUsers.filter((u: any) => u.role === 'CANDIDATE');
    const activeCandidates = allCandidates.filter((u: any) => u.isActive);

    const result = {
      metrics: {
        totalCandidates: candidates.length,
        activeCandidates: activeCandidates.length,
        inactiveCandidates: allCandidates.length - activeCandidates.length,
        completedCandidates: enrichedCandidates.filter((c: any) => c.status === 'completed').length,
        avgProgress,
        totalModules: modules.length
      },
      candidates: enrichedCandidates
    };

    dashCache = { data: result, ts: now };
    res.json(result);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

export default router;
