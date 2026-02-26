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

    thoughtFeed.innerHTML = thoughts.map((t) => {
      const isAuthor = currentUser && t.author?._id === currentUser.id;
      const isReadByOther = t.readBy && t.readBy.length > 0;
      const canMarkRead = currentUser && !isAuthor && !(t.readBy || []).includes(currentUser.id);
      
      return `
      <div class="thought-card" data-id="${t._id}">
        <span class="thought-card__emoji">${escapeHtml(t.emoji)}</span>
        <div class="thought-card__body">
          <div class="thought-card__meta">
            <span class="thought-card__author">${escapeHtml(t.author?.displayName || 'Anónimo')}</span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="thought-card__time">${timeAgo(t.createdAt)}</span>
              ${isAuthor && isReadByOther ? '<span title="Leído" style="font-size:0.75rem">✔️ Leído</span>' : ''}
            </div>
          </div>
          <p class="thought-card__content">${escapeHtml(t.content)}</p>
          ${canMarkRead ? `<button class="thought-card__mark-read" onclick="YossSpace.markThoughtRead('${t._id}')" style="background: none; border: none; color: #ff69b4; font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; margin-top: 5px;">Marcar como leído ✨</button>` : ''}
        </div>
        ${isAuthor
          ? `<button class="thought-card__delete" onclick="YossSpace.deleteThought('${t._id}')" title="Eliminar">✕</button>`
          : ''}
      </div>
      `;
    }).join('');
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

  async function markThoughtRead(id) {
    try {
      const res = await fetch(`/api/thoughts/${id}/read`, {
        method: 'PATCH',
        credentials: 'same-origin',
      });

      if (res.ok) {
        loadThoughts();
      }
    } catch (err) {
      console.error('Error marcando pensamiento:', err);
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

    // Ocultar el formulario de "escribir carta" de raíz para todos (ahora vive en Admin Dashboard)
    const letterFormNode = document.getElementById('letterForm');
    if (letterFormNode) {
      letterFormNode.style.display = 'none';
    }

    letterFeed.innerHTML = letters.map((l) => {
      const isUnread = false; // Se omite la vieja logica de isRead para el modelo TimeLock
      
      let letterContentHTML;
      let extraClass = '';

      if (l.isLocked) {
        letterContentHTML = `<div style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem 1rem;">
          <span style="font-size: 3rem; display: block; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(232, 69, 122, 0.4));">🔒</span>
          <p style="margin: 0; font-size: 1.1rem; margin-bottom: 1rem;">Aún no es momento de abrir esta cápsula.</p>
          <div class="letter-countdown" data-unlock="${l.unlockDate}" style="
            font-size: 1.25rem; 
            font-weight: bold; 
            color: var(--accent-color); 
            background: rgba(0,0,0,0.3); 
            padding: 10px 15px; 
            border-radius: 8px; 
            border: 1px solid rgba(232, 69, 122, 0.3);
            display: inline-block;
            margin-bottom: 1rem;
            letter-spacing: 1px;
          ">Calculando tiempo restante... ⏳</div>
          <br>
          <small style="opacity: 0.6;">El destino la revelará a su debido tiempo.</small>
        </div>`;
        extraClass = 'locked-card';
      } else {
        // Formateo expansivo para una carta de amor moderna y abierta
        const formattedBody = escapeHtml(l.body).replace(/\n/g, '<br>');
        letterContentHTML = `
          <div class="letter-card__content" style="
            font-size: 1.15rem; 
            line-height: 1.8; 
            color: rgba(255,255,255,0.9);
            padding: 1.5rem 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            margin-top: 1rem;
            border-left: 3px solid var(--accent-color);
          ">
            ${formattedBody}
          </div>
        `;
      }

      return `
        <div class="letter-card ${extraClass}" data-id="${l._id}" style="
          ${!l.isLocked ? 'background: linear-gradient(145deg, rgba(232, 69, 122, 0.1), rgba(20, 10, 30, 0.6)); border: 1px solid rgba(232, 69, 122, 0.3); transform: scale(1.02); box-shadow: 0 10px 30px rgba(0,0,0,0.5);' : ''}
        ">
          <div class="letter-card__header" style="${!l.isLocked ? 'border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;' : ''}">
            <span class="letter-card__from" style="${!l.isLocked ? 'font-size: 1.4rem; color: #fff; font-weight: bold;' : ''}">
              ${escapeHtml(l.title)}
            </span>
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-direction: column; align-items: flex-end;">
              <span class="letter-card__time" style="${!l.isLocked ? 'color: var(--accent-color); font-weight: 500;' : ''}">
                ${l.isLocked ? `Abre en: ${formatDate(l.unlockDate)}` : `Abierta el: ${formatDate(l.unlockDate)}`}
              </span>
              ${!l.isLocked ? '<span style="font-size: 0.75rem; background: var(--accent-color); color: white; padding: 2px 8px; border-radius: 12px;">Cápsula Desbloqueada 🔓</span>' : ''}
            </div>
          </div>
          ${letterContentHTML}
        </div>
      `;
    }).join('');

    // Iniciar contadores
    startLetterCountdowns();
  }

  let letterCountdownInterval = null;

  function startLetterCountdowns() {
    if (letterCountdownInterval) clearInterval(letterCountdownInterval);
    
    const updateCounters = () => {
      const counters = document.querySelectorAll('.letter-countdown');
      if (counters.length === 0) {
        if (letterCountdownInterval) clearInterval(letterCountdownInterval);
        return;
      }

      const now = new Date().getTime();

      counters.forEach(counter => {
        const unlockDateIso = counter.getAttribute('data-unlock');
        if (!unlockDateIso) return;
        
        const unlockTime = new Date(unlockDateIso).getTime();
        const distance = unlockTime - now;

        if (distance <= 0) {
          counter.innerHTML = "¡El tiempo se ha cumplido! Recarga la página para abrirla. ✨";
          counter.style.color = "#4ade80";
          counter.style.borderColor = "#4ade80";
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let html = '';
        if (days > 0) html += `${days}d `;
        html += `${hours.toString().padStart(2, '0')}h `;
        html += `${minutes.toString().padStart(2, '0')}m `;
        html += `${seconds.toString().padStart(2, '0')}s`;

        counter.innerHTML = `Faltan: ${html} ⏳`;
      });
    };

    updateCounters();
    letterCountdownInterval = setInterval(updateCounters, 1000);
  }
  function updateUnreadCount(letters) {
    // Update tab badge based on unlockable letters instead of unread explicitly
    const unlockable = letters.filter(l => !l.isLocked);
    
    // Si queremos mostrar el numero de cartas desbloqueadas en vez de las 'no leidas'
    if (letterTabBadge) {
      if (unlockable.length > 0) {
        letterTabBadge.textContent = unlockable.length;
        letterTabBadge.classList.remove('hidden');
      } else {
        letterTabBadge.classList.add('hidden');
      }
    }

    // Update user bar badge
    const userBarBadge = document.getElementById('unreadBadge');
    if (userBarBadge) {
      if (unlockable.length > 0) {
        userBarBadge.textContent = unlockable.length;
        userBarBadge.classList.remove('hidden');
      } else {
        userBarBadge.classList.add('hidden');
      }
    }
  }

  async function createLetter() {
    if (!letterInput) return;

    // Para evitar complejidad modal ahora, un prompt basico asume titulo, body y fecha futura
    const title = prompt("Título de la cápsula:");
    if (!title) return;
    
    const body = letterInput.value.trim();
    if (!body) return;

    // Pedimos fecha en formator YYYY-MM-DD
    const unlockDateStr = prompt("Fecha de desbloqueo (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!unlockDateStr) return;

    const sendBtn = letterForm?.querySelector('.compose-form__send');
    if (sendBtn) sendBtn.disabled = true;

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, unlockDate: unlockDateStr }),
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
    markThoughtRead,
  };
})();
