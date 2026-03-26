import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/progress/section
// Mark a section complete for a user
router.post('/section', async (req, res) => {
  try {
    const { userId, moduleId, sectionId } = req.body;

    if (!userId || !moduleId || !sectionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const progress = await prisma.candidateProgress.upsert({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      },
      update: {
        completedAt: new Date()
      },
      create: {
        userId,
        moduleId,
        sectionId
      }
    });

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error recording section progress:', error);
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

// GET /api/progress/:userId
// Returns all completed sections for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const completedSections = await prisma.candidateProgress.findMany({
      where: { userId },
      select: {
        sectionId: true,
        moduleId: true,
        completedAt: true
      }
    });

    res.json(completedSections);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
