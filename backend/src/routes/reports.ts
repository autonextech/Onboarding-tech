import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper to get full report data
async function getReportsData() {
  const candidates: any[] = await (prisma.user as any).findMany({
    where: { role: 'CANDIDATE' },
    include: {
      progress: true,
      quizAttempts: true
    }
  });

  const modules = await prisma.module.findMany({
    where: { status: 'PUBLISHED' },
    include: { sections: { include: { questions: true } } }
  });

  const reports = candidates.map((candidate: any) => {
    let totalProgress = 0;
    let totalScore = 0;
    
    const moduleStats = modules.map(mod => {
      const totalSections = mod.sections.length;
      const completedSections = (candidate.progress || []).filter((p: any) => p.moduleId === mod.id).length;
      const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

      let correctAnswers = 0;
      let totalQuestions = 0;

      mod.sections.forEach(sec => {
        totalQuestions += sec.questions.length;
        sec.questions.forEach(q => {
          const attempt = (candidate.quizAttempts || []).find((a: any) => a.questionId === q.id);
          if (attempt && attempt.isCorrect) correctAnswers++;
        });
      });

      const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        progress: progressPercent,
        score: scorePercent
      };
    });

    if (moduleStats.length > 0) {
      totalProgress = Math.round(moduleStats.reduce((acc, curr) => acc + curr.progress, 0) / moduleStats.length);
      totalScore = Math.round(moduleStats.reduce((acc, curr) => acc + curr.score, 0) / moduleStats.length);
    }

    return {
      userId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      department: candidate.department || 'Unassigned',
      overallProgress: totalProgress,
      overallScore: totalScore,
      moduleStats
    };
  });

  return reports;
}

// GET /api/reports
// Fetch JSON reports for all candidates
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
// Download reports as a CSV file
router.get('/export', async (req, res) => {
  try {
    const reports = await getReportsData();
    
    // CSV Header
    let csv = 'Candidate Name,Email,Department,Overall Progress %,Overall MCQ Score %\n';

    reports.forEach(r => {
      csv += `"${r.name}","${r.email}","${r.department}",${r.overallProgress},${r.overallScore}\n`;
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
