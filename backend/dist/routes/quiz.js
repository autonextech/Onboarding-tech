"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// POST /api/quiz/submit
// Batch-optimized: fetches all questions in ONE query, then uses a transaction for upserts.
router.post('/submit', async (req, res) => {
    try {
        const { userId, sectionId, answers } = req.body;
        if (!userId || !sectionId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid input payload' });
        }
        // OPTIMIZATION: Fetch ALL questions for this section in a single query
        // instead of querying one-by-one inside a loop (N+1 problem)
        const questionIds = answers.map((a) => a.questionId);
        const questions = await prisma_1.default.quizQuestion.findMany({
            where: { id: { in: questionIds } }
        });
        const questionMap = new Map(questions.map(q => [q.id, q]));
        // Score all answers in memory
        let correctCount = 0;
        const upsertOps = answers.map((answer) => {
            const question = questionMap.get(answer.questionId);
            if (!question)
                return null;
            const isCorrect = question.correctOptionIndex === answer.chosenIndex;
            if (isCorrect)
                correctCount++;
            // OPTIMIZATION: Build upsert operations for a single $transaction call
            return prisma_1.default.quizAttempt.upsert({
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
        }).filter(Boolean);
        // OPTIMIZATION: Execute all upserts in a single database transaction
        const results = await prisma_1.default.$transaction(upsertOps);
        const scorePercentage = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
        res.status(200).json({
            message: 'Quiz submitted successfully',
            score: scorePercentage,
            correctCount,
            totalQuestions: answers.length,
            results
        });
    }
    catch (error) {
        console.error('Error submitting quiz answers:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});
exports.default = router;
