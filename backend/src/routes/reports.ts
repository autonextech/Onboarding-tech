import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Helper to get full report data
async function getReportsData() {
  // OPTIMIZATION: Run both queries in parallel with Promise.all
  const [candidates, modules] = await Promise.all([
    (prisma.user as any).findMany({
      where: { role: 'CANDIDATE' },
      include: {
        progress: true,
        quizAttempts: true
      }
    }),
    prisma.module.findMany({
      where: { status: { in: ['published', 'PUBLISHED', 'Published'] } },
      include: { sections: { include: { questions: true } } }
    })
  ]);

  const reports = (candidates as any[]).map((candidate: any) => {
    // OPTIMIZATION: Build hash maps for O(1) lookups instead of O(n) .filter()/.find()
    const progressByModule = new Map<string, number>();
    for (const p of (candidate.progress || [])) {
      progressByModule.set(p.moduleId, (progressByModule.get(p.moduleId) || 0) + 1);
    }

    const attemptsByQuestion = new Map<string, any>();
    for (const a of (candidate.quizAttempts || [])) {
      attemptsByQuestion.set(a.questionId, a);
    }

    let totalProgress = 0;
    let totalScore = 0;
    let totalAttemptedQuestions = 0;
    let totalCorrectAnswers = 0;
    let totalAvailableQuestions = 0;

    const moduleStats = modules.map((mod: any) => {
      const totalSections = mod.sections.length;
      const completedSections = progressByModule.get(mod.id) || 0;
      const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

      let correctAnswers = 0;
      let attemptedQuestions = 0;
      let totalQuestions = 0;

      mod.sections.forEach((sec: any) => {
        totalQuestions += sec.questions.length;
        sec.questions.forEach((q: any) => {
          const attempt = attemptsByQuestion.get(q.id);
          if (attempt) {
            attemptedQuestions++;
            if (attempt.isCorrect) correctAnswers++;
          }
        });
      });

      totalAvailableQuestions += totalQuestions;
      totalAttemptedQuestions += attemptedQuestions;
      totalCorrectAnswers += correctAnswers;

      const scorePercent = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        progress: progressPercent,
        score: scorePercent,
        attemptedQuestions,
        totalQuestions,
        correctAnswers
      };
    });

    if (moduleStats.length > 0) {
      totalProgress = Math.round(moduleStats.reduce((acc: number, curr: any) => acc + curr.progress, 0) / moduleStats.length);
    }

    totalScore = totalAttemptedQuestions > 0 ? Math.round((totalCorrectAnswers / totalAttemptedQuestions) * 100) : 0;

    return {
      userId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      department: candidate.department || 'Unassigned',
      overallProgress: totalProgress,
      overallScore: totalScore,
      attemptedQuestions: totalAttemptedQuestions,
      correctAnswers: totalCorrectAnswers,
      totalQuestions: totalAvailableQuestions,
      moduleStats
    };
  });

  return reports;
}

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const reports = await getReportsData();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/export
router.get('/export', async (req, res) => {
  try {
    const reports = await getReportsData();

    let csv = 'Candidate Name,Email,Department,Overall Progress %,Overall Quiz Score %,Correct Answers,Total Questions,Module,Module Progress %,Module Score %,Module Correct,Module Total Qs\n';
    reports.forEach((r: any) => {
      if (r.moduleStats && r.moduleStats.length > 0) {
        r.moduleStats.forEach((ms: any) => {
          csv += `"${r.name}","${r.email}","${r.department}",${r.overallProgress},${r.overallScore},${r.correctAnswers},${r.totalQuestions},"${ms.moduleTitle}",${ms.progress},${ms.score},${ms.correctAnswers},${ms.totalQuestions}\n`;
        });
      } else {
        csv += `"${r.name}","${r.email}","${r.department}",${r.overallProgress},${r.overallScore},${r.correctAnswers},${r.totalQuestions},,,,\n`;
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=autonex_candidates_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ error: 'Failed to export reports file' });
  }
});

export default router;
