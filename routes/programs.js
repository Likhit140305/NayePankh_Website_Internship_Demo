const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/programs (PUBLIC) ───────────────────────────────────────────
router.get('/', (req, res) => {
  const programs = db.prepare('SELECT * FROM programs WHERE is_active = 1 ORDER BY created_at ASC').all();
  res.json(programs);
});

// ── POST /api/programs (PROTECTED) ──────────────────────────────────────
router.post('/', auth, (req, res) => {
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Program name is required.' });
  }

  const result = db.prepare('INSERT INTO programs (name, description, icon) VALUES (?, ?, ?)').run(name, description || null, icon || '📚');
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Program created', program });
});

// ── DELETE /api/programs/:id (PROTECTED — soft delete) ───────────────────
router.delete('/:id', auth, (req, res) => {
  const prog = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
  if (!prog) return res.status(404).json({ error: 'Program not found.' });

  db.prepare('UPDATE programs SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Program deactivated', id: parseInt(req.params.id) });
});

module.exports = router;
