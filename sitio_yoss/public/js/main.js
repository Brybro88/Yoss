// ═══════════════════════════════════════════════════════════
// ROMANTIC WEB EXPERIENCE - Interactive Behaviors
// Created with intention for February 14th, 2026
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// 1. SMOOTH SCROLL NAVIGATION
// ────────────────────────────────────────────────────────────
const startBtn = document.getElementById('startBtn');

if (startBtn) {
  startBtn.addEventListener('click', () => {
    // Scroll to the next section smoothly
    const historySection = document.querySelector('.history');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ────────────────────────────────────────────────────────────
// 2. SCROLL REVEAL ANIMATIONS - IntersectionObserver
// ────────────────────────────────────────────────────────────
const revealSections = () => {
  const sections = document.querySelectorAll('.section');
  
  const observerOptions = {
    root: null,
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing after reveal
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
};

// Initialize scroll reveal when DOM is ready
document.addEventListener('DOMContentLoaded', revealSections);

// ────────────────────────────────────────────────────────────
// 3. ENHANCED HEART INTERACTION
// ────────────────────────────────────────────────────────────
const heart = document.getElementById('heart');
const heartMsg = document.getElementById('heartMsg');

if (heart && heartMsg) {
  heart.addEventListener('click', () => {
    // Remove hidden class and add show class for animation
    heartMsg.classList.remove('hidden');
    
    // Small delay to trigger CSS transition
    setTimeout(() => {
      heartMsg.classList.add('show');
    }, 10);
    
    // Create subtle confetti effect
    createHeartConfetti(heart);
    
    // Optional: remove the heartbeat animation after click
    heart.style.animation = 'none';
  });
}

// ────────────────────────────────────────────────────────────
// 4. SUBTLE CONFETTI EFFECT (Hearts & Sparkles)
// ────────────────────────────────────────────────────────────
function createHeartConfetti(targetElement) {
  const emojis = ['💖', '💗', '✨', '💫', '🌸'];
  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create 6 particles (representing the 6 gerberas)
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 9999;
      user-select: none;
      animation: confettiFly ${1 + Math.random() * 0.5}s ease-out forwards;
      opacity: 1;
    `;
    
    // Random direction
    const angle = (Math.PI * 2 * i) / 6; // Distribute evenly
    const velocity = 100 + Math.random() * 50;
    const xOffset = Math.cos(angle) * velocity;
    const yOffset = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--x', `${xOffset}px`);
    particle.style.setProperty('--y', `${yOffset}px`);
    
    document.body.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => particle.remove(), 1500);
  }
  
  // Add confetti animation dynamically if not already present
  if (!document.getElementById('confetti-animation')) {
    const style = document.createElement('style');
    style.id = 'confetti-animation';
    style.textContent = `
      @keyframes confettiFly {
        0% {
          transform: translate(0, 0) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--x), var(--y)) rotate(360deg) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ────────────────────────────────────────────────────────────
// 5. OPTIONAL: SUBTLE FLOATING PARTICLES BACKGROUND
// ────────────────────────────────────────────────────────────
// Uncomment if you want continuous floating particles
/*
function createFloatingParticles() {
  const particleCount = 8;
  const container = document.body;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.textContent = '🌸';
    particle.className = 'floating-particle';
    particle.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: ${Math.random() * 100}vh;
      font-size: ${0.8 + Math.random() * 0.5}rem;
      opacity: ${0.15 + Math.random() * 0.15};
      pointer-events: none;
      z-index: 1;
      animation: float ${10 + Math.random() * 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    
    container.appendChild(particle);
  }
  
  // Add float animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
      25% { transform: translateY(-30px) translateX(10px) rotate(5deg); }
      50% { transform: translateY(-50px) translateX(-10px) rotate(-5deg); }
      75% { transform: translateY(-30px) translateX(10px) rotate(5deg); }
    }
  `;
  document.head.appendChild(style);
}

// Activate only if desired (uncomment next line):
// document.addEventListener('DOMContentLoaded', createFloatingParticles);
*/

// ────────────────────────────────────────────────────────────
// 6. PERFORMANCE OPTIMIZATION - Reduced Motion Support
// ────────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable confetti for users who prefer reduced motion
  window.createHeartConfetti = () => {};
}

// ────────────────────────────────────────────────────────────
// 7. FLOATING GERBERA PARTICLES - Background Animation
// ────────────────────────────────────────────────────────────
function createFloatingParticles() {
  if (prefersReducedMotion) return; // Skip if user prefers reduced motion
  
  const particleCount = 12; // 12 gerberas floating
  const container = document.body;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.textContent = '🌸';
    particle.className = 'floating-particle';
    
    // Random positioning
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const size = 0.8 + Math.random() * 0.7; // 0.8rem to 1.5rem
    const duration = 12 + Math.random() * 8; // 12s to 20s
    const delay = Math.random() * 5; // 0s to 5s delay
    
    particle.style.cssText = `
      left: ${startX}vw;
      top: ${startY}vh;
      font-size: ${size}rem;
      animation: float ${duration}s ease-in-out infinite;
      animation-delay: ${delay}s;
    `;
    
    container.appendChild(particle);
  }
}

// Initialize floating particles on load
document.addEventListener('DOMContentLoaded', createFloatingParticles);

// ────────────────────────────────────────────────────────────
// 8. CURSOR TRAIL - Sparkle Stars Following Mouse
// ────────────────────────────────────────────────────────────
let lastTrailTime = 0;
const trailDelay = 80; // ms between trail elements

function createCursorTrail(e) {
  if (prefersReducedMotion) return;
  
  // Check if on mobile (no cursor trail on touch devices)
  if ('ontouchstart' in window) return;
  
  const now = Date.now();
  if (now - lastTrailTime < trailDelay) return;
  lastTrailTime = now;
  
  const stars = ['✨', '⭐', '💫', '🌟'];
  const star = stars[Math.floor(Math.random() * stars.length)];
  
  const trail = document.createElement('div');
  trail.textContent = star;
  trail.className = 'cursor-trail';
  trail.style.left = `${e.clientX}px`;
  trail.style.top = `${e.clientY}px`;
  
  document.body.appendChild(trail);
  
  // Remove after animation completes
  setTimeout(() => trail.remove(), 800);
}

// Activate cursor trail on mousemove
document.addEventListener('mousemove', createCursorTrail);

// ────────────────────────────────────────────────────────────
// 9. LIVE TIME COUNTER - Days Since Reconnection
// ────────────────────────────────────────────────────────────
function updateTimeCounter() {
  // Reconnection date: 62 days ago from Jan 30, 2026 = November 29, 2025
  const reconnectionDate = new Date('2025-11-29T00:00:00');
  
  const counterElement = document.getElementById('timeCounter');
  if (!counterElement) return;
  
  function update() {
    const now = new Date();
    const diff = now - reconnectionDate;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    counterElement.textContent = `${days} días, ${hours} horas, ${minutes} minutos, ${seconds} segundos`;
  }
  
  // Update immediately
  update();
  
  // Update every second
  setInterval(update, 1000);
}

// Initialize counter on load
document.addEventListener('DOMContentLoaded', updateTimeCounter);

// ────────────────────────────────────────────────────────────
// 10. REASON CARDS SCROLL REVEAL - Staggered Animation
// ────────────────────────────────────────────────────────────
function revealReasonCards() {
  const reasonCards = document.querySelectorAll('.reason-card');
  
  if (reasonCards.length === 0) return;
  
  const observerOptions = {
    root: null,
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing after reveal
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  reasonCards.forEach(card => {
    observer.observe(card);
  });
}

// Initialize reason cards reveal on load
document.addEventListener('DOMContentLoaded', revealReasonCards);

// ────────────────────────────────────────────────────────────
// 11. POLAROID PHOTOS SCROLL REVEAL
// ────────────────────────────────────────────────────────────
function revealPolaroids() {
  const polaroids = document.querySelectorAll('.polaroid');
  
  if (polaroids.length === 0) return;
  
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
  
  polaroids.forEach(polaroid => {
    observer.observe(polaroid);
  });
}

// Initialize polaroids reveal on load
document.addEventListener('DOMContentLoaded', revealPolaroids);

// ────────────────────────────────────────────────────────────
// 12. LIGHTBOX - Photo Gallery Modal
// ────────────────────────────────────────────────────────────
function initLightbox() {
  const polaroids = document.querySelectorAll('.polaroid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.querySelector('.lightbox-close');
  
  if (!lightbox) return;
  
  // Open lightbox when clicking on polaroid
  polaroids.forEach(polaroid => {
    polaroid.addEventListener('click', () => {
      const img = polaroid.querySelector('.polaroid-image img, .polaroid-image');
      const caption = polaroid.querySelector('.polaroid-caption');
      
      if (img && img.src && !img.src.includes('polaroid-placeholder')) {
        lightboxImage.src = img.src;
        lightboxImage.alt = caption ? caption.textContent : '';
      }
      
      if (lightboxCaption && caption) {
        lightboxCaption.textContent = caption.textContent;
      }
      
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    });
  });
  
  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }
  
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// Initialize lightbox on load
document.addEventListener('DOMContentLoaded', initLightbox);

// ────────────────────────────────────────────────────────────
// 13. SECRET MESSAGES - Mobile Tap Support
// ────────────────────────────────────────────────────────────
function initSecretMessages() {
  const secretWords = document.querySelectorAll('.secret-word');
  
  // On mobile, tap to toggle tooltip
  if ('ontouchstart' in window) {
    secretWords.forEach(word => {
      word.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle active class
        word.classList.toggle('active');
        
        // Close other active tooltips
        secretWords.forEach(other => {
          if (other !== word) {
            other.classList.remove('active');
          }
        });
      });
    });
    
    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('secret-word')) {
        secretWords.forEach(word => word.classList.remove('active'));
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initSecretMessages);

// ────────────────────────────────────────────────────────────
// 14. FLIP CARDS - Click to Reveal Promises
// ────────────────────────────────────────────────────────────
function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

document.addEventListener('DOMContentLoaded', initFlipCards);

// ────────────────────────────────────────────────────────────
// 15. INTERACTIVE QUIZ - Game Logic
// ────────────────────────────────────────────────────────────
const quizQuestions = [
  {
    question: "¿Cuál es mi flor favorita?",
    options: ["Rosas", "Gerberas", "Tulipanes", "Girasoles"],
    correct: 1
  },
  {
    question: "¿Hace cuánto reconectamos?",
    options: ["1 mes", "2 meses", "3 meses", "6 meses"],
    correct: 1
  },
  {
    question: "¿Qué estoy estudiando?",
    options: ["Derecho", "Medicina", "Ingeniería", "Psicología"],
    correct: 1
  },
  {
    question: "¿Cuántas razones te di de por qué eres especial?",
    options: ["3", "5", "6", "10"],
    correct: 2
  },
  {
    question: "¿Cuántas gerberas hay en el confetti del corazón?",
    options: ["4", "6", "8", "12"],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;

function initQuiz() {
  const startBtn = document.getElementById('quizStart');
  const restartBtn = document.getElementById('quizRestart');
  
  if (startBtn) {
    startBtn.addEventListener('click', startQuiz);
  }
  
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQuestion = 0;
      score = 0;
      startQuiz();
    });
  }
}

function startQuiz() {
  const welcomeDiv = document.getElementById('quizWelcome');
  const questionDiv = document.getElementById('quizQuestion');
  const resultDiv = document.getElementById('quizResult');
  
  welcomeDiv.classList.add('quiz-hidden');
  resultDiv.classList.add('quiz-hidden');
  questionDiv.classList.remove('quiz-hidden');
  
  showQuestion();
}

function showQuestion() {
  const q = quizQuestions[currentQuestion];
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('quizOptions');
  
  questionText.textContent = `Pregunta ${currentQuestion + 1}: ${q.question}`;
  
  optionsContainer.innerHTML = '';
  
  q.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(index));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  const q = quizQuestions[currentQuestion];
  const options = document.querySelectorAll('.quiz-option');
  
  // Disable all options
  options.forEach(opt => opt.style.pointerEvents = 'none');
  
  if (selectedIndex === q.correct) {
    options[selectedIndex].classList.add('correct');
    score++;
    // Small confetti burst
    createMiniConfetti();
  } else {
    options[selectedIndex].classList.add('incorrect');
    options[q.correct].classList.add('correct');
  }
  
  // Move to next question or show results
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1500);
}

function showResults() {
  const questionDiv = document.getElementById('quizQuestion');
  const resultDiv = document.getElementById('quizResult');
  const scoreText = document.getElementById('quizScore');
  
  questionDiv.classList.add('quiz-hidden');
  resultDiv.classList.remove('quiz-hidden');
  
  const percentage = (score / quizQuestions.length) * 100;
  let message = '';
  
  if (percentage === 100) {
    message = `¡Perfecto! ${score}/${quizQuestions.length} - ¡Me conoces increíblemente bien! 💕`;
  } else if (percentage >= 80) {
    message = `¡Excelente! ${score}/${quizQuestions.length} - ¡Prestas mucha atención! 🌸`;
  } else if (percentage >= 60) {
    message = `¡Bien! ${score}/${quizQuestions.length} - ¡Vamos conociendo más! 😊`;
  } else {
    message = `${score}/${quizQuestions.length} - ¡Hay más por descubrir juntos! 💫`;
  }
  
  scoreText.textContent = message;
}

function createMiniConfetti() {
  const emojis = ['💖', '✨', '🌸'];
  const count = 3;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 9999;
      animation: confettiFly 1s ease-out forwards;
    `;
    
    const angle = (Math.PI * 2 * i) / count;
    const xOffset = Math.cos(angle) * 100;
    const yOffset = Math.sin(angle) * 100;
    
    particle.style.setProperty('--x', `${xOffset}px`);
    particle.style.setProperty('--y', `${yOffset}px`);
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);

// ────────────────────────────────────────────────────────────
// 16. SONG PLAYER - Audio Controls
// ────────────────────────────────────────────────────────────
function initSongPlayer() {
  const playBtn = document.getElementById('playBtn');
  const audio = document.getElementById('romanticSong');
  
  if (!playBtn || !audio) return;
  
  let isPlaying = false;
  
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      playBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
    } else {
      audio.play();
      playBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
        </svg>
      `;
    }
    isPlaying = !isPlaying;
  });
  
  // Update on audio end
  audio.addEventListener('ended', () => {
    isPlaying = false;
    playBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  });
}

