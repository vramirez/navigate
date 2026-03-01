'use strict';

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/navigate.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'business_owner')),
    status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL DEFAULT 'Colombia'
  );

  CREATE TABLE IF NOT EXISTS business_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    name TEXT NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT,
    language TEXT NOT NULL CHECK(language IN ('es', 'en')) DEFAULT 'es',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS article_cities (
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    PRIMARY KEY (article_id, city_id)
  );

  CREATE TABLE IF NOT EXISTS article_business_types (
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    PRIMARY KEY (article_id, business_type_id)
  );
`);

// ── Seed Data ────────────────────────────────────────────────────────────────

function seedCities() {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO cities (name, country) VALUES (?, ?)'
  );
  const cities = ['Barranquilla', 'Medellin', 'Bogota', 'Bucaramanga'];
  for (const name of cities) {
    insert.run(name, 'Colombia');
  }
}

function seedBusinessTypes() {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO business_types (name) VALUES (?)'
  );
  for (const name of ['pub', 'cafeteria', 'libreria']) {
    insert.run(name);
  }
}

function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    `INSERT INTO users (email, password_hash, role, status)
     VALUES (?, ?, 'admin', 'active')`
  ).run(email, hash);
  console.log(`Admin user seeded: ${email}`);
}

seedCities();
seedBusinessTypes();
seedAdmin();

module.exports = db;
