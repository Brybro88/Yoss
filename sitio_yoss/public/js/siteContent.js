/**
 * src/public/js/siteContent.js
 * 
 * Gestiona la carga de contenido dinámico (CMS) y validación de Roles (Frontend)
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Obtener la sesión actual para saber el rol
    const userRes = await fetch('/api/auth/me');
    let userRole = 'partner'; // Por defecto, asumimos los menores privilegios
    
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        userRole = userData.user.role;
        // Exponer el rol globalmente para otros scripts (como easterEggs.js o sharedSpace.js)
        window.USER_ROLE = userRole; 
      }
    }

    // 2. Ocultar o desactivar elementos dependiendo del rol
    applyRolePermissions(userRole);

    // 3. Obtener el contenido del CMS
    const contentRes = await fetch('/api/site-content');
    if (contentRes.ok) {
      const contentData = await contentRes.json();
      if (contentData.success && contentData.data) {
        injectDynamicContent(contentData.data);
      }
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar la configuración dinámica:', error);
  }
});

function applyRolePermissions(role) {
  if (role === 'partner') {
    // Ocultar todos los elementos exclusivos de admin
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    adminOnlyElements.forEach(el => el.style.display = 'none');

    // Títulos cálidos para la partner
    const heroWelcome = document.getElementById('heroWelcome');
    if (heroWelcome) heroWelcome.textContent = 'Tu espacio seguro, hermosa ✨';

    document.title = 'Nuestro Universo 💖';
  } else if (role === 'admin') {
    const adminBtn = document.getElementById('adminPanelBtn');
    if (adminBtn) adminBtn.classList.remove('hidden');
  }
}

function injectDynamicContent(data) {
  const heroWelcome = document.getElementById('heroWelcome');
  const heroMessage = document.getElementById('heroMessage');
  const dailyNoteMessage = document.getElementById('dailyNoteMessage');

  // El CMS por ahora envía "welcomeMessage" y "dailyNote".
  // Puedes expandirlo en el backend cuando desees enviar el h1 explícito separadamente.
  // Por defecto mapeamos welcomeMessage al <p>
  if (heroMessage && data.welcomeMessage) {
    // Reemplaza los saltos de línea con <br>
    heroMessage.innerHTML = data.welcomeMessage.replace(/\n/g, '<br/>');
  }

  if (dailyNoteMessage && data.dailyNote) {
    dailyNoteMessage.innerHTML = `${data.dailyNote} 🌸`;
  }
}
