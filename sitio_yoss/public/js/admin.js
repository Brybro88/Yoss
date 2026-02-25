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
  setupMomentForm();
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
        <button class="btn btn--danger btn--sm" onclick="YossAdmin.deleteMoment('${m._id}')">
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
// GLOBAL API (for inline handlers)
// ═══════════════════════════════════════════════════
window.YossAdmin = {
  deleteMoment,
};
