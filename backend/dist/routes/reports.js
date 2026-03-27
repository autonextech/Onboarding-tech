"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Helper to get full report data
async function getReportsData() {
    // OPTIMIZATION: Run both queries in parallel with Promise.all
    const [candidates, modules] = await Promise.all([
        prisma_1.default.user.findMany({
            where: { role: 'CANDIDATE' },
            include: {
                progress: true,
                quizAttempts: true
            }
        }),
        prisma_1.default.module.findMany({
            where: { status: { in: ['published', 'PUBLISHED', 'Published'] } },
            include: { sections: { include: { questions: true } } }
        })
    ]);
    const reports = candidates.map((candidate) => {
        // OPTIMIZATION: Build hash maps for O(1) lookups instead of O(n) .filter()/.find()
        const progressByModule = new Map();
        for (const p of (candidate.progress || [])) {
            progressByModule.set(p.moduleId, (progressByModule.get(p.moduleId) || 0) + 1);
        }
        const attemptsByQuestion = new Map();
        for (const a of (candidate.quizAttempts || [])) {
            attemptsByQuestion.set(a.questionId, a);
        }
        let totalProgress = 0;
        let totalScore = 0;
        const moduleStats = modules.map((mod) => {
            const totalSections = mod.sections.length;
            const completedSections = progressByModule.get(mod.id) || 0;
            const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
            let correctAnswers = 0;
            let totalQuestions = 0;
            mod.sections.forEach((sec) => {
                totalQuestions += sec.questions.length;
                sec.questions.forEach((q) => {
                    const attempt = attemptsByQuestion.get(q.id);
                    if (attempt && attempt.isCorrect)
                        correctAnswers++;
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
router.get('/', async (req, res) => {
    try {
        const reports = await getReportsData();
        res.json(reports);
    }
    catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});
// GET /api/reports/export
router.get('/export', async (req, res) => {
    try {
        const reports = await getReportsData();
        let csv = 'Candidate Name,Email,Department,Overall Progress %,Overall MCQ Score %\n';
        reports.forEach((r) => {
            csv += `"${r.name}","${r.email}","${r.department}",${r.overallProgress},${r.overallScore}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=autonex_candidates_report.csv');
        res.status(200).send(csv);
    }
    catch (error) {
        console.error('Error exporting reports:', error);
        res.status(500).json({ error: 'Failed to export reports file' });
    }
});
exports.default = router;
