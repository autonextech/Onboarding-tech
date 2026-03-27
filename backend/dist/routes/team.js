"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all team members (public to candidates & mentors)
router.get('/', async (req, res) => {
    try {
        const team = await prisma.teamMember.findMany({
            orderBy: [
                { department: 'asc' },
                { name: 'asc' }
            ]
        });
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});
// POST new team member (admin only ideally, but we'll secure it based on middleware in the future)
router.post('/', async (req, res) => {
    try {
        const { name, role, department, email, linkedin, slack } = req.body;
        if (!name || !role || !department) {
            return res.status(400).json({ error: 'Name, role, and department are required' });
        }
        const member = await prisma.teamMember.create({
            data: {
                name,
                role,
                department,
                email,
                linkedin,
                slack
            }
        });
        res.status(201).json(member);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add team member' });
    }
});
// PUT /api/team/:id - Edit a team member
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, department, email, linkedin, slack } = req.body;
        if (!name || !role || !department) {
            return res.status(400).json({ error: 'Name, role, and department are required' });
        }
        const updated = await prisma.teamMember.update({
            where: { id },
            data: { name, role, department, email: email || null, linkedin: linkedin || null, slack: slack || null }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update team member' });
    }
});
// DELETE a team member
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.teamMember.delete({
            where: { id }
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});
exports.default = router;
