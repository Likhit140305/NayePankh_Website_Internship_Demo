// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Normalization Middleware: ensure req.url matches original client URL and strip '/api' prefix
app.use((req, res, next) => {
  // Use req.originalUrl if present to bypass Vercel serverless rewrite modifications
  const originalUrl = req.originalUrl || req.url;
  
  // Strip any query strings temporarily to check the path
  const urlParts = originalUrl.split('?');
  let path = urlParts[0];
  const query = urlParts[1] ? '?' + urlParts[1] : '';

  if (path.startsWith('/api')) {
    path = path.substring(4);
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Restore normalized url back to req.url for Express routing
  req.url = path + query;
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
