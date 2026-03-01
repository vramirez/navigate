---
id: TASK-7
title: Create server/index.js — Express entry point
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
dependencies:
  - TASK-6
  - TASK-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mount all routes, configure CORS, serve client static files, start server on PORT from env.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Server starts without errors on node server/index.js
- [ ] #2 Serves client/admin/ at /admin
- [ ] #3 Serves client/app/ at /
- [ ] #4 All API routes mounted under /api
<!-- AC:END -->
