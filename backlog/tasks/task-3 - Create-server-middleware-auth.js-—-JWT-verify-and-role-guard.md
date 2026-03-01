---
id: TASK-3
title: Create server/middleware/auth.js — JWT verify and role guard
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
  - auth
dependencies:
  - TASK-2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
JWT verification middleware. Exports: requireAuth (verifies token), requireAdmin (role check), requireBusinessOwner.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 requireAuth extracts and verifies JWT from Authorization header
- [ ] #2 requireAdmin rejects non-admin users with 403
- [ ] #3 Sets req.user on success
<!-- AC:END -->
