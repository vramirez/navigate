---
id: TASK-4
title: Create server/routes/auth.js — register and login endpoints
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
  - auth
dependencies:
  - TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
POST /api/register (creates pending business owner + business record), POST /api/login (returns JWT). Registration takes: email, password, businessName, cityId, businessTypeId.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 POST /api/register creates user with status=pending and linked business
- [ ] #2 POST /api/login returns signed JWT with userId and role
- [ ] #3 Admin can also login via /api/login
- [ ] #4 Returns 401 on bad credentials, 400 on missing fields
<!-- AC:END -->
