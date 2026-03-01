'use strict';

const express = require('express');
const db = require('../../db');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/business-types
router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM business_types ORDER BY name').all());
});

// POST /api/admin/business-types
router.post('/', requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO business_types (name) VALUES (?)'
  ).run(name);
  res.status(201).json({ id: lastInsertRowid, name });
});

// DELETE /api/admin/business-types/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM business_types WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Business type not found' });
  res.json({ message: 'Business type deleted' });
});

module.exports = router;
