const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const auth = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', auth, (req, res) => {
  const admin = db.prepare('SELECT id, name, email, created_at FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found.' });
  res.json(admin);
});

module.exports = router;
