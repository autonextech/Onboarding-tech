import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

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
    const { title, description, status, assessmentUrl, sections } = req.body;

    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        status,
        assessmentUrl: assessmentUrl || null,
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

// Full module update — update metadata + replace sections
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, assessmentUrl, sections } = req.body;

    // Delete old sections (cascade deletes documents + questions)
    await prisma.section.deleteMany({ where: { moduleId: req.params.id } });

    const updated = await prisma.module.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        assessmentUrl: assessmentUrl || null,
        sections: sections ? {
          create: sections.map((sec: any, idx: number) => ({
            title: sec.title,
            description: sec.description,
            videoUrl: sec.videoUrl || null,
            videoDuration: sec.videoDuration || null,
            order: idx,
            documents: sec.document ? {
              create: [{
                title: sec.document.title,
                type: sec.document.type,
                url: sec.document.url || '#'
              }]
            } : undefined,
            questions: sec.questions?.length ? {
              create: sec.questions.map((q: any) => ({
                question: q.question,
                options: JSON.stringify(q.options),
                correctOptionIndex: q.correctIndex ?? 0
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        sections: {
          include: { documents: true, questions: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// GET /api/modules/quiz-sample-excel — Download sample quiz import template
// MUST be before /:id route to avoid matching 'quiz-sample-excel' as an id
router.get('/quiz-sample-excel', (req, res) => {
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();
  const data = [
    ['question', 'option1', 'option2', 'option3', 'option4', 'correctOption'],
    ['What year was the company founded?', '2005', '2008', '2010', '2012', '2'],
    ['What is our core value?', 'Speed', 'Innovation', 'Profit', 'Scale', '2'],
    ['Who is the CEO?', 'John', 'Jane', 'Mike', 'Sarah', '1'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz Questions');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=autonex_quiz_sample.xlsx');
  res.send(buf);
});

// OPTIMIZATION: Dedicated single-module endpoint for the candidate ModuleViewPage
// Avoids fetching ALL modules + ALL sections when you only need one
router.get('/:id', async (req, res) => {
  try {
    const mod = await prisma.module.findUnique({
      where: { id: req.params.id },
      include: {
        sections: {
          include: {
            documents: true,
            questions: true,
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!mod) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(mod);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// POST /api/modules/:moduleId/sections/:sectionId/import-questions — Import quiz questions from Excel
router.post('/:moduleId/sections/:sectionId/import-questions', async (req, res) => {
  try {
    const multer = require('multer');
    const XLSX = require('xlsx');
    const uploadSingle = multer({ storage: multer.memoryStorage() }).single('file');
    
    uploadSingle(req, res, async (err: any) => {
      if (err) return res.status(400).json({ error: 'Upload failed' });
      if (!(req as any).file) return res.status(400).json({ error: 'No file uploaded' });
      
      const wb = XLSX.read((req as any).file.buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      
      if (rows.length === 0) return res.status(400).json({ error: 'Empty spreadsheet' });
      
      let created = 0;
      const errors: string[] = [];
      
      for (const row of rows) {
        const questionText = row.question?.toString().trim();
        const opt1 = row.option1?.toString().trim();
        const opt2 = row.option2?.toString().trim();
        const opt3 = row.option3?.toString().trim();
        const opt4 = row.option4?.toString().trim();
        const correctOpt = parseInt(row.correctOption?.toString().trim());
        
        if (!questionText || !opt1 || !opt2 || !opt3 || !opt4 || isNaN(correctOpt) || correctOpt < 1 || correctOpt > 4) {
          errors.push(`Skipped: "${questionText || 'empty'}" — missing fields or invalid correctOption`);
          continue;
        }
        
        await prisma.quizQuestion.create({
          data: {
            sectionId: req.params.sectionId,
            question: questionText,
            options: JSON.stringify([opt1, opt2, opt3, opt4]),
            correctOptionIndex: correctOpt - 1 // Convert 1-based to 0-based
          }
        });
        created++;
      }
      
      res.json({ message: `Imported ${created} questions`, created, errors });
    });
  } catch (error) {
    console.error('Error importing quiz questions:', error);
    res.status(500).json({ error: 'Failed to import questions' });
  }
});

export default router;

