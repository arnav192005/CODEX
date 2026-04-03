const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../utils/security');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const signupSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

router.post('/signup', async (req, res, next) => {
  try {
    const payload = signupSchema.parse(req.body);
    const email = payload.email.toLowerCase().trim();

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(payload.password);

    const createdUser = db.createUser({
      fullName: payload.fullName,
      email,
      passwordHash,
      role: 'student'
    });

    const token = signToken({ userId: createdUser.id, role: createdUser.role });

    return res.status(201).json({
      token,
      user: {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        role: createdUser.role
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const email = payload.email.toLowerCase().trim();

    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await verifyPassword(payload.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id, role: user.role });

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
