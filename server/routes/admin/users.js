'use strict';

const express = require('express');
const db = require('../../db');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/users?status=pending
router.get('/', requireAdmin, (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT u.id, u.email, u.role, u.status, u.created_at,
           b.name AS business_name, c.name AS city, bt.name AS business_type
    FROM users u
    LEFT JOIN businesses b ON b.user_id = u.id
    LEFT JOIN cities c ON c.id = b.city_id
    LEFT JOIN business_types bt ON bt.id = b.business_type_id
    WHERE u.role = 'business_owner'
  `;
  const params = [];
  if (status) {
    query += ' AND u.status = ?';
    params.push(status);
  }
  query += ' ORDER BY u.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// PATCH /api/admin/users/:id/approve
router.patch('/:id/approve', requireAdmin, (req, res) => {
  const result = db.prepare(
    `UPDATE users SET status = 'active' WHERE id = ? AND role = 'business_owner'`
  ).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User approved' });
});

// PATCH /api/admin/users/:id/reject
router.patch('/:id/reject', requireAdmin, (req, res) => {
  const result = db.prepare(
    `UPDATE users SET status = 'rejected' WHERE id = ? AND role = 'business_owner'`
  ).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User rejected' });
});

module.exports = router;
