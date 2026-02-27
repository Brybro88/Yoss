/**
 * admin.js — Lógica del Panel de Admin de Bryan
 * 
 * Funcionalidades:
 *   - Verificar sesión y rol admin
 *   - CRUD de Momentos Especiales
 *   - Stats rápidos (pensamientos, cartas, momentos)
 *   - Toast notifications
 */

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
let currentUser = null;
let selectedEmoji = '💖';

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminSession();
  loadStats();
  loadMoments();
  loadLetters();
  loadCmsConfig();
  setupMomentForm();
  setupLetterForm();
  setupCmsForm();
  setupEmojiPicker();
  setupLogout();
});

// ═══════════════════════════════════════════════════
// SESSION
// ═══════════════════════════════════════════════════
async function checkAdminSession() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('No auth');
    const data = await res.json();
    currentUser = data.user;

    if (currentUser.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const greetEl = document.getElementById('adminGreeting');
    if (greetEl) greetEl.textContent = `Hola, ${currentUser.displayName} 🛠️`;
  } catch {
    window.location.href = '/login.html';
  }
}

// ═══════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════
async function loadStats() {
  try {
    const [thoughtsRes, lettersRes, momentsRes] = await Promise.all([
      fetch('/api/thoughts', { credentials: 'same-origin' }),
      fetch('/api/letters', { credentials: 'same-origin' }),
      fetch('/api/moments', { credentials: 'same-origin' }),
    ]);

    const thoughts = await thoughtsRes.json();
    const letters = await lettersRes.json();
    const moments = await momentsRes.json();

    setStatValue('statThoughts', thoughts.count || 0);
    setStatValue('statLetters', letters.count || 0);
    setStatValue('statMoments', moments.count || 0);

    // Cartas sin leer (where I'm not the sender and isRead is false)
    const unreadCount = (letters.letters || []).filter(
      l => l.from?._id !== currentUser?.id && !l.isRead
    ).length;
    setStatValue('statUnread', unreadCount);
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ═══════════════════════════════════════════════════
// MOMENTS
// ═══════════════════════════════════════════════════
async function loadMoments() {
  const listEl = document.getElementById('momentList');
  if (!listEl) return;

  try {
    const res = await fetch('/api/moments', { credentials: 'same-origin' });
    const data = await res.json();

    if (!data.moments || data.moments.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__emoji">✨</div>
          <p class="empty-state__text">Aún no has creado momentos especiales.<br>¡Sorpréndela con algo único!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = data.moments.map(m => renderMomentCard(m)).join('');
  } catch (err) {
    console.error('Error loading moments:', err);
    listEl.innerHTML = '<p class="empty-state__text">Error al cargar momentos</p>';
  }
}

function renderMomentCard(m) {
  const date = new Date(m.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  
  const seenNames = (m.seenBy || []).map(u => u.displayName || 'Usuario').join(', ');
  const isActive = m.isActive;
  const wasSeen = m.seenBy && m.seenBy.length > 0;

  let statusHTML = '';
  if (isActive && !wasSeen) {
    statusHTML = '<span class="status-badge status-badge--active">✨ Activo — Esperando que Yoss lo vea</span>';
  } else if (isActive && wasSeen) {
    statusHTML = `<span class="status-badge status-badge--seen">👁️ Visto por: ${escapeHtml(seenNames)}</span>`;
  } else {
    statusHTML = '<span class="status-badge status-badge--inactive">Inactivo</span>';
  }

  return `
    <div class="moment-card" data-id="${m._id}">
      <div class="moment-card__header">
        <span class="moment-card__emoji">${escapeHtml(m.emoji)}</span>
        <div class="moment-card__info">
          <div class="moment-card__title">${escapeHtml(m.title)}</div>
          <div class="moment-card__meta">
            <span>📅 ${date}</span>
          </div>
        </div>
      </div>
      <div class="moment-card__content">${escapeHtml(m.content)}</div>
      <div class="moment-card__status">
        ${statusHTML}
        <button class="btn btn--danger btn--sm" data-action="delete-moment" data-id="${m._id}">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════
// CREATE MOMENT
// ═══════════════════════════════════════════════════
function setupMomentForm() {
  const form = document.getElementById('momentForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('momentTitle').value.trim();
    const content = document.getElementById('momentContent').value.trim();

    if (!title || !content) {
      showToast('Completa el título y contenido 💖', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando...';

    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title, content, emoji: selectedEmoji }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Momento creado ✨', 'success');
        form.reset();
        selectedEmoji = '💖';
        updateEmojiSelection();
        loadMoments();
        loadStats();
      } else {
        showToast(data.message || 'Error al crear momento', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '✨ Publicar Momento';
    }
  });
}

// ═══════════════════════════════════════════════════
// LETTERS (CAPSULES)
// ═══════════════════════════════════════════════════
async function loadLetters() {
  const listEl = document.getElementById('letterList');
  if (!listEl) return;

  try {
    const res = await fetch('/api/letters', { credentials: 'same-origin' });
    const data = await res.json();

    if (!data.letters || data.letters.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__emoji">💌</div>
          <p class="empty-state__text">No hay cápsulas activas.<br>Escribe algo hermoso para el futuro.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = data.letters.map(l => renderLetterCard(l)).join('');
  } catch (err) {
    console.error('Error loading letters:', err);
    listEl.innerHTML = '<p class="empty-state__text">Error al cargar cápsulas</p>';
  }
}

function renderLetterCard(l) {
  // Configuro la fecha para que sirva en el input datetime-local al editar (YYYY-MM-DDThh:mm)
  const dateObj = new Date(l.unlockDate);
  const pad = (n) => n.toString().padStart(2, '0');
  const localDatetime = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

  const displayDate = dateObj.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  
  const isLocked = new Date() < dateObj;

  let statusHTML = '';
  if (isLocked) {
    statusHTML = '<span class="status-badge status-badge--active">🔒 Bloqueada — Esperando fecha</span>';
  } else {
    statusHTML = `<span class="status-badge status-badge--seen">🔓 Desbloqueada y visible</span>`;
  }

  // Escapar datos de forma segura para los atributos data
  const safeTitle = escapeHtml(l.title).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  const safeBody = typeof l.body === 'string' ? escapeHtml(l.body).replace(/'/g, "&#39;").replace(/"/g, "&quot;") : '';

  return `
    <div class="moment-card" data-id="${l._id}">
      <div class="moment-card__header">
        <span class="moment-card__emoji">⏳</span>
        <div class="moment-card__info">
          <div class="moment-card__title">${escapeHtml(l.title)}</div>
          <div class="moment-card__meta">
            <span>📅 Apertura: ${displayDate}</span>
          </div>
        </div>
      </div>
      <div class="moment-card__content" style="max-height: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${l.body ? escapeHtml(l.body) : '<i>[Contenido oculto o no disponible]</i>'}
      </div>
      <div class="moment-card__status" style="margin-top: 1rem;">
        ${statusHTML}
        <div>
          <button class="btn btn--sm" style="background: rgba(255,255,255,0.1); margin-right: 5px;" 
            data-action="edit-letter" data-id="${l._id}" data-title="${safeTitle}" data-body="${safeBody}" data-datetime="${localDatetime}">
            ✏️ Editar
          </button>
          <button class="btn btn--danger btn--sm" data-action="delete-letter" data-id="${l._id}">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupLetterForm() {
  const form = document.getElementById('letterForm');
  const cancelBtn = document.getElementById('cancelEditLetterBtn');
  if (!form) return;

  cancelBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('editLetterId').value = '';
    cancelBtn.style.display = 'none';
    document.getElementById('saveLetterBtn').textContent = '⏳ Guardar Cápsula';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editLetterId').value;
    const title = document.getElementById('letterTitle').value.trim();
    const body = document.getElementById('letterContent').value.trim();
    const unlockDate = document.getElementById('letterUnlockDate').value; // YYYY-MM-DDThh:mm

    if (!title || !body || !unlockDate) {
      showToast('Completa todos los campos 💌', 'error');
      return;
    }

    const submitBtn = document.getElementById('saveLetterBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = id ? 'Actualizando...' : 'Creando...';

    try {
      const url = id ? `/api/letters/${id}` : '/api/letters';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title, body, unlockDate }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Cápsula guardada ✨', 'success');
        cancelBtn.click(); // Reset form logic
        loadLetters();
        loadStats();
      } else {
        showToast(data.message || 'Error al guardar cápsula', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      submitBtn.disabled = false;
      if (!id) submitBtn.textContent = '⏳ Guardar Cápsula';
    }
  });
}

function editLetter(id, title, body, localDatetime) {
  document.getElementById('editLetterId').value = id;
  document.getElementById('letterTitle').value = title;
  document.getElementById('letterContent').value = body;
  document.getElementById('letterUnlockDate').value = localDatetime;

  document.getElementById('cancelEditLetterBtn').style.display = 'inline-block';
  document.getElementById('saveLetterBtn').textContent = '💾 Actualizar Cápsula';
  document.getElementById('letterSection').scrollIntoView({ behavior: 'smooth' });
}

async function deleteLetter(id) {
  if (!confirm('¿Eliminar esta cápsula del tiempo definitivamente?')) return;

  try {
    const res = await fetch(`/api/letters/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    if (res.ok) {
      showToast('Cápsula eliminada', 'success');
      loadLetters();
      loadStats();
    } else {
      showToast('Error al eliminar', 'error');
    }
  } catch {
    showToast('Error de conexión', 'error');
  }
}

// ═══════════════════════════════════════════════════
// CMS (SITE CONTENT) CONFIGURATION
// ═══════════════════════════════════════════════════
async function loadCmsConfig() {
  const welcomeInput = document.getElementById('welcomeMessage');
  const dailyNoteInput = document.getElementById('dailyNote');
  if (!welcomeInput || !dailyNoteInput) return;

  try {
    const res = await fetch('/api/site-content');
    if (res.ok) {
      const data = await res.json();
      welcomeInput.value = data.welcomeMessage || '';
      dailyNoteInput.value = data.dailyNote || '';
    }
  } catch (err) {
    console.error('Error fetching CMS Config', err);
  }
}

function setupCmsForm() {
  const form = document.getElementById('cmsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const welcomeMessage = document.getElementById('welcomeMessage').value.trim();
    const dailyNote = document.getElementById('dailyNote').value.trim();

    if (!welcomeMessage || !dailyNote) {
      showToast('Completa los campos del CMS 📝', 'error');
      return;
    }

    const submitBtn = document.getElementById('saveCmsBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ welcomeMessage, dailyNote }),
      });

      if (res.ok) {
        showToast('Configuración CMS actualizada ✨', 'success');
        // Refresh local inputs to show exact server-saved state occasionally
        loadCmsConfig();
      } else {
        showToast('Error de permisos o servidor', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '✨ Guardar Cambios';
    }
  });
}

// ═══════════════════════════════════════════════════
// DELETE MOMENT
// ═══════════════════════════════════════════════════
async function deleteMoment(id) {
  if (!confirm('¿Eliminar este momento especial?')) return;

  try {
    const res = await fetch(`/api/moments/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    if (res.ok) {
      const card = document.querySelector(`.moment-card[data-id="${id}"]`);
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(30px)';
        setTimeout(() => card.remove(), 300);
      }
      showToast('Momento eliminado', 'success');
      loadStats();
    } else {
      showToast('Error al eliminar', 'error');
    }
  } catch {
    showToast('Error de conexión', 'error');
  }
}

// ═══════════════════════════════════════════════════
// EMOJI PICKER
// ═══════════════════════════════════════════════════
function setupEmojiPicker() {
  const buttons = document.querySelectorAll('.emoji-select button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEmoji = btn.dataset.emoji;
      updateEmojiSelection();
    });
  });
  updateEmojiSelection();
}

function updateEmojiSelection() {
  const buttons = document.querySelectorAll('.emoji-select button');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.emoji === selectedEmoji);
  });
}

// ═══════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════
function setupLogout() {
  const btn = document.getElementById('adminLogout');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {}
    window.location.href = '/login.html';
  });
}

// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}



// ═══════════════════════════════════════════════════
// EVENT DELEGATION (replaces inline onclick handlers)
// ═══════════════════════════════════════════════════
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  switch (action) {
    case 'delete-moment':
      deleteMoment(id);
      break;
    case 'delete-letter':
      deleteLetter(id);
      break;
    case 'edit-letter':
      editLetter(id, btn.dataset.title || '', btn.dataset.body || '', btn.dataset.datetime || '');
      break;
  }
});
