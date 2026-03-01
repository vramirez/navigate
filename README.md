# Navigate

B2B alert platform for small Colombian businesses. Surfaces local events from manually-submitted news articles. Business owners self-register, wait for admin approval, then see a filtered newsfeed matching their city and business type.

## Stack

- **Runtime**: Node.js + Express
- **Database**: SQLite via `better-sqlite3`
- **Auth**: JWT + bcrypt
- **Frontend**: Vanilla JS (two separate SPAs)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
node server/index.js
```

## Environment Variables

| Variable | Description |
|---|---|
| `ADMIN_EMAIL` | Superadmin email (seeded on first start) |
| `ADMIN_PASSWORD` | Superadmin password |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string |
| `PORT` | HTTP port (default: 3000) |
| `DB_PATH` | SQLite file path (default: `./data/navigate.db`) |

## URLs

- **Business app**: `http://localhost:3000/`
- **Admin panel**: `http://localhost:3000/admin`

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/register` | Register business owner (status: pending) |
| `POST` | `/api/login` | Login (admin or business owner) |
| `GET` | `/api/cities` | List cities (for registration form) |
| `GET` | `/api/business-types` | List business types (for registration form) |

### Business Owner (requires JWT)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/feed` | Newsfeed filtered by city + business type |

### Admin (requires admin JWT)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List business owners (filter: `?status=pending`) |
| `PATCH` | `/api/admin/users/:id/approve` | Approve registration |
| `PATCH` | `/api/admin/users/:id/reject` | Reject registration |
| `GET/POST/DELETE` | `/api/admin/cities` | Manage cities |
| `GET/POST/DELETE` | `/api/admin/business-types` | Manage business types |
| `GET/POST/DELETE` | `/api/admin/articles` | Manage articles |

## Flow

1. Business owner registers at `/` — status is `pending`
2. Admin logs in at `/admin` — approves or rejects registrations
3. Approved owner logs in — sees articles matching their city + business type
4. Admin adds articles with multi-select cities and business types — only matching owners see each article
