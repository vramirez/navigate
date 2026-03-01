'use strict';

const express = require('express');
const db = require('../db');
const { requireBusinessOwner } = require('../middleware/auth');

const router = express.Router();

// GET /api/feed?page=1&limit=20
router.get('/', requireBusinessOwner, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const page  = Math.max(parseInt(req.query.page)  || 1, 1);
  const offset = (page - 1) * limit;

  const total = db.prepare(`
    SELECT COUNT(DISTINCT a.id) AS n
    FROM articles a
    JOIN article_cities ac ON a.id = ac.article_id
    JOIN article_business_types abt ON a.id = abt.article_id
    JOIN businesses b ON b.city_id = ac.city_id
                     AND b.business_type_id = abt.business_type_id
    WHERE b.user_id = ?
  `).get(req.user.userId).n;

  const articles = db.prepare(`
    SELECT DISTINCT a.*
    FROM articles a
    JOIN article_cities ac ON a.id = ac.article_id
    JOIN article_business_types abt ON a.id = abt.article_id
    JOIN businesses b ON b.city_id = ac.city_id
                     AND b.business_type_id = abt.business_type_id
    WHERE b.user_id = ?
    ORDER BY a.event_date ASC NULLS LAST, a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.userId, limit, offset);

  res.json({ articles, total, page, limit, pages: Math.ceil(total / limit) });
});

module.exports = router;
