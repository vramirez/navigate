---
id: TASK-2
title: 'Create server/db.js — schema, seed admin, cities, business types'
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
  - database
dependencies:
  - TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SQLite setup with better-sqlite3. Create all tables, seed superadmin from .env, seed 4 cities, seed 3 business types.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 6 tables created on startup
- [ ] #2 Superadmin seeded from ADMIN_EMAIL/ADMIN_PASSWORD env vars
- [ ] #3 Cities: Barranquilla, Medellin, Bogota, Bucaramanga seeded
- [ ] #4 Business types: pub, cafeteria, libreria seeded
<!-- AC:END -->
