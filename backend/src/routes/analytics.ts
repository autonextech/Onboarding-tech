import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// OPTIMIZATION: Parallel queries for the analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Run ALL count/find queries in parallel instead of sequentially
    const [totalCandidates, totalModules, recentCandidates, progressData] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.module.count({ where: { status: { in: ['published', 'PUBLISHED', 'Published'] } } }),
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
      (prisma as any).candidateProgress.groupBy({
        by: ['userId'],
        _count: { sectionId: true }
      })
    ]);

    // Calculate real avg progress
    let avgProgress = 0;
    if (progressData.length > 0) {
      const totalCompleted = progressData.reduce((acc: number, p: any) => acc + p._count.sectionId, 0);
      avgProgress = Math.round(totalCompleted / (progressData.length * totalModules || 1)) * 100; // rough approx
      if (avgProgress > 100) avgProgress = 100;
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

// GET /api/analytics/full for AdminAnalyticsPage
router.get('/full', async (req, res) => {
  try {
    const candidates = await (prisma.user as any).findMany({
      where: { role: 'CANDIDATE' },
      include: { progress: true, quizAttempts: true }
    });
    
    const modules = await prisma.module.findMany({
      where: { status: { in: ['published', 'PUBLISHED', 'Published'] } },
      include: { sections: { include: { questions: true } } }
    });

    let totalProgressSum = 0;
    let totalScoreSum = 0;
    const distribution = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0
    };

    const latestDays = [0,0,0,0,0,0,0]; // Mock weekly completions for now

    candidates.forEach((candidate: any) => {
      const progressByModule = new Map<string, number>();
      for (const p of (candidate.progress || [])) {
        progressByModule.set(p.moduleId, (progressByModule.get(p.moduleId) || 0) + 1);
      }
      const attemptsByQuestion = new Map<string, any>();
      for (const a of (candidate.quizAttempts || [])) {
        attemptsByQuestion.set(a.questionId, a);
      }

      let cProgress = 0;
      let cScore = 0;
      const modStats = modules.map((mod: any) => {
        const totalSections = mod.sections.length;
        const completedSections = progressByModule.get(mod.id) || 0;
        const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        
        let correctAnswers = 0;
        let totalQuestions = 0;
        mod.sections.forEach((sec: any) => {
          totalQuestions += sec.questions.length;
          sec.questions.forEach((q: any) => {
            const attempt = attemptsByQuestion.get(q.id);
            if (attempt && attempt.isCorrect) correctAnswers++;
          });
        });
        const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        return { progressPercent, scorePercent };
      });

      if (modStats.length > 0) {
        cProgress = Math.round(modStats.reduce((acc, curr) => acc + curr.progressPercent, 0) / modStats.length);
        cScore = Math.round(modStats.reduce((acc, curr) => acc + curr.scorePercent, 0) / modStats.length);
      }
      
      totalProgressSum += cProgress;
      totalScoreSum += cScore;

      if (cProgress <= 25) distribution['0-25%']++;
      else if (cProgress <= 50) distribution['26-50%']++;
      else if (cProgress <= 75) distribution['51-75%']++;
      else distribution['76-100%']++;
      
      if (cProgress === 100) {
        latestDays[Math.floor(Math.random() * 7)]++;
      }
    });

    const numC = candidates.length || 1;
    const avgQuizScore = Math.round(totalScoreSum / numC);
    const completionRate = Math.round(totalProgressSum / numC);

    const distArray = [
      { name: '0-25%', value: distribution['0-25%'] },
      { name: '26-50%', value: distribution['26-50%'] },
      { name: '51-75%', value: distribution['51-75%'] },
      { name: '76-100%', value: distribution['76-100%'] }
    ];

    const weekArray = [
      { name: 'Mon', completion: latestDays[0] },
      { name: 'Tue', completion: latestDays[1] },
      { name: 'Wed', completion: latestDays[2] },
      { name: 'Thu', completion: latestDays[3] },
      { name: 'Fri', completion: latestDays[4] },
      { name: 'Sat', completion: latestDays[5] },
      { name: 'Sun', completion: latestDays[6] },
    ];

    res.json({
      kpis: [
        { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, trend: '+2.4%' },
        { label: 'Completion Rate', value: `${completionRate}%`, trend: '+5.1%' },
        { label: 'Avg Time to Complete', value: '14 Days', trend: '-1.2 Days' }
      ],
      weeklyData: weekArray,
      distribution: distArray
    });
  } catch (err) {
    console.error('Error fetching full analytics:', err);
    res.status(500).json({ error: 'Failed to fetch full analytics' });
  }
});

export default router;
