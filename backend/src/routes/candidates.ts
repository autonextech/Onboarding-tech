import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/candidates/:id/dashboard
// Returns real modules and stats for a candidate
router.get('/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Ensure the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Fetch all published modules with their sections and documents
    const modules = await prisma.module.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        sections: {
          include: {
            documents: true,
            questions: true
          }
        }
      }
    });

    // We can simulate progress or tracking here. Since we don't have a CandidateProgress table yet,
    // we'll return the structures so the frontend can display real created modules instead of mock ones.
    
    res.json({
      user,
      modules,
      stats: {
        overallProgress: 0,
        completedModules: 0,
        totalModules: modules.length
      }
    });
  } catch (error) {
    console.error('Error fetching candidate dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch candidate dashboard' });
  }
});

export default router;
