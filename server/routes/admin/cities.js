'use strict';

const express = require('express');
const db = require('../../db');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/cities
router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM cities ORDER BY name').all());
});

// POST /api/admin/cities
router.post('/', requireAdmin, (req, res) => {
  const { name, country = 'Colombia' } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO cities (name, country) VALUES (?, ?)'
  ).run(name, country);
  res.status(201).json({ id: lastInsertRowid, name, country });
});

// DELETE /api/admin/cities/:id
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM cities WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'City not found' });
    res.json({ message: 'City deleted' });
  } catch (err) {
    if (err.message.includes('FOREIGN KEY')) {
      return res.status(409).json({ error: 'City is in use by businesses or articles and cannot be deleted' });
    }
    throw err;
  }
});

module.exports = router;