document.addEventListener('DOMContentLoaded', initSongPlayer);

// ────────────────────────────────────────────────────────────
// 17. DARK MODE TOGGLE - Theme Switcher
// ────────────────────────────────────────────────────────────
function initDarkMode() {
  const toggleBtn = document.getElementById('themeToggle');
  
  if (!toggleBtn) return;
  
  // Check localStorage for saved preference, DEFAULT to dark if none
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    // Only use light mode if explicitly saved
    document.body.classList.remove('dark-mode');
  } else {
    // Default to dark mode
    document.body.classList.add('dark-mode');
    if (!savedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }
  
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}

document.addEventListener('DOMContentLoaded', initDarkMode);

// ────────────────────────────────────────────────────────────
// 18. CONSTELLATION CANVAS - Interactive Particle System
// ────────────────────────────────────────────────────────────
function initConstellation() {
  const canvas = document.getElementById('constellation-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  });
  
  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    
    draw() {
      const isDark = document.body.classList.contains('dark-mode');
      ctx.fillStyle = isDark ? 'rgba(212, 165, 216, 0.8)' : 'rgba(255, 107, 157, 0.6)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  let particles = [];
  const particleCount = 60;
  let mouse = { x: null, y: null };
  
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Track mouse
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  function connectParticles() {
    const isDark = document.body.classList.contains('dark-mode');
    const maxDist = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.5;
          ctx.strokeStyle = isDark 
            ? `rgba(212, 165, 216, ${opacity})` 
            : `rgba(255, 107, 157, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      
      // Connect to mouse if nearby
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const opacity = (1 - dist / 200) * 0.8;
          ctx.strokeStyle = isDark 
            ? `rgba(212, 165, 216, ${opacity})` 
            : `rgba(255, 107, 157, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    connectParticles();
    
    requestAnimationFrame(animate);
  }
  
  initParticles();
  animate();
}

document.addEventListener('DOMContentLoaded', initConstellation);

