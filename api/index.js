// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Normalization Middleware: strip '/api' prefix if present to support all rewrites uniformly
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4);
    if (!req.url.startsWith('/')) {
      req.url = '/' + req.url;
    }
  }
  next();
});

// API Routes
app.use('/auth',       require('../routes/auth'));
app.use('/volunteers', require('../routes/volunteers'));
app.use('/programs',   require('../routes/programs'));
app.use('/stats',      require('../routes/stats'));
app.use('/ai',         require('../routes/ai'));

// API Docs (inline)
app.get('/', (req, res) => {
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
