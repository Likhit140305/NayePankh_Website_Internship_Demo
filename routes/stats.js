const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/stats (PROTECTED) ──────────────────────────────────────────
router.get('/', auth, (req, res) => {
  const total      = db.prepare('SELECT COUNT(*) as c FROM volunteers').get().c;
  const active     = db.prepare("SELECT COUNT(*) as c FROM volunteers WHERE status = 'active'").get().c;
  const pending    = db.prepare("SELECT COUNT(*) as c FROM volunteers WHERE status = 'pending'").get().c;
  const inactive   = db.prepare("SELECT COUNT(*) as c FROM volunteers WHERE status = 'inactive'").get().c;
  const rejected   = db.prepare("SELECT COUNT(*) as c FROM volunteers WHERE status = 'rejected'").get().c;
  const programs   = db.prepare('SELECT COUNT(*) as c FROM programs WHERE is_active = 1').get().c;

  // Volunteers by area
  const byArea = db.prepare(`
    SELECT area, COUNT(*) as count
    FROM volunteers
    GROUP BY area
    ORDER BY count DESC
  `).all();

  // Volunteers by city (top 10)
  const byCity = db.prepare(`
    SELECT city, COUNT(*) as count
    FROM volunteers
    WHERE city IS NOT NULL AND city != ''
    GROUP BY city
    ORDER BY count DESC
    LIMIT 10
  `).all();

  // Volunteers by status
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM volunteers
    GROUP BY status
  `).all();

  // Recent registrations (last 5)
  const recent = db.prepare(`
    SELECT id, first_name, last_name, area, city, status, created_at
    FROM volunteers
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  res.json({
    summary: { total, active, pending, inactive, rejected, programs },
    byArea,
    byCity,
    byStatus,
    recent,
  });
});

module.exports = router;
