'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireBusinessOwner } = require('../middleware/auth');

const router = express.Router();

// GET /api/cities (public — needed for registration form)
router.get('/cities', (req, res) => {
  res.json(db.prepare('SELECT id, name FROM cities ORDER BY name').all());
});

// GET /api/business-types (public — needed for registration form)
router.get('/business-types', (req, res) => {
  res.json(db.prepare('SELECT id, name FROM business_types ORDER BY name').all());
});

// POST /api/register
router.post('/register', (req, res) => {
  const { email, password, businessName, cityId, businessTypeId } = req.body;

  if (!email || !password || !businessName || !cityId || !businessTypeId) {
    return res.status(400).json({ error: 'All fields required: email, password, businessName, cityId, businessTypeId' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const city = db.prepare('SELECT id FROM cities WHERE id = ?').get(cityId);
  if (!city) return res.status(400).json({ error: 'Invalid cityId' });

  const btype = db.prepare('SELECT id FROM business_types WHERE id = ?').get(businessTypeId);
  if (!btype) return res.status(400).json({ error: 'Invalid businessTypeId' });

  const hash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare(
    `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'business_owner', 'pending')`
  );
  const insertBusiness = db.prepare(
    `INSERT INTO businesses (user_id, name, city_id, business_type_id) VALUES (?, ?, ?, ?)`
  );

  const doRegister = db.transaction(() => {
    const { lastInsertRowid } = insertUser.run(email, hash);
    insertBusiness.run(lastInsertRowid, businessName, cityId, businessTypeId);
  });

  doRegister();
  res.status(201).json({ message: 'Registration successful. Await admin approval.' });
});

// POST /api/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.role === 'business_owner' && user.status !== 'active') {
    return res.status(403).json({ error: 'Account pending approval or rejected' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, role: user.role });
});

// GET /api/profile
router.get('/profile', requireBusinessOwner, (req, res) => {
  const row = db.prepare(`
    SELECT b.id, b.name, b.city_id, b.business_type_id,
           c.name AS city_name, bt.name AS business_type_name
    FROM businesses b
    JOIN cities c ON c.id = b.city_id
    JOIN business_types bt ON bt.id = b.business_type_id
    WHERE b.user_id = ?
  `).get(req.user.userId);
  if (!row) return res.status(404).json({ error: 'Business profile not found' });
  res.json(row);
});

// PATCH /api/profile
router.patch('/profile', requireBusinessOwner, (req, res) => {
  const { businessName, cityId, businessTypeId } = req.body;
  if (!businessName && !cityId && !businessTypeId) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  if (cityId) {
    const city = db.prepare('SELECT id FROM cities WHERE id = ?').get(cityId);
    if (!city) return res.status(400).json({ error: 'Invalid cityId' });
  }
  if (businessTypeId) {
    const btype = db.prepare('SELECT id FROM business_types WHERE id = ?').get(businessTypeId);
    if (!btype) return res.status(400).json({ error: 'Invalid businessTypeId' });
  }

  const fields = [];
  const params = [];
  if (businessName) { fields.push('name = ?'); params.push(businessName); }
  if (cityId)       { fields.push('city_id = ?'); params.push(cityId); }
  if (businessTypeId) { fields.push('business_type_id = ?'); params.push(businessTypeId); }
  params.push(req.user.userId);

  db.prepare(`UPDATE businesses SET ${fields.join(', ')} WHERE user_id = ?`).run(...params);
  res.json({ message: 'Profile updated' });
});

module.exports = router;
