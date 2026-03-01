'use strict';

const express = require('express');
const db = require('../db');
const { requireBusinessOwner } = require('../middleware/auth');

const router = express.Router();

// GET /api/feed
router.get('/', requireBusinessOwner, (req, res) => {
  const articles = db.prepare(`
    SELECT DISTINCT a.*
    FROM articles a
    JOIN article_cities ac ON a.id = ac.article_id
    JOIN article_business_types abt ON a.id = abt.article_id
    JOIN businesses b ON b.city_id = ac.city_id
                     AND b.business_type_id = abt.business_type_id
    WHERE b.user_id = ?
    ORDER BY a.event_date ASC NULLS LAST, a.created_at DESC
  `).all(req.user.userId);

  res.json(articles);
});

module.exports = router;
