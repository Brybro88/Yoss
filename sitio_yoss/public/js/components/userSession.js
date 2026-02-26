/**
 * js/components/userSession.js — Gestión de sesión de usuario
 * 
 * Responsabilidades:
 *   - Verificar autenticación al cargar la página
 *   - Mostrar saludo personalizado en la user bar
 *   - Manejar logout
 *   - Redirigir a login si no hay sesión válida
 *   - Mostrar popup de Momentos Especiales (si hay uno activo)
 */

(function () {
  'use strict';

  // ─── DOM Elements ───
  const userBar = document.getElementById('userBar');
  const userNameEl = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  const spaceBtn = document.getElementById('sharedSpaceBtn');
  const unreadBadge = document.getElementById('unreadBadge');

  // ─── State ───
  let currentUser = null;

  /**
   * Verificar sesión al cargar la página.
   * Si no hay sesión válida, redirige a login.
   */
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'same-origin',
      });

      if (!res.ok) {
        window.location.href = '/login.html';
        return;
      }

      const data = await res.json();
      currentUser = data.user;

      // Mostrar el nombre en la user bar
      if (userNameEl) {
        userNameEl.textContent = currentUser.displayName;
      }

      const adminPanelBtn = document.getElementById('adminPanelBtn');
      if (adminPanelBtn && currentUser.role === 'admin') {
        adminPanelBtn.classList.remove('hidden');
      }

      // Mostrar la barra con animación
      if (userBar) {
        setTimeout(() => {
          userBar.classList.add('visible');
        }, 300);
      }

      // Verificar cartas sin leer
      checkUnreadLetters();

      // Verificar si hay un Momento Especial activo
      checkActiveMoment();

    } catch (error) {
      console.error('Error al verificar sesión:', error);
      window.location.href = '/login.html';
    }
  }

  /**
   * Cerrar sesión
   */
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }

    window.location.href = '/login.html';
  }

  /**
   * Verificar si hay cartas sin leer para mostrar badge
   */
  async function checkUnreadLetters() {
    try {
      const res = await fetch('/api/letters', {
        credentials: 'same-origin',
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.success && data.letters) {
        const unread = data.letters.filter(
          (l) => !l.isRead && l.to && l.to._id !== currentUser.id
            ? false
            : !l.isRead && l.to && (l.to._id === currentUser.id || l.to === currentUser.id)
        );

        if (unreadBadge) {
          if (unread.length > 0) {
            unreadBadge.textContent = unread.length;
            unreadBadge.classList.remove('hidden');
          } else {
            unreadBadge.classList.add('hidden');
          }
        }
      }
    } catch (error) {
      console.log('Letters API no disponible aún');
    }
  }

  /**
   * Verificar si hay un Momento Especial activo no visto
   * y mostrarlo como popup romántico.
   */
  async function checkActiveMoment() {
    try {
      const res = await fetch('/api/moments/active', {
        credentials: 'same-origin',
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.moment) return;

      showMomentPopup(data.moment);
    } catch (error) {
      // Silenciar — puede que la API no esté disponible
      console.log('Moments API no disponible aún');
    }
  }

  /**
   * Mostrar el popup de un Momento Especial
   */
  function showMomentPopup(moment) {
    const overlay = document.getElementById('momentPopupOverlay');
    const emojiEl = document.getElementById('momentPopupEmoji');
    const titleEl = document.getElementById('momentPopupTitle');
    const contentEl = document.getElementById('momentPopupContent');
    const closeBtn = document.getElementById('momentPopupClose');

    if (!overlay) return;

    // Poblar contenido
    if (emojiEl) emojiEl.textContent = moment.emoji || '💖';
    if (titleEl) titleEl.textContent = moment.title;
    if (contentEl) contentEl.textContent = moment.content;

    // Mostrar con delay para que termine de cargar la página
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 800);

    // Cerrar y marcar como visto
    if (closeBtn) {
      closeBtn.addEventListener('click', async () => {
        overlay.classList.remove('visible');

        // Marcar como visto en el backend
        try {
          await fetch(`/api/moments/${moment._id}/seen`, {
            method: 'PATCH',
            credentials: 'same-origin',
          });
        } catch (err) {
          console.error('Error al marcar momento como visto:', err);
        }
      });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', function handleEsc(e) {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) {
        closeBtn?.click();
        document.removeEventListener('keydown', handleEsc);
      }
    });
  }

  /**
   * Obtener usuario actual (para uso de otros módulos)
   */
  window.YossSession = {
    getUser: () => currentUser,
    refreshUnread: checkUnreadLetters,
  };

  // ─── Event Listeners ───
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', checkSession);
})();

