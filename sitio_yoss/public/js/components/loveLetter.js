
const LETTER_CONTENT = `Mi amor, mi cariñito...

Hay palabras que llevaba tiempo queriendo decirte, pero que solo ahora encuentro el momento perfecto para expresar.

Cuando volvimos a hablar después de más de dos años, sentí algo que no esperaba: la certeza de que lo que teníamos nunca se había ido realmente. Estaba ahí, esperando, como si el tiempo no hubiera pasado.

Admiro profundamente quién eres. Tu disciplina para estudiar medicina, tu pasión, tu autenticidad... Todo eso me hace querer ser mejor persona cada día.

Cuando pienso en el futuro, en construir algo bonito, en crear momentos que importen... te imagino ahí. A mi lado. Sonriendo. Siendo tú misma.

No sé exactamente qué nos depara el destino, pero sí sé que quiero descubrirlo contigo.

Porque después de todo este tiempo, de todas las circunstancias, de todo lo vivido... seguimos aquí. Y eso tiene que significar algo.

Gracias por volver. Gracias por quedarte. Gracias por ser tú.

Con todo mi corazón,
Siempre tuyo 💖`;

/**
 * Inicializa la sección de carta emocional
 */
function initLoveLetter() {
  const openBtn = document.getElementById('openLetterBtn');
  const modal = document.getElementById('loveLetterModal');
  const closeBtn = document.querySelector('.close-letter');
  const envelopeContainer = document.querySelector('.envelope-container');
  const letterText = document.getElementById('letterText');
  
  if (!openBtn || !modal || !closeBtn || !envelopeContainer || !letterText) {
    console.warn('Love letter elements not found in DOM');
    return;
  }
  
  // Abrir carta
  openBtn.addEventListener('click', () => {
    openLetter();
  });
  
  // Cerrar carta
  closeBtn.addEventListener('click', () => {
    closeLetter();
  });
  
  // Cerrar con ESC o click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLetter();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLetter();
    }
  });
}

/**
 * Abre el modal de la carta con animaciones
 */
function openLetter() {
  const modal = document.getElementById('loveLetterModal');
  const envelopeContainer = document.querySelector('.envelope-container');
  const letterText = document.getElementById('letterText');
  
  // Mostrar modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Animar sobre abriéndose después de breve delay
  setTimeout(() => {
    envelopeContainer.classList.add('opened');
  }, 600);
  
  // Iniciar efecto typewriter después de que el sobre esté abierto
  setTimeout(() => {
    startTypewriter(letterText, LETTER_CONTENT);
  }, 3000);
  
  // Crear pétalos cayendo
  setTimeout(() => {
    createFallingPetals();
  }, 2500);
}

/**
 * Cierra el modal de la carta
 */
function closeLetter() {
  const modal = document.getElementById('loveLetterModal');
  const envelopeContainer = document.querySelector('.envelope-container');
  const letterText = document.getElementById('letterText');
  const petalsContainer = document.getElementById('petalsContainer');
  
  // Remover clase opened
  envelopeContainer.classList.remove('opened');
  
  // Cerrar modal después de animación
  setTimeout(() => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Limpiar texto y pétalos
    letterText.textContent = '';
    letterText.classList.remove('typing');
    if (petalsContainer) {
      petalsContainer.innerHTML = '';
    }
  }, 800);
}

/**
 * Efecto máquina de escribir para el texto de la carta
 * @param {HTMLElement} element - Elemento donde se escribirá el texto
 * @param {string} text - Texto a escribir
 * @param {number} speed - Velocidad en ms por caracter (default: 100ms para lectura muy pausada)
 */
function startTypewriter(element, text, speed = 100) {
  let index = 0;
  element.textContent = '';
  element.classList.add('typing');
  
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      
      // Auto-scroll al final del texto
      const letterContent = element.closest('.letter-content');
      if (letterContent) {
        letterContent.scrollTop = letterContent.scrollHeight;
      }
    } else {
      clearInterval(typeInterval);
      element.classList.remove('typing');
    }
  }, speed);
}

/**
 * Crea pétalos cayendo en el fondo del modal
 */
function createFallingPetals() {
  const container = document.getElementById('petalsContainer');
  if (!container) return;
  
  const petalEmojis = ['🌸', '🌺', '🌷', '💮', '🏵️'];
  const petalCount = 20;
  
  // Limpiar pétalos existentes
  container.innerHTML = '';
  
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    
    // Posición inicial aleatoria
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 4; // 8-12 segundos
    const delay = Math.random() * 3; // 0-3 segundos de delay
    const xOffset = (Math.random() - 0.5) * 200; // -100 a 100 px de drift
    
    petal.style.left = `${startX}%`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.setProperty('--x-offset', `${xOffset}px`);
    
    container.appendChild(petal);
    
    // Remover después de la animación
    setTimeout(() => {
      petal.remove();
    }, (duration + delay) * 1000);
  }
  
  // Crear nuevos pétalos continuamente mientras el modal esté abierto
  const petalInterval = setInterval(() => {
    const modal = document.getElementById('loveLetterModal');
    if (!modal.classList.contains('active')) {
      clearInterval(petalInterval);
      return;
    }
    
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 4;
    const xOffset = (Math.random() - 0.5) * 200;
    
    petal.style.left = `${startX}%`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.setProperty('--x-offset', `${xOffset}px`);
    
    container.appendChild(petal);
    
    setTimeout(() => {
      petal.remove();
    }, duration * 1000);
  }, 2000); // Nuevo pétalo cada 2 segundos
}

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initLoveLetter };
}
