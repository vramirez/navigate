'use strict';

const API = '/api';

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getToken() { return localStorage.getItem('nav_admin_token'); }
function setToken(t) { localStorage.setItem('nav_admin_token', t); }
function clearToken() { localStorage.removeItem('nav_admin_token'); }

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
  if (!getToken()) { nav.innerHTML = ''; return; }
  const links = [
    ['#dashboard', 'Usuarios'],
    ['#cities', 'Ciudades'],
    ['#business-types', 'Tipos'],
    ['#articles', 'Articulos'],
  ];
  nav.innerHTML = links.map(([href, label]) =>
    `<a href="${href}" class="${active === href ? 'active' : ''}">${label}</a>`
  ).join('') + `<a href="#" id="logout-btn">Salir</a>`;

  document.getElementById('logout-btn').addEventListener('click', e => {
    e.preventDefault();
    clearToken();
    route();
  });
}

// ── Views ────────────────────────────────────────────────────────────────────

function viewLogin() {
  return `
    <div class="card" style="max-width:400px;margin:auto">
      <h2 style="margin-bottom:1.5rem">Admin Login</h2>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email">
      </div>
      <div class="form-group">
        <label>Contrasena</label>
        <input type="password" id="password">
      </div>
      <button id="login-btn">Entrar</button>
      <div id="msg"></div>
    </div>
  `;
}

function viewDashboard({ users, page, pages }, statusFilter) {
  const pending = users.filter(u => u.status === 'pending');

  const tabs = [
    ['', 'Todos'],
    ['pending', 'Pendientes'],
    ['active', 'Aprobados'],
    ['rejected', 'Rechazados'],
  ].map(([val, label]) =>
    `<a href="#dashboard?status=${val}" class="tab-btn ${statusFilter === val ? 'active' : ''}">${label}</a>`
  ).join('');

  const rows = users.map(u => `
    <tr>
      <td>${escHtml(u.email)}</td>
      <td>${escHtml(u.business_name || '-')}</td>
      <td>${escHtml(u.city || '-')}</td>
      <td>${escHtml(u.business_type || '-')}</td>
      <td><span class="badge ${u.status}">${u.status}</span></td>
      <td>
        ${u.status === 'pending' ? `
          <button class="small success approve-btn" data-id="${u.id}">Aprobar</button>
          <button class="small danger reject-btn" data-id="${u.id}">Rechazar</button>
        ` : '-'}
      </td>
    </tr>
  `).join('');

  const pagination = pages > 1 ? `
    <div class="pagination">
      ${page > 1 ? `<a href="#dashboard?status=${statusFilter}&page=${page - 1}" class="page-btn">Anterior</a>` : ''}
      <span>Pagina ${page} de ${pages}</span>
      ${page < pages ? `<a href="#dashboard?status=${statusFilter}&page=${page + 1}" class="page-btn">Siguiente</a>` : ''}
    </div>
  ` : '';

  return `
    <h2>Usuarios ${pending.length > 0 ? `<span class="badge pending">${pending.length} pendiente(s)</span>` : ''}</h2>
    <div class="tabs" style="margin-bottom:1rem">${tabs}</div>
    <div class="card">
      <table>
        <thead><tr>
          <th>Email</th><th>Negocio</th><th>Ciudad</th><th>Tipo</th><th>Estado</th><th>Acciones</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${pagination}
    </div>
  `;
}

