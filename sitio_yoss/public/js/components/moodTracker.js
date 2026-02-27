/**
 * js/components/moodTracker.js
 * Mood Tracker interactivo con emociones personalizadas por rol.
 * 
 * - Partner (Yoss): emociones femeninas, cálidas y expresivas
 * - Admin (Bryan): emociones masculinas, directas
 * 
 * Depende de: window.YossSession (userSession.js)
 */

(function () {
  'use strict';

  const moodTrackerContainer = document.getElementById('moodTracker');
  const moodDisplayContainer = document.getElementById('moodDisplay');
  const updateMoodBtn = document.getElementById('updateMoodBtn');
  const moodPickerOverlay = document.getElementById('moodPickerOverlay');
  const moodPickerClose = document.getElementById('moodPickerClose');
  const moodPickerTitle = document.getElementById('moodPickerTitle');
  const moodOptionsGrid = document.getElementById('moodOptionsGrid');
  const moodCustomInput = document.getElementById('moodCustomInput');
  const saveMoodBtn = document.getElementById('saveMoodBtn');

  if (!moodTrackerContainer || !moodDisplayContainer) return;

  // ═══════════════════════════════════════════════════
  // MOOD OPTIONS — role-based emotional palettes
  // ═══════════════════════════════════════════════════

  const MOODS_PARTNER = [
    { emoji: '🥰', label: 'Enamorada' },
    { emoji: '😊', label: 'Feliz' },
    { emoji: '🦋', label: 'Emocionada' },
    { emoji: '😴', label: 'Cansada' },
    { emoji: '🥺', label: 'Sensible' },
    { emoji: '💆‍♀️', label: 'Relajada' },
    { emoji: '😤', label: 'Estresada' },
    { emoji: '🌸', label: 'En paz' },
    { emoji: '😢', label: 'Triste' },
    { emoji: '🤗', label: 'Cariñosa' },
    { emoji: '😌', label: 'Agradecida' },
    { emoji: '💪', label: 'Motivada' },
    { emoji: '😒', label: 'De malas' },
    { emoji: '🤒', label: 'Enfermita' },
    { emoji: '🥱', label: 'Con sueño' },
    { emoji: '🤔', label: 'Pensativa' },
    { emoji: '😍', label: 'Ilusionada' },
    { emoji: '🫶', label: 'Amorosa' },
  ];

  const MOODS_ADMIN = [
    { emoji: '😎', label: 'Tranquilo' },
    { emoji: '😊', label: 'Feliz' },
    { emoji: '💪', label: 'Motivado' },
    { emoji: '😴', label: 'Cansado' },
    { emoji: '🤔', label: 'Pensativo' },
    { emoji: '😤', label: 'Estresado' },
    { emoji: '🧘', label: 'Relajado' },
    { emoji: '❤️', label: 'Enamorado' },
    { emoji: '😢', label: 'Triste' },
    { emoji: '🔥', label: 'Productivo' },
    { emoji: '😒', label: 'De malas' },
    { emoji: '🤒', label: 'Enfermo' },
    { emoji: '🥱', label: 'Con sueño' },
    { emoji: '🎮', label: 'Jugando' },
    { emoji: '💻', label: 'Codeando' },
    { emoji: '🫡', label: 'Determinado' },
    { emoji: '🥳', label: 'De fiesta' },
    { emoji: '🤗', label: 'Cariñoso' },
  ];

  // ═══════════════════════════════════════════════════
  // LOAD & RENDER MOODS
  // ═══════════════════════════════════════════════════

  async function loadMoods() {
    try {
      const res = await fetch('/api/users/moods');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (data.success && data.moods) {
        renderMoods(data.moods);
        moodTrackerContainer.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error cargando moods', err);
    }
  }

  function renderMoods(moods) {
    if (moods.length === 0) return;

    moods.sort((a, b) => a.displayName.localeCompare(b.displayName));

    let html = '';

    moods.forEach((m, index) => {
      const isYoss = m.displayName.toLowerCase().includes('yoss');
      const avatar = isYoss ? '🌸' : '👨‍💻';
      const moodText = m.currentMood || 'Sin mood aún';

      html += `
        <div class="mood-user">
          <div class="mood-user__avatar">${avatar}</div>
          <div class="mood-user__info">
            <span class="mood-user__name">${escapeHtml(m.displayName)}</span>
            <span class="mood-user__status">${escapeHtml(moodText)}</span>
          </div>
        </div>
      `;

      if (index < moods.length - 1) {
        html += '<div class="mood-divider"></div>';
      }
    });

    moodDisplayContainer.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════
  // MOOD PICKER — role-based grid
  // ═══════════════════════════════════════════════════

  function openMoodPicker() {
    if (!moodPickerOverlay) return;

    const user = window.YossSession?.getUser();
    const isPartner = user && user.role === 'partner';

    // Set title
    if (moodPickerTitle) {
      moodPickerTitle.textContent = isPartner
        ? '¿Cómo te sientes, cariño? 💕'
        : '¿Cómo andas hoy? 💪';
    }

    // Build mood grid based on role
    const moodList = isPartner ? MOODS_PARTNER : MOODS_ADMIN;

    if (moodOptionsGrid) {
      moodOptionsGrid.innerHTML = moodList.map(m => `
        <button class="mood-option" data-mood="${m.emoji} ${m.label}">
          <span class="mood-option__emoji">${m.emoji}</span>
          <span class="mood-option__label">${m.label}</span>
        </button>
      `).join('');
    }

    moodPickerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMoodPicker() {
    if (!moodPickerOverlay) return;
    moodPickerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════════
  // UPDATE MOOD — API call
  // ═══════════════════════════════════════════════════

  async function updateMood(moodText) {
    if (!moodText || !moodText.trim()) return;

    if (saveMoodBtn) {
      saveMoodBtn.disabled = true;
      saveMoodBtn.textContent = 'Guardando...';
    }

    try {
      const res = await fetch('/api/users/mood', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodText.trim() }),
        credentials: 'same-origin',
      });

      const data = await res.json();
      if (data.success) {
        closeMoodPicker();
        await loadMoods();
        if (moodCustomInput) moodCustomInput.value = '';
      }
    } catch (err) {
      console.error('Error al actualizar mood', err);
    } finally {
      if (saveMoodBtn) {
        saveMoodBtn.disabled = false;
        saveMoodBtn.textContent = 'Actualizar ✨';
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════

  if (updateMoodBtn) updateMoodBtn.addEventListener('click', openMoodPicker);
  if (moodPickerClose) moodPickerClose.addEventListener('click', closeMoodPicker);

  // Close on overlay click
  if (moodPickerOverlay) {
    moodPickerOverlay.addEventListener('click', (e) => {
      if (e.target === moodPickerOverlay) closeMoodPicker();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && moodPickerOverlay?.classList.contains('active')) {
      closeMoodPicker();
    }
  });

  // Mood grid clicks (event delegation)
  if (moodOptionsGrid) {
    moodOptionsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.mood-option');
      if (!btn) return;

      const mood = btn.dataset.mood;
      if (!mood) return;

      // Visual feedback
      btn.classList.add('selected');
      btn.querySelector('.mood-option__emoji').style.transform = 'scale(1.3)';

      updateMood(mood).then(() => {
        setTimeout(() => {
          btn.classList.remove('selected');
          const emojiEl = btn.querySelector('.mood-option__emoji');
          if (emojiEl) emojiEl.style.transform = '';
        }, 500);
      });
    });
  }

  // Custom input save
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener('click', () => {
      if (moodCustomInput && moodCustomInput.value.trim()) {
        updateMood(moodCustomInput.value);
      }
    });
  }

  // Custom input Enter key
  if (moodCustomInput) {
    moodCustomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && moodCustomInput.value.trim()) {
        e.preventDefault();
        updateMood(moodCustomInput.value);
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ═══════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', loadMoods);

  // Auto-refresh every 5 minutes
  setInterval(loadMoods, 1000 * 60 * 5);
})();
