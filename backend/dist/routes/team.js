"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma")); // ✅ Use shared singleton - not a new PrismaClient
const multer_1 = __importDefault(require("multer"));
const XLSX = __importStar(require("xlsx"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Simple in-memory TTL cache (30 seconds)
let teamCache = null;
const CACHE_TTL = 30000;
// GET all team members
router.get('/', async (req, res) => {
    try {
        const now = Date.now();
        if (teamCache && now - teamCache.ts < CACHE_TTL) {
            return res.json(teamCache.data);
        }
        const team = await prisma_1.default.teamMember.findMany({
            orderBy: [{ department: 'asc' }, { name: 'asc' }]
        });
        teamCache = { data: team, ts: now };
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});
// GET /api/team/sample-excel — Download sample Excel template for bulk import
router.get('/sample-excel', (req, res) => {
    const wb = XLSX.utils.book_new();
    const data = [
        ['name', 'role', 'department', 'email', 'linkedin', 'slack'],
        ['Emily Rodriguez', 'HR Business Partner', 'Human Resources', 'emily@company.com', 'https://linkedin.com/in/emilyrodriguez', 'https://workspace.slack.com/team/U123456'],
        ['Raj Malhotra', 'Engineering Manager', 'Engineering', 'raj@company.com', '', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
        { wch: 24 },
        { wch: 24 },
        { wch: 22 },
        { wch: 28 },
        { wch: 42 },
        { wch: 42 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Team Members');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=autonex_team_sample.xlsx');
    res.send(buf);
});
// POST /api/team/bulk-import — Import team members from Excel
router.post('/bulk-import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Empty spreadsheet' });
        }
        const errors = [];
        const membersToCreate = [];
        for (const row of rows) {
            const name = row.name?.toString().trim();
            const role = row.role?.toString().trim();
            const department = row.department?.toString().trim();
            const email = row.email?.toString().trim() || null;
            const linkedin = row.linkedin?.toString().trim() || null;
            const slack = row.slack?.toString().trim() || null;
            if (!name || !role || !department) {
                errors.push(`Skipped row: name, role, and department are required`);
                continue;
            }
            membersToCreate.push({ name, role, department, email, linkedin, slack });
        }
        if (membersToCreate.length === 0) {
            return res.status(400).json({ error: 'No valid rows found', errors });
        }
        await prisma_1.default.teamMember.createMany({
            data: membersToCreate
        });
        teamCache = null;
        res.json({
            message: `Import complete: ${membersToCreate.length} created, ${errors.length} skipped`,
            created: membersToCreate.length,
            skipped: errors.length,
            errors
        });
    }
    catch (error) {
        console.error('Team bulk import error:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});
// POST new team member
router.post('/', async (req, res) => {
    try {
        const { name, role, department, email, linkedin, slack } = req.body;
        if (!name || !role || !department) {
            return res.status(400).json({ error: 'Name, role, and department are required' });
        }
        const member = await prisma_1.default.teamMember.create({
            data: { name, role, department, email: email || null, linkedin: linkedin || null, slack: slack || null }
        });
        teamCache = null; // Invalidate cache
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
        const updated = await prisma_1.default.teamMember.update({
            where: { id },
            data: { name, role, department, email: email || null, linkedin: linkedin || null, slack: slack || null }
        });
        teamCache = null; // Invalidate cache
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
        await prisma_1.default.teamMember.delete({ where: { id } });
        teamCache = null; // Invalidate cache
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});
exports.default = router;
