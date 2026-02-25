/**
 * js/components/sharedSpace.js — Lógica del Espacio Compartido
 * 
 * Maneja el modal con dos tabs:
 *   - 💭 Pensamientos (mini-feed)
 *   - 💌 Cartas Privadas
 * 
 * Depende de: userSession.js (window.YossSession)
 */

(function () {
  'use strict';

  // ─── DOM Elements ───
  const overlay = document.getElementById('sharedSpaceOverlay');
  const openBtn = document.getElementById('sharedSpaceBtn');
  const closeBtn = document.getElementById('sharedSpaceClose');
  const tabs = document.querySelectorAll('.shared-space__tab');
  const panels = document.querySelectorAll('.shared-space__panel');

  // Thoughts
  const thoughtForm = document.getElementById('thoughtForm');
  const thoughtInput = document.getElementById('thoughtInput');
  const thoughtEmojiBtn = document.getElementById('thoughtEmojiBtn');
  const thoughtFeed = document.getElementById('thoughtFeed');

  // Letters
  const letterForm = document.getElementById('letterForm');
  const letterInput = document.getElementById('letterInput');
  const letterFeed = document.getElementById('letterFeed');
  const letterTabBadge = document.getElementById('letterTabBadge');

  // ─── Emoji Picker (simple) ───
  const emojis = ['💭', '💖', '🌸', '✨', '🌙', '💫', '🦋', '🌹', '💕', '🥰', '😊', '🥺'];
  let selectedEmoji = '💭';

  // ─── State ───
  let isOpen = false;

  // ═════════════════════════════════════════════════════════
  // MODAL CONTROL
  // ═════════════════════════════════════════════════════════

  function openModal() {
    if (!overlay) return;
    isOpen = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadThoughts();
    loadLetters();
  }

  function closeModal() {
    if (!overlay) return;
    isOpen = false;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Close on overlay click (not on modal itself)
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // ═════════════════════════════════════════════════════════
  // TABS
  // ═════════════════════════════════════════════════════════

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // ═════════════════════════════════════════════════════════
  // THOUGHTS
  // ═════════════════════════════════════════════════════════

  async function loadThoughts() {
    try {
      const res = await fetch('/api/thoughts', { credentials: 'same-origin' });
      if (!res.ok) return;

      const data = await res.json();
      renderThoughts(data.thoughts || []);
    } catch (err) {
      console.error('Error cargando pensamientos:', err);
    }
  }

  function renderThoughts(thoughts) {
    if (!thoughtFeed) return;

    if (thoughts.length === 0) {
      thoughtFeed.innerHTML = `
        <div class="empty-state">
          <span class="empty-state__emoji">💭</span>
          <p class="empty-state__text">Aún no hay pensamientos...<br>¡Sé el primero en compartir uno!</p>
        </div>
      `;
      return;
    }

    const currentUser = window.YossSession?.getUser();

    thoughtFeed.innerHTML = thoughts.map((t) => `
      <div class="thought-card" data-id="${t._id}">
        <span class="thought-card__emoji">${escapeHtml(t.emoji)}</span>
        <div class="thought-card__body">
          <div class="thought-card__meta">
            <span class="thought-card__author">${escapeHtml(t.author?.displayName || 'Anónimo')}</span>
            <span class="thought-card__time">${timeAgo(t.createdAt)}</span>
          </div>
          <p class="thought-card__content">${escapeHtml(t.content)}</p>
        </div>
        ${currentUser && t.author?._id === currentUser.id
          ? `<button class="thought-card__delete" onclick="YossSpace.deleteThought('${t._id}')" title="Eliminar">✕</button>`
          : ''}
      </div>
    `).join('');
  }

  async function createThought() {
    if (!thoughtInput) return;

    const content = thoughtInput.value.trim();
    if (!content) return;

    const sendBtn = thoughtForm?.querySelector('.compose-form__send');
    if (sendBtn) sendBtn.disabled = true;

    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, emoji: selectedEmoji }),
        credentials: 'same-origin',
      });

      if (res.ok) {
        thoughtInput.value = '';
        selectedEmoji = '💭';
        if (thoughtEmojiBtn) thoughtEmojiBtn.textContent = '💭';
        loadThoughts();
      } else {
        const data = await res.json();
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error creando pensamiento:', err);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function deleteThought(id) {
    try {
      const res = await fetch(`/api/thoughts/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (res.ok) {
        // Animate removal
        const card = thoughtFeed?.querySelector(`[data-id="${id}"]`);
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateX(-20px)';
          setTimeout(() => loadThoughts(), 300);
        } else {
          loadThoughts();
        }
      }
    } catch (err) {
      console.error('Error eliminando pensamiento:', err);
    }
  }

  // Thought form submit
  if (thoughtForm) {
    thoughtForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createThought();
    });
  }

  // Emoji picker (simple toggle)
  if (thoughtEmojiBtn) {
    let emojiIndex = 0;
    thoughtEmojiBtn.addEventListener('click', () => {
      emojiIndex = (emojiIndex + 1) % emojis.length;
      selectedEmoji = emojis[emojiIndex];
      thoughtEmojiBtn.textContent = selectedEmoji;
    });
  }

  // ═════════════════════════════════════════════════════════
  // LETTERS
  // ═════════════════════════════════════════════════════════

  async function loadLetters() {
    try {
      const res = await fetch('/api/letters', { credentials: 'same-origin' });
      if (!res.ok) return;

      const data = await res.json();
      renderLetters(data.letters || []);
      updateUnreadCount(data.letters || []);
    } catch (err) {
      console.error('Error cargando cartas:', err);
    }
  }

  function renderLetters(letters) {
    if (!letterFeed) return;

    if (letters.length === 0) {
      letterFeed.innerHTML = `
        <div class="empty-state">
          <span class="empty-state__emoji">💌</span>
          <p class="empty-state__text">No hay cartas aún...<br>Escribe la primera carta especial</p>
        </div>
      `;
      return;
    }

    const currentUser = window.YossSession?.getUser();

    letterFeed.innerHTML = letters.map((l) => {
      const isRecipient = currentUser && (l.to?._id === currentUser.id || l.to === currentUser.id);
      const isUnread = !l.isRead && isRecipient;
      const fromName = l.from?.displayName || 'Alguien especial';

      return `
        <div class="letter-card ${isUnread ? 'unread' : ''}" data-id="${l._id}">
          <div class="letter-card__header">
            <span class="letter-card__from">De: ${escapeHtml(fromName)}</span>
            <span class="letter-card__time">${formatDate(l.createdAt)}</span>
          </div>
          <div class="letter-card__content">${escapeHtml(l.content)}</div>
          ${isUnread
            ? `<button class="letter-card__mark-read" onclick="YossSpace.markLetterRead('${l._id}')">Marcar como leída ✨</button>`
            : ''}
        </div>
      `;
    }).join('');
  }

  function updateUnreadCount(letters) {
    const currentUser = window.YossSession?.getUser();
    if (!currentUser) return;

    const unread = letters.filter(
      (l) => !l.isRead && (l.to?._id === currentUser.id || l.to === currentUser.id)
    );

    // Update tab badge
    if (letterTabBadge) {
      if (unread.length > 0) {
        letterTabBadge.textContent = unread.length;
        letterTabBadge.classList.remove('hidden');
      } else {
        letterTabBadge.classList.add('hidden');
      }
    }

    // Update user bar badge
    const userBarBadge = document.getElementById('unreadBadge');
    if (userBarBadge) {
      if (unread.length > 0) {
        userBarBadge.textContent = unread.length;
        userBarBadge.classList.remove('hidden');
      } else {
        userBarBadge.classList.add('hidden');
      }
    }
  }

  async function createLetter() {
    if (!letterInput) return;

    const content = letterInput.value.trim();
    if (!content) return;

    const sendBtn = letterForm?.querySelector('.compose-form__send');
    if (sendBtn) sendBtn.disabled = true;

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'same-origin',
      });

      if (res.ok) {
        letterInput.value = '';
        loadLetters();
      } else {
        const data = await res.json();
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error creando carta:', err);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function markLetterRead(id) {
    try {
      const res = await fetch(`/api/letters/${id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
      });

      if (res.ok) {
        loadLetters();
        // Refresh user bar badge too
        if (window.YossSession?.refreshUnread) {
          window.YossSession.refreshUnread();
        }
      }
    } catch (err) {
      console.error('Error marcando carta:', err);
    }
  }

  // Letter form submit
  if (letterForm) {
    letterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createLetter();
    });
  }

  // ═════════════════════════════════════════════════════════
  // UTILITIES
  // ═════════════════════════════════════════════════════════

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)}d`;
    return formatDate(dateStr);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }

  // ═════════════════════════════════════════════════════════
  // PUBLIC API (for inline onclick handlers)
  // ═════════════════════════════════════════════════════════

  window.YossSpace = {
    open: openModal,
    close: closeModal,
    deleteThought,
    markLetterRead,
  };
})();
