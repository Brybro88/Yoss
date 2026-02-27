/**
 * js/components/timelineAndRoulette.js 
 * Controla la visualización del Timeline Cronológico y la Ruleta de Citas
 * en la página principal para ambos usuarios.
 */

(function () {
  'use strict';

  // ═════════════════════════════════════════════════════════
  // TIMELINE
  // ═════════════════════════════════════════════════════════
  const timelineContainer = document.getElementById('timelineContainer');

  async function loadTimeline() {
    if (!timelineContainer) return;

    try {
      const res = await fetch('/api/timeline');
      if (!res.ok) throw new Error('Error al cargar timeline');
      
      const data = await res.json();
      renderTimeline(data.events || []);
    } catch (err) {
      console.error(err);
      timelineContainer.innerHTML = '<div class="timeline-empty">Ocurrió un error al cargar la historia...</div>';
    }
  }

  function renderTimeline(events) {
    if (events.length === 0) {
      timelineContainer.innerHTML = `
        <div class="timeline-empty-state">
          <div class="timeline-empty-state__icon">📸</div>
          <h3 class="timeline-empty-state__title">Aún no tenemos fotos aquí...</h3>
          <p class="timeline-empty-state__text">
            ¡Es la excusa perfecta para tomarnos la primera foto juntos pronto!
          </p>
          <a href="#roulette" class="timeline-empty-state__btn">
            Planear nuestra próxima foto 🎡
          </a>
        </div>
      `;
      return;
    }

    // Generar HTML del timeline (estilo vertical)
    let html = '<div class="timeline-track"></div>';
    
    events.forEach((event, index) => {
      const date = new Date(event.date).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      
      // Alternar clases left/right para un timeline tipo serpiente o zigzag
      const sideClass = index % 2 === 0 ? 'timeline-item--left' : 'timeline-item--right';
      
      html += `
        <div class="timeline-item ${sideClass}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">${date}</div>
            <h3 class="timeline-title">${escapeHtml(event.title)}</h3>
            <p class="timeline-desc">${escapeHtml(event.description)}</p>
          </div>
        </div>
      `;
    });

    timelineContainer.innerHTML = html;
  }

  // ═════════════════════════════════════════════════════════
  // LA RULETA DE CITAS
  // ═════════════════════════════════════════════════════════
  const spinBtn = document.getElementById('spinRouletteBtn');
  const rouletteText = document.getElementById('rouletteText');
  const addDateForm = document.getElementById('addDateForm');
  const msgEl = document.getElementById('addDateMsg');

  // Girar ruleta
  if (spinBtn) {
    spinBtn.addEventListener('click', async () => {
      if (spinBtn.disabled) return;
      
      spinBtn.disabled = true;
      rouletteText.textContent = 'Decidiendo el destino... 🎲';
      rouletteText.classList.add('spinning'); // Animación CSS que haremos

      // Simular tiempo de giro
      setTimeout(async () => {
        try {
          const res = await fetch('/api/dates/random');
          const data = await res.json();
          
          rouletteText.classList.remove('spinning');
          
          if (data.success) {
            rouletteText.innerHTML = `<strong>${escapeHtml(data.idea.title)}</strong><br><small style="font-size: 0.8rem; opacity: 0.7;">(Categoría: ${data.idea.category})</small>`;
            spinBtn.textContent = '¡Qué gran idea! ✨';
            
            // Opcional: Lluvia de confeti
            if (window.confetti) window.confetti();
            
          } else {
            rouletteText.textContent = data.message || 'La ruleta está vacía 🥲';
            spinBtn.textContent = 'Intenta otra vez';
          }
        } catch (err) {
          rouletteText.classList.remove('spinning');
          rouletteText.textContent = 'Hubo un error al girar...';
          spinBtn.textContent = 'Reintentar';
        } finally {
          setTimeout(() => { spinBtn.disabled = false; spinBtn.textContent = 'Girar de Nuevo 🎡'; }, 3000);
        }
      }, 1500); // 1.5s de suspenso
    });
  }

  // Agregar idea a la ruleta
  if (addDateForm) {
    addDateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const titleInput = document.getElementById('dateIdeaInput').value;
      const catInput = document.getElementById('dateCategoryInput').value;
      
      if (!titleInput.trim()) return;

      const btn = addDateForm.querySelector('button');
      btn.disabled = true;
      msgEl.textContent = 'Guardando...';

      try {
        const res = await fetch('/api/dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleInput, category: catInput })
        });
        
        const data = await res.json();
        
        if (data.success) {
          msgEl.textContent = '¡Idea agregada con éxito! 💖';
          msgEl.style.color = '#4ade80'; // Verde
          document.getElementById('dateIdeaInput').value = '';
        } else {
          msgEl.textContent = data.message || 'Error al guardar';
          msgEl.style.color = '#ff69b4';
        }
      } catch (err) {
        msgEl.textContent = 'Error de conexión';
      } finally {
        btn.disabled = false;
        setTimeout(() => { msgEl.textContent = ''; }, 3000);
      }
    });
  }

  // Helper para escapar HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Cargar Timeline al inicio
  document.addEventListener('DOMContentLoaded', loadTimeline);

})();
