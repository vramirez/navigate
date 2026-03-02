'use strict';

require('dotenv').config();

// Fail fast on missing required env vars
const required = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize DB (runs schema + seed on first start)
require('./db');

const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');
const adminUsers = require('./routes/admin/users');
const adminCities = require('./routes/admin/cities');
const adminBusinessTypes = require('./routes/admin/business-types');
const adminArticles = require('./routes/admin/articles');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Rate limit auth endpoints: 10 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera un minuto.' },
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// API routes
app.use('/api', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin/users', adminUsers);
app.use('/api/admin/cities', adminCities);
app.use('/api/admin/business-types', adminBusinessTypes);
app.use('/api/admin/articles', adminArticles);

// 404 for unmatched API routes (must come before SPA fallback)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serve client apps
app.use('/admin', express.static(path.join(__dirname, '../client/admin')));
app.use('/', express.static(path.join(__dirname, '../client/app')));

// Fallback for SPA routing (Express 5 requires named wildcards)
app.get('/admin/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin/index.html'));
});
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/app/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Navigate running on http://localhost:${PORT}`);
});
