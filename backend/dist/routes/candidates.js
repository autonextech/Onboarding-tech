"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// GET /api/candidates/:id/dashboard
// Returns REAL modules with REAL progress and REAL quiz scores
router.get('/:id/dashboard', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { mentor: { select: { id: true, name: true, email: true } } }
        });
        if (!user) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        // Fetch all data in parallel for speed
        const [modules, progressRecords, quizAttempts] = await Promise.all([
            prisma_1.default.module.findMany({
                where: { status: { in: ['published', 'PUBLISHED', 'Published'] } },
                include: {
                    sections: {
                        include: { documents: true, questions: true },
                        orderBy: { order: 'asc' }
                    }
                }
            }),
            prisma_1.default.candidateProgress.findMany({
                where: { userId },
                select: { sectionId: true, moduleId: true }
            }),
            prisma_1.default.quizAttempt.findMany({
                where: { userId },
                select: { questionId: true, isCorrect: true }
            })
        ]);
        // Build lookup sets for O(1) access
        const completedSectionIds = new Set(progressRecords.map((p) => p.sectionId));
        const completedModuleSections = new Map();
        for (const p of progressRecords) {
            completedModuleSections.set(p.moduleId, (completedModuleSections.get(p.moduleId) || 0) + 1);
        }
        const attemptMap = new Map(quizAttempts.map((a) => [a.questionId, a.isCorrect]));
        // Compute real stats per module
        let totalProgress = 0;
        let totalQuestions = 0;
        let correctAnswers = 0;
        const enrichedModules = modules.map((m) => {
            const totalSections = m.sections.length;
            const completed = completedModuleSections.get(m.id) || 0;
            const progress = totalSections > 0 ? Math.round((completed / totalSections) * 100) : 0;
            let moduleQuestions = 0;
            let moduleCorrect = 0;
            m.sections.forEach((s) => {
                s.questions.forEach((q) => {
                    moduleQuestions++;
                    totalQuestions++;
                    if (attemptMap.get(q.id)) {
                        moduleCorrect++;
                        correctAnswers++;
                    }
                });
            });
            // Determine status
            let status = 'in_progress';
            if (progress === 100)
                status = 'completed';
            else if (progress === 0 && completed === 0)
                status = 'in_progress'; // All unlocked now
            totalProgress += progress;
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                status,
                progress,
                totalLessons: totalSections,
                completedLessons: completed,
                assessmentUrl: m.assessmentUrl,
                sections: m.sections,
                quizScore: moduleQuestions > 0 ? Math.round((moduleCorrect / moduleQuestions) * 100) : 0
            };
        });
        const overallProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;
        const avgQuizScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const { passwordHash: _, ...userData } = user;
        res.json({
            user: userData,
            modules: enrichedModules,
            stats: {
                overallProgress,
                completedModules: enrichedModules.filter((m) => m.status === 'completed').length,
                totalModules: modules.length,
                avgQuizScore,
                mentorName: user.mentor?.name || 'Unassigned'
            }
        });
    }
    catch (error) {
        console.error('Error fetching candidate dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch candidate dashboard' });
    }
});
exports.default = router;
