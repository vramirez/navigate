---
id: TASK-8
title: Build client/app/ — business owner SPA
status: To Do
assignee: []
created_date: '2026-03-01 16:58'
labels:
  - frontend
dependencies:
  - TASK-7
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Vanilla JS SPA with 3 views: Register (email, password, businessName, city dropdown, business type dropdown), Login, Newsfeed (list of articles). Uses fetch() against the API.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Register form POSTs to /api/register and shows success message
- [ ] #2 Login form POSTs to /api/login, stores JWT in localStorage
- [ ] #3 Newsfeed view fetches /api/feed with auth header and renders articles
- [ ] #4 Unauthenticated users redirected to login
<!-- AC:END -->
