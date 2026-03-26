import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/mentors/:id/mentees
router.get('/:id/mentees', async (req, res) => {
  try {
    const mentees = await (prisma.user as any).findMany({
      where: { mentorId: req.params.id, role: 'CANDIDATE' },
      include: {
        progress: true,
        quizAttempts: true,
      }
    });

    const detailedMentees = mentees.map((mentee: any) => {
      // Create lookup sets
      const completedModulesCount = new Set((mentee.progress || []).map((p: any) => p.moduleId)).size;
      const totalCorrectQuizzes = (mentee.quizAttempts || []).filter((q: any) => q.isCorrect).length;
      const totalQuizzesAttempted = (mentee.quizAttempts || []).length;

      return {
        id: mentee.id,
        name: mentee.name,
        email: mentee.email,
        department: mentee.department,
        isActive: mentee.isActive,
        completedModulesCount,
        quizScorePercent: totalQuizzesAttempted > 0 ? Math.round((totalCorrectQuizzes / totalQuizzesAttempted) * 100) : 0
      };
    });

    res.json(detailedMentees);
  } catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({ error: 'Failed to fetch mentees' });
  }
});

export default router;
