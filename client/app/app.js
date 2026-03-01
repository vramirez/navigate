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
  if (res.status === 401) {
    clearToken();
    route();
    return { ok: false, status: 401, data };
  }
  return { ok: res.ok, status: res.status, data };
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function renderNav(active) {
  const nav = document.getElementById('nav');
  if (getToken()) {
    nav.innerHTML = `
      <a href="#feed" class="${active === '#feed' ? 'active' : ''}">Feed</a>
      <a href="#profile" class="${active === '#profile' ? 'active' : ''}">Mi negocio</a>
      <a href="#" id="logout-btn">Salir</a>
    `;
    document.getElementById('logout-btn').addEventListener('click', e => {
      e.preventDefault();
      clearToken();
      location.hash = '';
      route();
    });
  } else {
    nav.innerHTML = `
      <a href="#login">Iniciar sesion</a>
      <a href="#register">Registrarse</a>
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

function viewFeed({ articles, page, pages }) {
  const list = articles.length
    ? articles.map(a => `
        <div class="article">
          <h3>${a.title}</h3>
          ${a.description ? `<p>${a.description}</p>` : ''}
          <div class="meta">
            ${a.event_date ? `Fecha: ${a.event_date} &nbsp;|&nbsp;` : ''}
            Idioma: ${a.language === 'es' ? 'Espanol' : 'Ingles'}
            ${a.url ? `&nbsp;|&nbsp; <a href="${a.url}" target="_blank">Ver fuente</a>` : ''}
          </div>
        </div>
      `).join('')
    : `<p style="color:#888">No hay articulos disponibles para tu negocio aun.</p>`;

  const pagination = pages > 1 ? `
    <div class="pagination">
      ${page > 1 ? `<a href="#feed?page=${page - 1}" class="page-btn">Anterior</a>` : ''}
      <span>Pagina ${page} de ${pages}</span>
      ${page < pages ? `<a href="#feed?page=${page + 1}" class="page-btn">Siguiente</a>` : ''}
    </div>
  ` : '';

  return `<h2 style="margin-bottom:1rem">Tu feed de eventos</h2>${list}${pagination}`;
}

function viewProfile(profile, cities, types) {
  const cityOpts = cities.map(c =>
    `<option value="${c.id}" ${c.id === profile.city_id ? 'selected' : ''}>${c.name}</option>`
  ).join('');
  const typeOpts = types.map(t =>
    `<option value="${t.id}" ${t.id === profile.business_type_id ? 'selected' : ''}>${t.name}</option>`
  ).join('');
  return `
    <div class="card">
      <h2 style="margin-bottom:1.5rem">Mi negocio</h2>
      <div class="form-group">
        <label>Nombre del negocio</label>
        <input type="text" id="businessName" value="${profile.name}">
      </div>
      <div class="form-group">
        <label>Ciudad</label>
        <select id="cityId">${cityOpts}</select>
      </div>
      <div class="form-group">
        <label>Tipo de negocio</label>
        <select id="businessTypeId">${typeOpts}</select>
      </div>
      <button id="save-btn">Guardar cambios</button>
      <div id="msg"></div>
    </div>
  `;
}

// ── Route ────────────────────────────────────────────────────────────────────

async function route() {
  // Parse hash and optional query string: e.g. #feed?page=2
  const raw = location.hash || '#';
  const [hashPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart || '');
  const app = document.getElementById('app');

  if (!getToken()) {
    renderNav(null);
    if (hashPart === '#register') {
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
        msg.className = ok ? 'success' : 'error';
        msg.textContent = ok ? data.message : (data.error || 'Error al registrarse');
      });
    } else {
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
          location.hash = '#feed';
          route();
        } else {
          msg.className = 'error';
          msg.textContent = data.error || 'Error al iniciar sesion';
        }
      });
    }
    return;
  }

  if (hashPart === '#profile') {
    renderNav('#profile');
    const [profileRes, citiesRes, typesRes] = await Promise.all([
      apiFetch('/api/profile'),
      apiFetch('/api/cities'),
      apiFetch('/api/business-types'),
    ]);
    app.innerHTML = viewProfile(profileRes.data, citiesRes.data, typesRes.data);

    document.getElementById('save-btn').addEventListener('click', async () => {
      const businessName = document.getElementById('businessName').value.trim();
      const cityId = +document.getElementById('cityId').value;
      const businessTypeId = +document.getElementById('businessTypeId').value;
      const msg = document.getElementById('msg');

      const { ok, data } = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ businessName, cityId, businessTypeId }),
      });
      msg.className = ok ? 'success' : 'error';
      msg.textContent = ok ? data.message : (data.error || 'Error al guardar');
    });

  } else {
    // Default: feed
    renderNav('#feed');
    const page = parseInt(params.get('page')) || 1;
    const { ok, data } = await apiFetch(`/api/feed?page=${page}`);
    if (!ok) return; // apiFetch handles 401 redirect
    app.innerHTML = viewFeed(data);

    // Re-attach pagination link handlers without a full page reload
    document.querySelectorAll('.page-btn').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        location.hash = a.getAttribute('href').slice(1);
        route();
      });
    });
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);
