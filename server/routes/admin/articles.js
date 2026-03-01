'use strict';

const express = require('express');
const db = require('../../db');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/articles
router.get('/', requireAdmin, (req, res) => {
  const articles = db.prepare(
    'SELECT * FROM articles ORDER BY created_at DESC'
  ).all();

  // Attach city and business type tags
  const getCities = db.prepare(
    `SELECT c.id, c.name FROM cities c
     JOIN article_cities ac ON ac.city_id = c.id
     WHERE ac.article_id = ?`
  );
  const getTypes = db.prepare(
    `SELECT bt.id, bt.name FROM business_types bt
     JOIN article_business_types abt ON abt.business_type_id = bt.id
     WHERE abt.article_id = ?`
  );

  const result = articles.map(a => ({
    ...a,
    cities: getCities.all(a.id),
    business_types: getTypes.all(a.id),
  }));

  res.json(result);
});

// POST /api/admin/articles
router.post('/', requireAdmin, (req, res) => {
  const { url, title, description, event_date, language = 'es', cityIds, businessTypeIds } = req.body;

  if (!title) return res.status(400).json({ error: 'title required' });
  if (!Array.isArray(cityIds) || cityIds.length === 0) {
    return res.status(400).json({ error: 'cityIds must be a non-empty array' });
  }
  if (!Array.isArray(businessTypeIds) || businessTypeIds.length === 0) {
    return res.status(400).json({ error: 'businessTypeIds must be a non-empty array' });
  }

  const insertArticle = db.prepare(
    `INSERT INTO articles (url, title, description, event_date, language, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertCity = db.prepare(
    'INSERT INTO article_cities (article_id, city_id) VALUES (?, ?)'
  );
  const insertType = db.prepare(
    'INSERT INTO article_business_types (article_id, business_type_id) VALUES (?, ?)'
  );

  const doInsert = db.transaction(() => {
    const { lastInsertRowid: articleId } = insertArticle.run(
      url || null, title, description || null, event_date || null, language, req.user.userId
    );
    for (const cityId of cityIds) insertCity.run(articleId, cityId);
    for (const typeId of businessTypeIds) insertType.run(articleId, typeId);
    return articleId;
  });

  const articleId = doInsert();
  res.status(201).json({ id: articleId, message: 'Article created' });
});

// DELETE /api/admin/articles/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Article not found' });
  res.json({ message: 'Article deleted' });
});

module.exports = router;
