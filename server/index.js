'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin/users', adminUsers);
app.use('/api/admin/cities', adminCities);
app.use('/api/admin/business-types', adminBusinessTypes);
app.use('/api/admin/articles', adminArticles);

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
