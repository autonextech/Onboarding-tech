import { Router } from 'express';
import prisma from '../lib/prisma'; // ✅ Use shared singleton - not a new PrismaClient

const router = Router();

// Simple in-memory TTL cache (30 seconds)
let teamCache: { data: any; ts: number } | null = null;
const CACHE_TTL = 30_000;

// GET all team members
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (teamCache && now - teamCache.ts < CACHE_TTL) {
      return res.json(teamCache.data);
    }
    const team = await (prisma as any).teamMember.findMany({
      orderBy: [{ department: 'asc' }, { name: 'asc' }]
    });
    teamCache = { data: team, ts: now };
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST new team member
router.post('/', async (req, res) => {
  try {
    const { name, role, department, email, linkedin, slack } = req.body;
    if (!name || !role || !department) {
      return res.status(400).json({ error: 'Name, role, and department are required' });
    }
    const member = await (prisma as any).teamMember.create({
      data: { name, role, department, email: email || null, linkedin: linkedin || null, slack: slack || null }
    });
    teamCache = null; // Invalidate cache
    res.status(201).json(member);
  } catch (error) {
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
    const updated = await (prisma as any).teamMember.update({
      where: { id },
      data: { name, role, department, email: email || null, linkedin: linkedin || null, slack: slack || null }
    });
    teamCache = null; // Invalidate cache
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE a team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await (prisma as any).teamMember.delete({ where: { id } });
    teamCache = null; // Invalidate cache
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
