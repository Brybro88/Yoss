/**
 * js/components/moodTracker.js
 * Controlador del Mood Tracker en el frontend.
 * Carga el estado de ánimo de ambos usuarios y permite actualizar el propio.
 */

(function () {
  'use strict';

  const moodTrackerContainer = document.getElementById('moodTracker');
  const moodDisplayContainer = document.getElementById('moodDisplay');
  const updateMoodBtn = document.getElementById('updateMoodBtn');
  const moodPickerOverlay = document.getElementById('moodPickerOverlay');
  const moodPickerClose = document.getElementById('moodPickerClose');
  const moodCustomInput = document.getElementById('moodCustomInput');
  const saveMoodBtn = document.getElementById('saveMoodBtn');
  
  if (!moodTrackerContainer || !moodDisplayContainer) return;

  // Cargar moods de la API
  async function loadMoods() {
    try {
      const res = await fetch('/api/users/moods');
      if (!res.ok) throw new Error('Network response was not ok');
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
    
    // Sort array so that both users appear in consistent order 
    // Usually we could sort by alphabetical order or by role if needed
    moods.sort((a,b) => a.displayName.localeCompare(b.displayName));

    let html = '';
    
    moods.forEach((m, index) => {
      // Determinar qué emoji usar para el usuario visual
      let icon = m.displayName.toLowerCase().includes('yoss') ? '🌸' : '👨‍💻'; // Custom emoji by name
      
      html += `
        <div class="mood-user">
          <span class="mood-user__name">${escapeHtml(m.displayName)} ${icon}</span>
          <span class="mood-user__status">${escapeHtml(m.currentMood)}</span>
        </div>
      `;
      
      // Añadir divisor entre usuarios si no es el último
      if (index < moods.length - 1) {
        html += '<span class="mood-divider">|</span>';
      }
    });

    moodDisplayContainer.innerHTML = html;
  }

  // Enviar el nuevo mood
  async function updateMood(moodText) {
    if (!moodText.trim()) return;

    saveMoodBtn.disabled = true;
    saveMoodBtn.textContent = 'Guardando...';

    try {
      const res = await fetch('/api/users/mood', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodText })
      });
      
      const data = await res.json();
      if (data.success) {
        closeMoodPicker();
        await loadMoods(); // Refrescar 
        moodCustomInput.value = ''; // Limpiar input manual
      }
    } catch (err) {
      console.error('Error al actualizar mood', err);
      alert('Error de conexión');
    } finally {
      saveMoodBtn.disabled = false;
      saveMoodBtn.textContent = 'Actualizar ✨';
    }
  }

  // --- Helpers UI del Modal ---
  function openMoodPicker() {
    moodPickerOverlay.classList.add('active');
  }

  function closeMoodPicker() {
    moodPickerOverlay.classList.remove('active');
  }

  // Event Listeners
  if (updateMoodBtn) updateMoodBtn.addEventListener('click', openMoodPicker);
  if (moodPickerClose) moodPickerClose.addEventListener('click', closeMoodPicker);
  
  // Opciones predefinidas (emojis clickeables)
  document.querySelectorAll('.mood-option').forEach(btn => {
    btn.addEventListener('click', () => {
      let emojiText = btn.getAttribute('data-mood');
      
      // Auto-actualizar y cerrar en un paso (esconde los botones)
      if (saveMoodBtn) saveMoodBtn.style.display = 'none';
      if (moodCustomInput) moodCustomInput.style.display = 'none';
      
      // Dar feedback visual sutil
      btn.style.transform = 'scale(1.2)';
      btn.style.boxShadow = '0 0 15px var(--primary-color)';
      
      updateMood(emojiText).then(() => {
        // Restaurar estado predeterminado cuando se vuelva a abrir
        setTimeout(() => {
           if (saveMoodBtn) saveMoodBtn.style.display = '';
           if (moodCustomInput) moodCustomInput.style.display = '';
           btn.style.transform = '';
           btn.style.boxShadow = '';
        }, 500);
      });
    });
  });

  // Guardar input manual
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener('click', () => {
      updateMood(moodCustomInput.value);
    });
  }

  // Cerrar al clickear afuera del modal
  if (moodPickerOverlay) {
    moodPickerOverlay.addEventListener('click', (e) => {
      if (e.target === moodPickerOverlay) {
        closeMoodPicker();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Iniciar
  document.addEventListener('DOMContentLoaded', loadMoods);
  
  // Podríamos poner un polling o actualizar cada 5 minutos
  setInterval(loadMoods, 1000 * 60 * 5); // 5 min
})();
