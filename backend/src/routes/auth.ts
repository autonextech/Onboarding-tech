import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-autonex-key-2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user by exact email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // If not found, return 401
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password hashes
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Omit sensitive data
    const { passwordHash: _, ...userData } = user;
    
    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
