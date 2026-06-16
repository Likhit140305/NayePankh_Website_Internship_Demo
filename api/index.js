// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Normalization Middleware: ensure req.url matches original client URL for Express routing
app.use((req, res, next) => {
  if (req.originalUrl) {
    req.url = req.originalUrl;
  }
  next();
});

// API Routes (mounted with /api prefix as requested by clients)
app.use('/api/auth',       require('../routes/auth'));
app.use('/api/volunteers', require('../routes/volunteers'));
app.use('/api/programs',   require('../routes/programs'));
app.use('/api/stats',      require('../routes/stats'));
app.use('/api/ai',         require('../routes/ai'));

// API Docs (inline)
app.get('/api', (req, res) => {
  res.json({
    name: 'NayePankh Foundation API',
    version: '1.0.0',
    description: 'Volunteer Information Management System (Serverless)',
    defaultCredentials: {
      email: 'admin@nayepankh.com',
      password: 'admin@123',
    },
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