function viewCities(cities) {
  return `
    <h2>Ciudades</h2>
    <div class="card">
      <div class="form-row">
        <div class="form-group">
          <label>Nueva ciudad</label>
          <input type="text" id="city-name" placeholder="Nombre">
        </div>
        <button id="add-city-btn">Agregar</button>
      </div>
      <div id="city-msg"></div>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Pais</th><th></th></tr></thead>
        <tbody>
          ${cities.map(c => `
            <tr>
              <td>${c.id}</td><td>${c.name}</td><td>${c.country}</td>
              <td><button class="small danger del-city-btn" data-id="${c.id}">Eliminar</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewBusinessTypes(types) {
  return `
    <h2>Tipos de negocio</h2>
    <div class="card">
      <div class="form-row">
        <div class="form-group">
          <label>Nuevo tipo</label>
          <input type="text" id="type-name" placeholder="Nombre">
        </div>
        <button id="add-type-btn">Agregar</button>
      </div>
      <div id="type-msg"></div>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th></th></tr></thead>
        <tbody>
          ${types.map(t => `
            <tr>
              <td>${t.id}</td><td>${t.name}</td>
              <td><button class="small danger del-type-btn" data-id="${t.id}">Eliminar</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewArticles({ articles, page, pages }, cities, types) {
  const cityOpts = cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const typeOpts = types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

  const rows = articles.map(a => `
    <tr>
      <td>${escHtml(a.title)}</td>
      <td>${escHtml(a.event_date || '-')}</td>
      <td>${escHtml(a.language)}</td>
      <td>${(a.cities || []).map(c => `<span class="tag">${escHtml(c.name)}</span>`).join('')}</td>
      <td>${(a.business_types || []).map(t => `<span class="tag">${escHtml(t.name)}</span>`).join('')}</td>
      <td><button class="small danger del-article-btn" data-id="${a.id}">Eliminar</button></td>
    </tr>
  `).join('');

  const pagination = pages > 1 ? `
    <div class="pagination">
      ${page > 1 ? `<a href="#articles?page=${page - 1}" class="page-btn">Anterior</a>` : ''}
      <span>Pagina ${page} de ${pages}</span>
      ${page < pages ? `<a href="#articles?page=${page + 1}" class="page-btn">Siguiente</a>` : ''}
    </div>
  ` : '';

  return `
    <h2>Articulos</h2>
    <div class="card">
      <h3>Agregar articulo</h3>
      <div class="form-group">
        <label>Titulo *</label>
        <input type="text" id="a-title">
      </div>
      <div class="form-group">
        <label>Descripcion</label>
        <textarea id="a-desc"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>URL fuente</label>
          <input type="url" id="a-url">
        </div>
        <div class="form-group">
          <label>Fecha evento</label>
          <input type="date" id="a-date">
        </div>
        <div class="form-group">
          <label>Idioma</label>
          <select id="a-lang">
            <option value="es">Espanol</option>
            <option value="en">Ingles</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ciudades (ctrl+click para varios)</label>
          <select id="a-cities" multiple>${cityOpts}</select>
        </div>
        <div class="form-group">
          <label>Tipos de negocio (ctrl+click para varios)</label>
          <select id="a-types" multiple>${typeOpts}</select>
        </div>
      </div>
      <button id="add-article-btn">Publicar articulo</button>
      <div id="article-msg"></div>
    </div>
    <div class="card">
      <h3>Articulos publicados</h3>
      <table>
        <thead><tr>
          <th>Titulo</th><th>Fecha</th><th>Idioma</th><th>Ciudades</th><th>Tipos</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${pagination}
    </div>
  `;
}

// ── Route ────────────────────────────────────────────────────────────────────

async function route() {
  const raw = location.hash || '#dashboard';
  const [hash, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart || '');
  const page = parseInt(params.get('page')) || 1;
  const app = document.getElementById('app');

  if (!getToken()) {
    renderNav(null);
    app.innerHTML = viewLogin();
    document.getElementById('login-btn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const msg = document.getElementById('msg');
      const { ok, data } = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (ok && data.role === 'admin') {
        setToken(data.token);
        location.hash = '#dashboard';
        route();
      } else if (ok) {
        msg.className = 'error';
        msg.textContent = 'Esta cuenta no tiene acceso de administrador';
      } else {
        msg.className = 'error';
        msg.textContent = data.error || 'Error al iniciar sesion';
      }
    });
    return;
  }

  if (hash === '#cities') {
    renderNav('#cities');
    const { data: cities } = await apiFetch('/admin/cities');
    app.innerHTML = viewCities(cities);

    document.getElementById('add-city-btn').addEventListener('click', async () => {
      const name = document.getElementById('city-name').value.trim();
      const msg = document.getElementById('city-msg');
      if (!name) return;
      const { ok, data } = await apiFetch('/admin/cities', {
        method: 'POST', body: JSON.stringify({ name }),
      });
      if (ok) { location.hash = '#cities'; route(); }
      else { msg.className = 'error'; msg.textContent = data.error; }
    });

    document.querySelectorAll('.del-city-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Eliminar ciudad?')) return;
        await apiFetch(`/admin/cities/${btn.dataset.id}`, { method: 'DELETE' });
        route();
      });
    });

  } else if (hash === '#business-types') {
    renderNav('#business-types');
    const { data: types } = await apiFetch('/admin/business-types');
    app.innerHTML = viewBusinessTypes(types);

    document.getElementById('add-type-btn').addEventListener('click', async () => {
      const name = document.getElementById('type-name').value.trim();
      const msg = document.getElementById('type-msg');
      if (!name) return;
      const { ok, data } = await apiFetch('/admin/business-types', {
        method: 'POST', body: JSON.stringify({ name }),
      });
      if (ok) { location.hash = '#business-types'; route(); }
      else { msg.className = 'error'; msg.textContent = data.error; }
    });

    document.querySelectorAll('.del-type-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Eliminar tipo?')) return;
        await apiFetch(`/admin/business-types/${btn.dataset.id}`, { method: 'DELETE' });
        route();
      });
    });

  } else if (hash === '#articles') {
    renderNav('#articles');
    const [{ data: articles }, { data: cities }, { data: types }] = await Promise.all([
      apiFetch(`/admin/articles?page=${page}`),
      apiFetch('/admin/cities'),
      apiFetch('/admin/business-types'),
    ]);
    app.innerHTML = viewArticles(articles, cities, types);

    document.getElementById('add-article-btn').addEventListener('click', async () => {
      const title = document.getElementById('a-title').value.trim();
      const description = document.getElementById('a-desc').value.trim();
      const url = document.getElementById('a-url').value.trim();
      const event_date = document.getElementById('a-date').value;
      const language = document.getElementById('a-lang').value;
      const cityIds = [...document.getElementById('a-cities').selectedOptions].map(o => +o.value);
      const businessTypeIds = [...document.getElementById('a-types').selectedOptions].map(o => +o.value);
      const msg = document.getElementById('article-msg');

      const { ok, data } = await apiFetch('/admin/articles', {
        method: 'POST',
        body: JSON.stringify({ title, description, url, event_date, language, cityIds, businessTypeIds }),
      });
      if (ok) { location.hash = '#articles'; route(); }
      else { msg.className = 'error'; msg.textContent = data.error; }
    });

    document.querySelectorAll('.page-btn').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); location.hash = a.getAttribute('href').slice(1); route(); });
    });

    document.querySelectorAll('.del-article-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Eliminar articulo?')) return;
        await apiFetch(`/admin/articles/${btn.dataset.id}`, { method: 'DELETE' });
        route();
      });
    });

  } else {
    // Default: dashboard
    renderNav('#dashboard');
    const statusFilter = params.get('status') || '';
    const statusQuery = statusFilter ? `&status=${statusFilter}` : '';
    const { data: users } = await apiFetch(`/admin/users?page=${page}${statusQuery}`);
    app.innerHTML = viewDashboard(users, statusFilter);

    // Tab clicks re-route without page reload
    document.querySelectorAll('.tab-btn').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); location.hash = a.getAttribute('href').slice(1); route(); });
    });

    document.querySelectorAll('.page-btn').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); location.hash = a.getAttribute('href').slice(1); route(); });
    });

    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await apiFetch(`/admin/users/${btn.dataset.id}/approve`, { method: 'PATCH' });
        route();
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await apiFetch(`/admin/users/${btn.dataset.id}/reject`, { method: 'PATCH' });
        route();
      });
    });
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);
