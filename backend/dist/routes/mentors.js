"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// GET /api/mentors/:id/mentees
router.get('/:id/mentees', async (req, res) => {
    try {
        const mentees = await prisma_1.default.user.findMany({
            where: { mentorId: req.params.id, role: 'CANDIDATE' },
            include: {
                progress: true,
                quizAttempts: true,
            }
        });
        const detailedMentees = mentees.map((mentee) => {
            // Create lookup sets
            const completedModulesCount = new Set((mentee.progress || []).map((p) => p.moduleId)).size;
            const totalCorrectQuizzes = (mentee.quizAttempts || []).filter((q) => q.isCorrect).length;
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
    }
    catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ error: 'Failed to fetch mentees' });
    }
});
exports.default = router;
