---
id: TASK-6
title: 'Create server/routes/admin/ — users, cities, business-types, articles routes'
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
  - admin
dependencies:
  - TASK-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
4 admin route files: users.js (GET pending, PATCH approve/reject), cities.js (GET all, POST create, DELETE), business-types.js (GET all, POST, DELETE), articles.js (GET all, POST with multi-city/type, DELETE)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET /api/admin/users?status=pending returns pending users
- [ ] #2 PATCH /api/admin/users/:id/approve sets status=active
- [ ] #3 PATCH /api/admin/users/:id/reject sets status=rejected
- [ ] #4 CRUD for cities and business-types
- [ ] #5 POST /api/admin/articles inserts article + junction table rows for cities and types
<!-- AC:END -->
