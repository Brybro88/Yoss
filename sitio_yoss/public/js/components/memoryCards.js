
const MEMORY_MESSAGES = [
  "La primera vez que te vi, supe que eras especial. El tiempo solo lo confirmó.",
  "Tu risa es mi sonido favorito en todo el mundo. Me hace creer que todo va a estar bien.",
  "Admiro tu fortaleza para perseguir tus sueños. Me inspiras a ser mejor cada día.",
  "Cada conversación contigo se siente como volver a casa después de un largo viaje.",
  "Pienso en ti cuando veo algo bonito y pienso: 'Le gustaría ver esto'.",
  "Quiero ser la persona que esté ahí para ti en tus peores días y celebrar contigo en los mejores.",
  "Me encanta cómo eres auténtica. No tienes que fingir conmigo, y yo no tengo que fingir contigo.",
  "El futuro me emociona cuando te imagino en él. Juntos podemos crear algo hermoso."
];

/**
 * Iconos para las tarjetas (frente)
 */
const CARD_ICONS = ['💕', '💖', '💗', '💝', '💘', '💞', '💓', '🌸'];

/**
 * Inicializa el sistema de memory cards
 */
function initMemoryCards() {
  const cards = document.querySelectorAll('.memory-card');
  
  if (cards.length === 0) {
    console.warn('Memory cards not found in DOM');
    return;
  }
  
  // Configurar cada carta
  cards.forEach((card, index) => {
    // Asignar mensaje del dataset o del array
    const message = card.dataset.message || MEMORY_MESSAGES[index % MEMORY_MESSAGES.length];
    const messageElement = card.querySelector('.card-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    // Asignar icono
    const iconElement = card.querySelector('.card-icon');
    if (iconElement && !iconElement.textContent.trim()) {
      iconElement.textContent = CARD_ICONS[index % CARD_ICONS.length];
    }
    
    // Event listener para flip
    card.addEventListener('click', () => {
      handleCardFlip(card);
    });
  });
  
  // Configurar scroll reveal
  revealMemoryCards();
  
  // Verificar si todas las cartas fueron descubiertas
  checkAllCardsRevealed();
}

/**
 * Maneja el volteo de una carta individual
 * @param {HTMLElement} card - Carta a voltear
 */
function handleCardFlip(card) {
  if (card.classList.contains('flipped')) {
    // Si ya está volteada, voltear de regreso
    card.classList.remove('flipped');
  } else {
    // Voltear la carta
    card.classList.add('flipped');
    
    // Reproducir sonido suave (opcional)
    playCardFlipSound();
    
    // Crear pequeño efecto de partículas
    createCardSparkles(card);
    
    // Verificar si todas fueron reveladas
    setTimeout(() => {
      checkAllCardsRevealed();
    }, 800);
  }
}

/**
 * Reproduce un sonido suave al voltear carta
 * Usa Web Audio API para generar tono simple
 */
function playCardFlipSound() {
  // Verificar si usuario prefiere silencio
  if (window.prefersReducedMotion) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar tono agradable (nota musical)
    oscillator.frequency.value = 523.25; // Do (C5)
    oscillator.type = 'sine';
    
    // Volumen suave
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Silenciosamente fallar si Web Audio no está disponible
    console.debug('Web Audio API not available');
  }
}

/**
 * Crea efecto de brillos al voltear carta
 * @param {HTMLElement} card - Carta que generó el evento
 */
function createCardSparkles(card) {
  if (window.prefersReducedMotion) return;
  
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const sparkles = ['✨', '⭐', '💫'];
  const count = 5;
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.className = 'sparkle-burst';
    
    const angle = (Math.PI * 2 * i) / count;
    const distance = 60 + Math.random() * 40;
    const xOffset = Math.cos(angle) * distance;
    const yOffset = Math.sin(angle) * distance;
    
    sparkle.style.left = `${centerX}px`;
    sparkle.style.top = `${centerY}px`;
    sparkle.style.setProperty('--burst-x', `${xOffset}px`);
    sparkle.style.setProperty('--burst-y', `${yOffset}px`);
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
  }
}

/**
 * Configura IntersectionObserver para revelar cartas al hacer scroll
 */
function revealMemoryCards() {
  const cards = document.querySelectorAll('.memory-card');
  
  if (cards.length === 0) return;
  
  const observerOptions = {
    root: null,
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  cards.forEach(card => {
    observer.observe(card);
  });
}

/**
 * Verifica si todas las cartas fueron reveladas
 * Muestra mensaje de completitud si es así
 */
function checkAllCardsRevealed() {
  const cards = document.querySelectorAll('.memory-card');
  const flippedCards = document.querySelectorAll('.memory-card.flipped');
  
  if (cards.length === 0) return;
  
  if (flippedCards.length === cards.length) {
    showCompletionMessage();
  }
}

/**
 * Muestra mensaje cuando todas las cartas fueron descubiertas
 */
function showCompletionMessage() {
  // Verificar si ya existe el mensaje
  let completionDiv = document.querySelector('.memory-completion');
  
  if (!completionDiv) {
    // Crear mensaje de completitud
    completionDiv = document.createElement('div');
    completionDiv.className = 'memory-completion';
    completionDiv.innerHTML = `
      <h3>¡Has descubierto todos los mensajes! 💖</h3>
  >
    `;
    
    const memorySection = document.querySelector('.memory-game');
    if (memorySection) {
      memorySection.appendChild(completionDiv);
    }
  }
  
  // Mostrar con animación
  setTimeout(() => {
    completionDiv.classList.add('show');
  }, 300);
  
  // Crear confetti especial
  createCompletionConfetti();
}

/**
 * Crea efecto confetti especial al completar todas las cartas
 */
function createCompletionConfetti() {
  if (window.prefersReducedMotion) return;
  
  const emojis = ['💖', '💗', '💕', '🌸', '✨', '💫'];
  const count = 30;
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -50px;
        font-size: ${1 + Math.random()}rem;
        pointer-events: none;
        z-index: 9999;
        animation: fall ${3 + Math.random() * 2}s linear forwards;
      `;
      
      const xOffset = (Math.random() - 0.5) * 200;
      confetti.style.setProperty('--x-offset', `${xOffset}px`);
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }, i * 50); // Stagger creation
  }
}

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initMemoryCards };
}
