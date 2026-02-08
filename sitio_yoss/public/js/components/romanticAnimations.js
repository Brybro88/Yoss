// ═══════════════════════════════════════════════════════════
// ROMANTIC ANIMATIONS - Sistema Global de Animaciones
// Corazones flotantes, estrellas, parallax y efectos mágicos
// ═══════════════════════════════════════════════════════════

/**
 * Inicializa todos los sistemas de animación romántica
 */
function initRomanticAnimations() {
  // Solo inicializar si no se prefiere movimiento reducido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    createFloatingHearts();
    createStarField();
    initParallaxEffect();
  }
  
  // Estas siempre se inicializan (usan CSS principalmente)
  initSectionTransitions();
}

/**
 * Crea corazones flotantes en el fondo
 * @param {number} count - Número de corazones a crear
 */
function createFloatingHearts(count = 8) {
  const container = document.getElementById('floatingHearts');
  if (!container) {
    // Crear contenedor si no existe
    const newContainer = document.createElement('div');
    newContainer.id = 'floatingHearts';
    newContainer.className = 'floating-hearts-container';
    document.body.appendChild(newContainer);
    return createFloatingHearts(count);
  }
  
  const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '💞'];
  
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    
    // Posición inicial random
    const startX = Math.random() * 100;
    const duration = 15 + Math.random() * 10; // 15-25 segundos
    const delay = Math.random() * 5; // 0-5 segundos delay
    const drift = (Math.random() - 0.5) * 150; // Deriva horizontal
    const rotation = Math.random() * 360;
    
    heart.style.left = `${startX}%`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.setProperty('--drift', `${drift}px`);
    heart.style.setProperty('--rotation', `${rotation}deg`);
    
    container.appendChild(heart);
  }
}

/**
 * Crea campo de estrellas de fondo
 * @param {number} count - Número de estrellas a crear
 */
function createStarField(count = 50) {
  const container = document.getElementById('starField');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'starField';
    newContainer.className = 'star-field-container';
    document.body.appendChild(newContainer);
    return createStarField(count);
  }
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Diferentes tamaños de estrellas
    const size = Math.random();
    if (size < 0.3) {
      star.classList.add('small');
    } else if (size > 0.7) {
      star.classList.add('large');
    }
    
    // Posición aleatoria
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    // Animación con delay aleatorio
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${2 + Math.random() * 2}s`;
    
    container.appendChild(star);
  }
}

/**
 * Inicializa efecto parallax en scroll
 */
function initParallaxEffect() {
  const parallaxElements = document.querySelectorAll('.parallax-layer');
  
  if (parallaxElements.length === 0) {
    // No hay elementos parallax configurados
    return;
  }
  
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallaxSpeed || 0.5);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
}

/**
 * Inicializa transiciones suaves entre secciones
 */
function initSectionTransitions() {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach((section, index) => {
    // Agregar clase de transición a ciertas secciones
    if (index > 0 && index < sections.length - 1) {
      section.classList.add('section-transition');
    }
  });
}

/**
 * Crea explosión de brillos en una posición específica
 * @param {number} x - Posición X en píxeles
 * @param {number} y - Posición Y en píxeles
 * @param {number} count - Número de brillos
 */
function createSparkleBurst(x, y, count = 8) {
  if (window.prefersReducedMotion) return;
  
  const sparkles = ['✨', '⭐', '💫', '🌟'];
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-burst';
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    const angle = (Math.PI * 2 * i) / count;
    const distance = 50 + Math.random() * 50;
    const xOffset = Math.cos(angle) * distance;
    const yOffset = Math.sin(angle) * distance;
    
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty('--burst-x', `${xOffset}px`);
    sparkle.style.setProperty('--burst-y', `${yOffset}px`);
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
  }
}

/**
 * Agrega efecto de brillo a un elemento
 * @param {HTMLElement} element - Elemento al que agregar el efecto
 * @param {number} duration - Duración en milisegundos
 */
function addGlowPulse(element, duration = 2000) {
  element.classList.add('glow-pulse');
  
  if (duration > 0) {
    setTimeout(() => {
      element.classList.remove('glow-pulse');
    }, duration);
  }
}

/**
 * Agrega efecto shimmer a texto
 * @param {HTMLElement} element - Elemento de texto
 */
function addShimmerEffect(element) {
  element.classList.add('shimmer-text');
}

/**
 * Anima entrada de elemento con bounce
 * @param {HTMLElement} element - Elemento a animar
 */
function bounceInElement(element) {
  element.classList.add('bounce-in');
  
  // Remover clase después de animación
  setTimeout(() => {
    element.classList.remove('bounce-in');
  }, 1000);
}

/**
 * Anima entrada de elemento con fade y escala
 * @param {HTMLElement} element - Elemento a animar
 */
function fadeInScaleElement(element) {
  element.classList.add('fade-in-scale');
  
  setTimeout(() => {
    element.classList.remove('fade-in-scale');
  }, 800);
}

/**
 * Crea lluvia de confetti romántico
 * @param {number} duration - Duración en milisegundos
 */
function createRomanticConfetti(duration = 3000) {
  if (window.prefersReducedMotion) return;
  
  const emojis = ['💖', '💗', '💕', '🌸', '✨', '💫', '🌺'];
  const interval = 100;
  const iterations = duration / interval;
  
  let count = 0;
  const confettiInterval = setInterval(() => {
    if (count >= iterations) {
      clearInterval(confettiInterval);
      return;
    }
    
    const confetti = document.createElement('div');
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -50px;
      font-size: ${1 + Math.random() * 1.5}rem;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.8;
      animation: fall ${3 + Math.random() * 2}s linear forwards;
    `;
    
    const xOffset = (Math.random() - 0.5) * 200;
    confetti.style.setProperty('--x-offset', `${xOffset}px`);
    
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
    
    count++;
  }, interval);
}

/**
 * Limpia todas las animaciones activas
 */
function cleanupAnimations() {
  // Remover contenedores de partículas
  const floatingHearts = document.getElementById('floatingHearts');
  const starField = document.getElementById('starField');
  
  if (floatingHearts) floatingHearts.remove();
  if (starField) starField.remove();
  
  // Remover elementos temporales
  document.querySelectorAll('.sparkle-burst, .petal, .floating-heart, .star').forEach(el => {
    el.remove();
  });
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
  window.romanticAnimations = {
    createSparkleBurst,
    addGlowPulse,
    addShimmerEffect,
    bounceInElement,
    fadeInScaleElement,
    createRomanticConfetti,
    cleanupAnimations
  };
}

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initRomanticAnimations };
}
