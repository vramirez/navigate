---
id: TASK-5
title: Create server/routes/feed.js — newsfeed endpoint
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - backend
  - feature
dependencies:
  - TASK-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GET /api/feed — returns articles matching the authenticated business owner's city and business type using the JOIN query from the plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Returns articles filtered by user's city_id and business_type_id
- [ ] #2 Ordered by event_date ASC NULLS LAST, created_at DESC
- [ ] #3 Returns 401 if not authenticated, 403 if not business_owner
<!-- AC:END -->
