// ═══════════════════════════════════════════════════════════
// CINEMATIC NAVIGATION - Navegación Romántica Mejorada
// Navbar, barra de progreso, scroll to top, indicadores
// ═══════════════════════════════════════════════════════════

/**
 * Inicializa el sistema de navegación cinemática
 */
function initNavigation() {
  initProgressBar();
  initNavbar();
  initScrollToTop();
  initSectionIndicators();
  initSmoothScroll();
}

/**
 * Inicializa la barra de progreso de lectura
 */
function initProgressBar() {
  const progressFill = document.querySelector('.reading-progress-fill');
  
  if (!progressFill) {
    console.warn('Progress bar not found');
    return;
  }
  
  function updateProgressBar() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const totalScrollable = documentHeight - windowHeight;
    const progress = (scrollTop / totalScrollable) * 100;
    
    progressFill.style.width = `${Math.min(progress, 100)}%`;
  }
  
  window.addEventListener('scroll', updateProgressBar);
  updateProgressBar(); // Initial call
}

/**
 * Inicializa la navbar con hide/show en scroll
 */
function initNavbar() {
  const navbar = document.querySelector('.romantic-navbar');
  
  if (!navbar) {
    console.warn('Navbar not found');
    return;
  }
  
  let lastScrollTop = 0;
  const scrollThreshold = 200; // Mostrar navbar después de 200px de scroll
  
  function updateNavbar() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold) {
      navbar.classList.add('visible');
      
      // Hide on scroll down, show on scroll up
      if (scrollTop > lastScrollTop && scrollTop > scrollThreshold + 100) {
        navbar.classList.add('scroll-down');
        navbar.classList.remove('scroll-up');
      } else {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
      }
    } else {
      navbar.classList.remove('visible', 'scroll-down', 'scroll-up');
    }
    
    lastScrollTop = scrollTop;
  }
  
  window.addEventListener('scroll', updateNavbar);
  
  // Update active link based on current section
  updateActiveNavLink();
  window.addEventListener('scroll', updateActiveNavLink);
}

/**
 * Actualiza el link activo en la navbar según la sección visible
 */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  const scrollPosition = window.pageYOffset + window.innerHeight / 3;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/**
 * Inicializa el botón scroll to top
 */
function initScrollToTop() {
  const scrollToTopBtn = document.querySelector('.scroll-to-top');
  
  if (!scrollToTopBtn) {
    console.warn('Scroll to top button not found');
    return;
  }
  
  function updateScrollToTopButton() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 500) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  }
  
  window.addEventListener('scroll', updateScrollToTopButton);
  
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Inicializa los indicadores de sección (dots laterales)
 */
function initSectionIndicators() {
  const indicator = document.querySelector('.section-indicator');
  
  if (!indicator) {
    // Crear indicador si no existe
    const sections = document.querySelectorAll('.section[id]');
    if (sections.length === 0) return;
    
    const newIndicator = document.createElement('div');
    newIndicator.className = 'section-indicator';
    
    sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'section-dot';
      dot.dataset.section = section.dataset.navTitle || `Sección ${index + 1}`;
      dot.dataset.target = `#${section.id}`;
      
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      newIndicator.appendChild(dot);
    });
    
    document.body.appendChild(newIndicator);
    return initSectionIndicators(); // Re-initialize
  }
  
  function updateSectionIndicators() {
    const sections = document.querySelectorAll('.section[id]');
    const dots = indicator.querySelectorAll('.section-dot');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Mostrar indicador después de cierto scroll
    if (scrollTop > 300) {
      indicator.classList.add('visible');
    } else {
      indicator.classList.remove('visible');
    }
    
    // Actualizar dot activo
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const dot = dots[index];
      
      if (!dot) return;
      
      if (scrollTop >= sectionTop - 200 && scrollTop < sectionTop + sectionHeight - 200) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateSectionIndicators);
  updateSectionIndicators();
}

/**
 * Inicializa smooth scroll para todos los links anchor
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Actualizar URL sin saltar
        history.pushState(null, null, targetId);
      }
    });
  });
}

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initNavigation };
}
