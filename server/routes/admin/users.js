'use strict';

const express = require('express');
const db = require('../../db');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/users?status=pending&page=1&limit=50
router.get('/', requireAdmin, (req, res) => {
  const { status } = req.query;
  const limit  = Math.min(parseInt(req.query.limit) || 50, 200);
  const page   = Math.max(parseInt(req.query.page)  || 1, 1);
  const offset = (page - 1) * limit;

  const where = status ? `WHERE u.role = 'business_owner' AND u.status = ?` : `WHERE u.role = 'business_owner'`;
  const statusParam = status ? [status] : [];

  const total = db.prepare(`SELECT COUNT(*) AS n FROM users u ${where}`).get(...statusParam).n;

  const rows = db.prepare(`
    SELECT u.id, u.email, u.role, u.status, u.created_at,
           b.name AS business_name, c.name AS city, bt.name AS business_type
    FROM users u
    LEFT JOIN businesses b ON b.user_id = u.id
    LEFT JOIN cities c ON c.id = b.city_id
    LEFT JOIN business_types bt ON bt.id = b.business_type_id
    ${where}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...statusParam, limit, offset);

  res.json({ users: rows, total, page, limit, pages: Math.ceil(total / limit) });
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
