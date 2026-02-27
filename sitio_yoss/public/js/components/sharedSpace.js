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
      const needsAutoRead = currentUser && !isAuthor && !(t.readBy || []).includes(currentUser.id);

      // Read receipt indicator (only visible to author)
      let receiptHTML = '';
      if (isAuthor) {
        receiptHTML = isReadByOther
          ? '<span title="Leído" style="color:#34b7f1; font-size:0.75rem; font-weight:bold;">✓✓ Visto</span>'
          : '<span title="Enviado" style="color:#888; font-size:0.75rem;">✓</span>';
      }

      return `
      <div class="thought-card${needsAutoRead ? ' needs-read' : ''}" data-id="${t._id}">
        <span class="thought-card__emoji">${escapeHtml(t.emoji)}</span>
        <div class="thought-card__body">
          <div class="thought-card__meta">
            <span class="thought-card__author">${escapeHtml(t.author?.displayName || 'Anónimo')}</span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="thought-card__time">${timeAgo(t.createdAt)}</span>
              ${receiptHTML}
            </div>
          </div>
          <p class="thought-card__content">${escapeHtml(t.content)}</p>
        </div>
        ${isAuthor
          ? `<button class="thought-card__delete" data-action="delete-thought" data-id="${t._id}" title="Eliminar">✕</button>`
          : ''}
      </div>
      `;
    }).join('');

    // Setup auto-read observer for thoughts from other user
    setupAutoReadObserver(thoughtFeed, '.thought-card.needs-read', '/api/thoughts/{id}/read');
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

    const currentUser = window.YossSession?.getUser();

    letterFeed.innerHTML = letters.map((l) => {
      let letterContentHTML;
      let extraClass = '';

      // Read receipt indicator (visible to the author of the letter)
      const isAuthor = currentUser && l.author && l.author._id === currentUser.id;
      let receiptHTML = '';
      if (isAuthor && !l.isLocked) {
        if (l.isRead) {
          const readTime = l.readAt ? new Date(l.readAt).toLocaleString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';
          receiptHTML = `<span style="font-size: 0.75rem; color:#34b7f1; font-weight:bold;" title="Visto: ${readTime}">✓✓ Visto ${readTime}</span>`;
        } else {
          receiptHTML = '<span style="font-size: 0.75rem; color:#888;">✓ Enviada</span>';
        }
      }

      // Needs auto-read? (user viewing a letter they didn't write)
      const needsAutoRead = currentUser && !isAuthor && !l.isLocked && !l.isRead;

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
        <div class="letter-card ${extraClass}${needsAutoRead ? ' needs-read-letter' : ''}" data-id="${l._id}" style="
          ${!l.isLocked ? 'background: linear-gradient(145deg, rgba(232, 69, 122, 0.1), rgba(20, 10, 30, 0.6)); border: 1px solid rgba(232, 69, 122, 0.3); transform: scale(1.02); box-shadow: 0 10px 30px rgba(0,0,0,0.5);' : ''}
        ">
          <div class="letter-card__header" style="${!l.isLocked ? 'border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;' : ''}">
            <span class="letter-card__from" style="${!l.isLocked ? 'font-size: 1.4rem; color: #fff; font-weight: bold;' : ''}">
              ${escapeHtml(l.title)}
              ${l.author ? `<small style="font-size: 0.75rem; opacity: 0.7; display: block; font-weight: normal;">De: ${escapeHtml(l.author.displayName || 'Anónimo')}</small>` : ''}
            </span>
            <div style="display: flex; gap: 0.5rem; align-items: flex-end; flex-direction: column;">
              <span class="letter-card__time" style="${!l.isLocked ? 'color: var(--accent-color); font-weight: 500;' : ''}">
                ${l.isLocked ? `Abre en: ${formatDate(l.unlockDate)}` : `Abierta el: ${formatDate(l.unlockDate)}`}
              </span>
              ${!l.isLocked ? '<span style="font-size: 0.75rem; background: var(--accent-color); color: white; padding: 2px 8px; border-radius: 12px;">Cápsula Desbloqueada 🔓</span>' : ''}
              ${receiptHTML}
            </div>
          </div>
          ${letterContentHTML}
        </div>
      `;
    }).join('');

    // Iniciar contadores + auto-read observer for letters
    startLetterCountdowns();
    setupAutoReadObserver(letterFeed, '.letter-card.needs-read-letter', '/api/letters/{id}/read');
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
    // Count unread letters that the current user didn't write
    const currentUser = window.YossSession?.getUser();
    const unread = letters.filter(l =>
      !l.isLocked && !l.isRead && (!l.author || l.author._id !== currentUser?.id)
    );
    const count = unread.length;

    if (letterTabBadge) {
      if (count > 0) {
        letterTabBadge.textContent = count;
        letterTabBadge.classList.remove('hidden');
      } else {
        letterTabBadge.classList.add('hidden');
      }
    }

    const userBarBadge = document.getElementById('unreadBadge');
    if (userBarBadge) {
      if (count > 0) {
        userBarBadge.textContent = count;
        userBarBadge.classList.remove('hidden');
      } else {
        userBarBadge.classList.add('hidden');
      }
    }
  }

  async function createLetter() {
    if (!letterInput) return;

    const body = letterInput.value.trim();
    if (!body) return;

    const title = prompt('¿Título para tu carta? 💌', 'Para ti...');
    if (!title) return;

    const sendBtn = letterForm?.querySelector('.compose-form__send');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Enviando...';
    }

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
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
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Enviar carta 💌';
      }
    }
  }

  async function markLetterRead(id) {
    try {
      await fetch(`/api/letters/${id}/read`, {
        method: 'PATCH',
        credentials: 'same-origin',
      });
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
  // INTERSECTION OBSERVER — auto-read on scroll
  // ═════════════════════════════════════════════════════════

  const readTimers = new Map();          // id -> timeout
  const alreadyMarked = new Set();       // avoid duplicate calls

  function setupAutoReadObserver(container, selector, urlTemplate) {
    if (!container) return;
    const cards = container.querySelectorAll(selector);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.dataset.id;
        if (!id || alreadyMarked.has(id)) return;

        if (entry.isIntersecting) {
          // Start 1.5s timer
          const timer = setTimeout(async () => {
            alreadyMarked.add(id);
            const url = urlTemplate.replace('{id}', id);
            try {
              await fetch(url, { method: 'PATCH', credentials: 'same-origin' });
              // Silently update UI: swap to ✓✓ if visible
              entry.target.classList.remove('needs-read', 'needs-read-letter');
            } catch (err) {
              console.error('Auto-read error:', err);
            }
          }, 1500);
          readTimers.set(id, timer);
        } else {
          // Scrolled away before 1.5s — cancel
          if (readTimers.has(id)) {
            clearTimeout(readTimers.get(id));
            readTimers.delete(id);
          }
        }
      });
    }, { threshold: 0.5 });

    cards.forEach(card => observer.observe(card));
  }

  // ═════════════════════════════════════════════════════════
  // EVENT DELEGATION (replaces inline onclick)
  // ═════════════════════════════════════════════════════════

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'delete-thought' && id) deleteThought(id);
  });

  // Keep minimal global API for modal control
  window.YossSpace = {
    open: openModal,
    close: closeModal,
  };
})();
