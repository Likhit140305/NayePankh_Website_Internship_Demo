const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ── POST /api/volunteers/register (PUBLIC) ───────────────────────────────
router.post('/register', (req, res) => {
  const { first_name, last_name, email, phone, city, college, area, availability, motivation } = req.body;

  if (!first_name || !last_name || !email || !area) {
    return res.status(400).json({ error: 'first_name, last_name, email, and area are required.' });
  }

  // Check duplicate email
  const existing = db.prepare('SELECT id FROM volunteers WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'A volunteer with this email already exists.' });
  }

  const result = db.prepare(`
    INSERT INTO volunteers (first_name, last_name, email, phone, city, college, area, availability, motivation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(first_name, last_name, email, phone || null, city || null, college || null, area, availability || null, motivation || null);

  const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Volunteer registered successfully', volunteer });
});

// ── GET /api/volunteers (PROTECTED — with search, filter, pagination) ────
router.get('/', auth, (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE 1=1';
  const params = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    where += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR city LIKE ? OR college LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q, q);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM volunteers ${where}`).get(...params);
  const total = countRow.total;

  const volunteers = db.prepare(`
    SELECT * FROM volunteers ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({
    volunteers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ── GET /api/volunteers/export/csv (PROTECTED) ──────────────────────────
router.get('/export/csv', auth, (req, res) => {
  const volunteers = db.prepare('SELECT * FROM volunteers ORDER BY created_at DESC').all();

  const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'City', 'College', 'Area', 'Availability', 'Motivation', 'Status', 'Created At'];
  const rows = volunteers.map(v =>
    [v.id, v.first_name, v.last_name, v.email, v.phone || '', v.city || '', v.college || '', v.area, v.availability || '', (v.motivation || '').replace(/"/g, '""'), v.status, v.created_at]
      .map(x => `"${x}"`)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=nayepankh_volunteers.csv');
  res.send(csv);
});

// ── GET /api/volunteers/:id (PROTECTED) ──────────────────────────────────
router.get('/:id', auth, (req, res) => {
  const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' });
  res.json(volunteer);
});

// ── PUT /api/volunteers/:id (PROTECTED) ──────────────────────────────────
router.put('/:id', auth, (req, res) => {
  const vol = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found.' });

  const { first_name, last_name, email, phone, city, college, area, availability, motivation } = req.body;

  db.prepare(`
    UPDATE volunteers SET
      first_name = COALESCE(?, first_name),
      last_name  = COALESCE(?, last_name),
      email      = COALESCE(?, email),
      phone      = COALESCE(?, phone),
      city       = COALESCE(?, city),
      college    = COALESCE(?, college),
      area       = COALESCE(?, area),
      availability = COALESCE(?, availability),
      motivation = COALESCE(?, motivation),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    first_name || null, last_name || null, email || null,
    phone || null, city || null, college || null,
    area || null, availability || null, motivation || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  res.json({ message: 'Volunteer updated', volunteer: updated });
});

// ── PATCH /api/volunteers/:id/status (PROTECTED) ─────────────────────────
router.patch('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'pending', 'inactive', 'rejected'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const vol = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found.' });

  db.prepare('UPDATE volunteers SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);

  const updated = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  res.json({ message: `Status updated to "${status}"`, volunteer: updated });
});

// ── DELETE /api/volunteers/:id (PROTECTED) ───────────────────────────────
router.delete('/:id', auth, (req, res) => {
  const vol = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found.' });

  db.prepare('DELETE FROM volunteers WHERE id = ?').run(req.params.id);
  res.json({ message: 'Volunteer deleted', id: parseInt(req.params.id) });
});

module.exports = router;
