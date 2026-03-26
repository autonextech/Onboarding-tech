import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import multer from 'multer';
import * as XLSX from 'xlsx';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/users — All users with mentor info
router.get('/', async (req, res) => {
  try {
    const users = await (prisma.user as any).findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, isActive: true, mentorId: true,
        mentor: { select: { id: true, name: true, email: true } },
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/mentors — Only mentors (for dropdowns)
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await (prisma.user as any).findMany({
      where: { role: 'MENTOR', isActive: true },
      select: { id: true, name: true, email: true, department: true }
    });
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// GET /api/users/sample-excel — Download sample Excel template for bulk import
router.get('/sample-excel', (req, res) => {
  const wb = XLSX.utils.book_new();
  const data = [
    ['name', 'email', 'password', 'role', 'department'],
    ['John Doe', 'john@company.com', 'Pass@123', 'CANDIDATE', 'Engineering'],
    ['Jane Smith', 'jane@company.com', 'Pass@123', 'CANDIDATE', 'Marketing'],
    ['Mike Johnson', 'mike@company.com', 'Pass@123', 'MENTOR', 'Engineering'],
    ['Sarah Lee', 'sarah@company.com', 'Pass@123', 'MENTOR', 'HR'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=autonex_users_sample.xlsx');
  res.send(buf);
});

// POST /api/users/bulk-import — Import users from Excel
router.post('/bulk-import', upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    if (rows.length === 0) return res.status(400).json({ error: 'Empty spreadsheet' });

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const name = row.name?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();
      const password = row.password?.toString().trim();
      const role = row.role?.toString().trim().toUpperCase();
      const department = row.department?.toString().trim() || null;

      if (!name || !email || !password || !role) {
        errors.push(`Skipped row: missing required field (name/email/password/role)`);
        skipped++;
        continue;
      }
      if (role !== 'CANDIDATE' && role !== 'MENTOR') {
        errors.push(`Skipped ${email}: role must be CANDIDATE or MENTOR`);
        skipped++;
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errors.push(`Skipped ${email}: already exists`);
        skipped++;
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await prisma.user.create({ data: { name, email, passwordHash, role, department } });
      created++;
    }

    res.json({ message: `Import complete: ${created} created, ${skipped} skipped`, created, skipped, errors });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// POST /api/users — Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await (prisma.user as any).create({
      data: { name, email, passwordHash, role, department },
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true }
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id/assign-mentor
router.put('/:id/assign-mentor', async (req, res) => {
  try {
    const { mentorId } = req.body;
    const updated = await (prisma.user as any).update({
      where: { id: req.params.id },
      data: { mentorId: mentorId || null },
      select: { id: true, name: true, mentorId: true, mentor: { select: { id: true, name: true } } }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({ error: 'Failed to assign mentor' });
  }
});

// PUT /api/users/:id/toggle-active
router.put('/:id/toggle-active', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await (prisma.user as any).update({
      where: { id: req.params.id },
      data: { isActive: !(user as any).isActive },
      select: { id: true, name: true, isActive: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
