'use strict';

const API = '';  // same-origin

function getToken() { return localStorage.getItem('nav_token'); }
function setToken(t) { localStorage.setItem('nav_token', t); }
function clearToken() { localStorage.removeItem('nav_token'); }

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function renderNav() {
  const nav = document.getElementById('nav');
  if (getToken()) {
    nav.innerHTML = `<a href="#" id="logout-btn">Salir</a>`;
    document.getElementById('logout-btn').addEventListener('click', e => {
      e.preventDefault();
      clearToken();
      route();
    });
  } else {
    nav.innerHTML = `
      <a href="#login" onclick="route()">Iniciar sesion</a>
      <a href="#register" onclick="route()">Registrarse</a>
    `;
  }
}

// ── Views ────────────────────────────────────────────────────────────────────

function viewLogin() {
  return `
    <div class="card">
      <h2 style="margin-bottom:1.5rem">Iniciar sesion</h2>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" placeholder="tu@email.com">
      </div>
      <div class="form-group">
        <label>Contrasena</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>
      <button id="login-btn">Entrar</button>
      <div id="msg"></div>
    </div>
  `;
}

function viewRegister(cities, types) {
  const cityOpts = cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const typeOpts = types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  return `
    <div class="card">
      <h2 style="margin-bottom:1.5rem">Registrar negocio</h2>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" placeholder="tu@email.com">
      </div>
      <div class="form-group">
        <label>Contrasena</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>
      <div class="form-group">
        <label>Nombre del negocio</label>
        <input type="text" id="businessName" placeholder="Mi negocio">
      </div>
      <div class="form-group">
        <label>Ciudad</label>
        <select id="cityId">${cityOpts}</select>
      </div>
      <div class="form-group">
        <label>Tipo de negocio</label>
        <select id="businessTypeId">${typeOpts}</select>
      </div>
      <button id="register-btn">Registrarse</button>
      <div id="msg"></div>
    </div>
  `;
}

function viewFeed(articles) {
  if (!articles.length) {
    return `<p style="color:#888">No hay articulos disponibles para tu negocio aun.</p>`;
  }
  return articles.map(a => `
    <div class="article">
      <h3>${a.title}</h3>
      ${a.description ? `<p>${a.description}</p>` : ''}
      <div class="meta">
        ${a.event_date ? `Fecha: ${a.event_date} &nbsp;|&nbsp;` : ''}
        Idioma: ${a.language === 'es' ? 'Espanol' : 'Ingles'}
        ${a.url ? `&nbsp;|&nbsp; <a href="${a.url}" target="_blank">Ver fuente</a>` : ''}
      </div>
    </div>
  `).join('');
}

// ── Route ────────────────────────────────────────────────────────────────────

async function route() {
  const hash = location.hash || '#';
  const app = document.getElementById('app');
  renderNav();

  if (getToken()) {
    // Authenticated: show feed
    const { ok, data } = await apiFetch('/api/feed');
    if (!ok) {
      clearToken();
      return route();
    }
    app.innerHTML = `<h2 style="margin-bottom:1rem">Tu feed de eventos</h2>` + viewFeed(data);
    return;
  }

  if (hash === '#register') {
    const [citiesRes, typesRes] = await Promise.all([
      apiFetch('/api/cities'),
      apiFetch('/api/business-types'),
    ]);
    app.innerHTML = viewRegister(citiesRes.data, typesRes.data);

    document.getElementById('register-btn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const businessName = document.getElementById('businessName').value.trim();
      const cityId = +document.getElementById('cityId').value;
      const businessTypeId = +document.getElementById('businessTypeId').value;
      const msg = document.getElementById('msg');

      const { ok, data } = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, businessName, cityId, businessTypeId }),
      });
      if (ok) {
        msg.className = 'success';
        msg.textContent = data.message;
      } else {
        msg.className = 'error';
        msg.textContent = data.error || 'Error al registrarse';
      }
    });
  } else {
    // Default: login view
    app.innerHTML = viewLogin();
    document.getElementById('login-btn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const msg = document.getElementById('msg');

      const { ok, data } = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (ok) {
        setToken(data.token);
        route();
      } else {
        msg.className = 'error';
        msg.textContent = data.error || 'Error al iniciar sesion';
      }
    });
  }
}

// Public endpoints for cities/business-types (no auth needed for registration)
// Mount them in server/index.js under /api/cities and /api/business-types

window.addEventListener('hashchange', route);
window.addEventListener('load', route);
