import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/quiz/submit
// Receives answers, scores them against the source of truth, and saves the attempts.
router.post('/submit', async (req, res) => {
  try {
    const { userId, sectionId, answers } = req.body;
    // answers expected format: [{ questionId: string, chosenIndex: number }]

    if (!userId || !sectionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid input payload' });
    }

    const results = [];
    let correctCount = 0;

    for (const answer of answers) {
      // Find the question to check the correct answer
      const question = await prisma.quizQuestion.findUnique({
        where: { id: answer.questionId }
      });

      if (!question) continue;

      const isCorrect = question.correctOptionIndex === answer.chosenIndex;
      if (isCorrect) correctCount++;

      // Upsert the attempt so they can retake it and overwrite their old score
      const attempt = await prisma.quizAttempt.upsert({
        where: {
          userId_questionId: {
            userId,
            questionId: answer.questionId
          }
        },
        update: {
          chosenIndex: answer.chosenIndex,
          isCorrect,
          attemptedAt: new Date()
        },
        create: {
          userId,
          sectionId,
          questionId: answer.questionId,
          chosenIndex: answer.chosenIndex,
          isCorrect
        }
      });

      results.push(attempt);
    }

    const scorePercentage = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

    res.status(200).json({
      message: 'Quiz submitted successfully',
      score: scorePercentage,
      correctCount,
      totalQuestions: answers.length,
      results
    });

  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
