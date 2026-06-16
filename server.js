// src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/programs',   require('./routes/programs'));
app.use('/api/stats',      require('./routes/stats'));
app.use('/api/ai',         require('./routes/ai'));

// ── API Docs (inline) ───────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    name: 'NayePankh Foundation API',
    version: '1.0.0',
    description: 'Volunteer Information Management System',
    endpoints: {
      auth: {
        'POST /api/auth/login':  'Login → returns JWT token',
        'GET  /api/auth/me':     'Get current admin (protected)',
      },
      volunteers: {
        'POST /api/volunteers/register':          'Register new volunteer (public)',
        'GET  /api/volunteers':                   'List volunteers (protected, supports ?status=&search=&page=&limit=)',
        'GET  /api/volunteers/:id':               'Get volunteer by ID (protected)',
        'PUT  /api/volunteers/:id':               'Update volunteer (protected)',
        'PATCH /api/volunteers/:id/status':       'Update status (protected)',
        'DELETE /api/volunteers/:id':             'Delete volunteer (protected)',
        'GET  /api/volunteers/export/csv':        'Export all as CSV (protected)',
      },
      programs: {
        'GET  /api/programs':      'List programs (public)',
        'POST /api/programs':      'Create program (protected)',
        'DELETE /api/programs/:id':'Deactivate program (protected)',
      },
      stats: {
        'GET /api/stats': 'Dashboard summary stats (protected)',
      },
    },
    defaultCredentials: {
      email: 'admin@nayepankh.com',
      password: 'admin@123',
    },
  });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌱 NayePankh Backend running at http://localhost:${PORT}`);
    console.log(`📖 API docs at http://localhost:${PORT}/api\n`);
  });
}

module.exports = app;
