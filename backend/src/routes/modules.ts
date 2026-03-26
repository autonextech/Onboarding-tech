import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        sections: {
          include: {
            documents: true,
            questions: true,
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Create a new module with nested sections, docs, and quizzes
router.post('/', async (req, res) => {
  try {
    const { title, description, status, sections } = req.body;

    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        status,
        sections: {
          create: sections.map((sec: any, idx: number) => ({
            title: sec.title,
            description: sec.description,
            videoUrl: sec.videoUrl || null,
            videoDuration: sec.videoDuration || null,
            order: idx,
            documents: sec.document ? {
              create: [
                {
                  title: sec.document.title,
                  type: sec.document.type,
                  url: sec.document.url || '#'
                }
              ]
            } : undefined,
            questions: {
              create: sec.questions?.map((q: any) => ({
                question: q.question,
                options: JSON.stringify(q.options),
                correctOptionIndex: q.correctIndex
              })) || []
            }
          }))
        }
      },
      include: {
        sections: {
          include: { documents: true, questions: true }
        }
      }
    });

    res.status(201).json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module metadata.' });
  }
});

// Delete a module
router.delete('/:id', async (req, res) => {
  try {
    await prisma.module.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// Update module status (e.g. publish/draft)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.module.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

export default router;
