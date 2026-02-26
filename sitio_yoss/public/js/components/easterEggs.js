/**
 * js/components/easterEggs.js — Escucha códigos secretos en el teclado
 * 
 * Este módulo almacena las teclas presionadas y busca secuencias
 * secretas para disparar animaciones especiales.
 */

(function () {
  'use strict';

  // Almacena las últimas teclas presionadas
  let inputBuffer = '';
  let resetTimer;

  // ─── 10 EASTER EGGS (CÓDIGOS SECRETOS EDITABLES) ───
  // Puedes cambiar las palabras entre comillas por tus propios códigos.
  // Procura mantenerlas en MINÚSCULAS y sin espacios.
  const easterEggs = {
    // 1. Lluvia de corazones (reemplazo al clásico teamo)
    'teamo': () => triggerEmojiShower(['💖', '💕', '💗', '💓'], 40),
    
    // 2. Chispas doradas y mensaje mágico (Reemplazo del 1402 a algo personalizable)
    'magia': () => triggerGoldenSparkles('Magia Pura ✨'),
    
    // 3. Flor Sakura brotando
    'yoss': () => triggerFlowerBloom(),
    
    // 4. Texto Neón vibrante
    'siempre': () => triggerNeonText('Para Siempre ♾️'),
    
    // 5. Estrellas fugaces cruzando la noche
    'estrellas': () => triggerShootingStars(),
    
    // 6. Espiral de galaxia cósmica
    'infinito': () => triggerGalaxySpiral(),
    
    // 7. Lluvia romántica de besos
    'beso': () => triggerEmojiShower(['💋', '😘', '♥️', '😍'], 25),
    
    // 8. Mensaje flotante con brillo neón suave
    'juntos': () => triggerFloatingGlow('Tú y Yo', '#ff69b4'),
    
    // 9. Mariposas mágicas revoloteando hacia arriba
    'mariposa': () => triggerButterflies(),
    
    // 10. Amanecer cálido que ilumina la pantalla
    'sol': () => triggerSunrise()
  };

  // ─── LISTENER DE TECLADO ───
  document.addEventListener('keydown', (e) => {
    // Ignorar si el usuario está escribiendo en un input o textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    
    // Ignorar comandos especiales
    if (e.key.length !== 1) return;

    // Agregar al buffer histórico
    inputBuffer += e.key.toLowerCase();
    
    // Limitar buffer a 20 caracteres para rendimiento
    if (inputBuffer.length > 20) inputBuffer = inputBuffer.slice(-20);

    // Revisar si existe alguna coincidencia con los códigos
    for (const [code, action] of Object.entries(easterEggs)) {
      if (inputBuffer.endsWith(code)) {
        action();
        inputBuffer = ''; // Resetear para evitar loop
        break;
      }
    }

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { inputBuffer = ''; }, 3000);
  });

  // ─── INTEGRACIÓN TECLADO MÁGICO (MÓVIL) ───
  const magicKb = document.getElementById('magicKeyboard');
  const openKbBtn = document.getElementById('openMobileKeyboardBtn');
  const closeKbBtn = document.getElementById('closeKeyboardBtn');

  if (magicKb && openKbBtn && closeKbBtn) {
    // Abrir/Cerrar Teclado
    openKbBtn.addEventListener('click', () => {
      magicKb.classList.add('active');
      openKbBtn.style.display = 'none'; // Ocultar flotante
    });

    closeKbBtn.addEventListener('click', () => {
      magicKb.classList.remove('active');
      setTimeout(() => { openKbBtn.style.display = 'flex'; }, 300);
    });

    // Añadir listener a cada tecla virtual
    document.querySelectorAll('.kb-key').forEach(btn => {
      btn.addEventListener('click', () => {
        // Disparar un evento de teclado falso para que el listener original lo atrape
        const char = btn.textContent;
        const event = new KeyboardEvent('keydown', { key: char });
        document.dispatchEvent(event);
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // ─── LIBRERÍA DE ANIMACIONES HERMOSAS (VANILLA JS) ───
  // ══════════════════════════════════════════════════════════

  // 1 & 7. Lluvia de Emojis
  function triggerEmojiShower(emojis, count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.cssText = `position:fixed; top:-50px; left:${Math.random() * 100}vw; font-size:${(Math.random() * 2 + 1)}rem; z-index:9999; pointer-events:none; transition:transform ${(Math.random() * 3 + 2)}s linear, opacity ${(Math.random() * 3 + 2)}s ease-in;`;
        document.body.appendChild(el);

        // Animar caída
        setTimeout(() => {
          el.style.transform = `translateY(120vh) rotate(${Math.random() * 360}deg)`;
          el.style.opacity = '0';
        }, 50);

        setTimeout(() => el.remove(), 5000);
      }, i * 80);
    }
  }

  // 2. Chispas Doradas con Texto
  function triggerGoldenSparkles(msg) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:radial-gradient(circle, transparent 20%, rgba(26,10,46,0.8) 100%);z-index:9998;pointer-events:none;opacity:0;transition:opacity 1s ease;';
    document.body.appendChild(overlay);

    const text = document.createElement('div');
    text.textContent = msg;
    text.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%) scale(0);font-family:"Dancing Script", cursive;font-size:4rem;color:#ffd700;text-shadow:0 0 20px #ffd700, 0 0 40px #ff69b4;z-index:9999;transition:transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);pointer-events:none;';
    document.body.appendChild(text);

    setTimeout(() => {
      overlay.style.opacity = '1';
      text.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    for (let i = 0; i < 50; i++) {
      const sparkle = document.createElement('div');
      sparkle.textContent = '✨';
      sparkle.style.cssText = `position:fixed;left:50%;top:50%;z-index:9999;font-size:${(Math.random() * 1.5 + 0.5)}rem;pointer-events:none;transition:all ${(Math.random() * 1.5 + 1)}s cubic-bezier(0.25, 0.46, 0.45, 0.94);opacity:1;transform:translate(-50%, -50%);`;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 300 + 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 360}deg)`;
        sparkle.style.opacity = '0';
      }, 50);
      setTimeout(() => sparkle.remove(), 2500);
    }

    setTimeout(() => {
      overlay.style.opacity = '0';
      text.style.transform = 'translate(-50%, -50%) scale(0)';
      setTimeout(() => { overlay.remove(); text.remove(); }, 1000);
    }, 3500);
  }

  // 3. Flor Bloom
  function triggerFlowerBloom() {
    const flower = document.createElement('div');
    flower.textContent = '🌸';
    flower.style.cssText = 'position:fixed;bottom:-100px;left:50%;transform:translateX(-50%);font-size:10rem;z-index:9999;transition:all 2s cubic-bezier(0.175, 0.885, 0.32, 1.275);filter:drop-shadow(0 0 20px rgba(255,182,193,0.8));pointer-events:none;';
    document.body.appendChild(flower);
    
    setTimeout(() => flower.style.bottom = '20vh', 100);
    setTimeout(() => flower.style.transform = 'translateX(-50%) rotate(-10deg) scale(1.1)', 2100);
    setTimeout(() => flower.style.transform = 'translateX(-50%) rotate(5deg) scale(1.15)', 4100);
    
    setTimeout(() => {
      flower.style.transition = 'all 1.5s ease-in';
      flower.style.bottom = '-200px';
      flower.style.transform = 'translateX(-50%) scale(0.5)';
      flower.style.opacity = '0';
      setTimeout(() => flower.remove(), 1500);
    }, 6000);
  }

  // 4. Texto Neón Inmersivo
  function triggerNeonText(msg) {
    const text = document.createElement('div');
    text.textContent = msg;
    text.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.5);font-family:sans-serif;font-weight:900;font-size:5rem;color:#fff;text-shadow:0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de;z-index:9999;opacity:0;transition:all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);pointer-events:none;white-space:nowrap;';
    document.body.appendChild(text);

    setTimeout(() => {
      text.style.opacity = '1';
      text.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);

    setTimeout(() => {
      text.style.opacity = '0';
      text.style.transform = 'translate(-50%, -50%) scale(1.5)';
      setTimeout(() => text.remove(), 1000);
    }, 3000);
  }

  // 5. Estrellas fugaces en un cielo nocturno
  function triggerShootingStars() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(5, 10, 30, 0.7);z-index:9997;pointer-events:none;opacity:0;transition:opacity 2s ease;';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 50);

    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.style.cssText = 'position:fixed;width:150px;height:2px;background:linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);z-index:9998;pointer-events:none;opacity:0;transform:rotate(-45deg);';
        star.style.top = (Math.random() * 50) + 'vh';
        star.style.left = (Math.random() * 100 + 50) + 'vw';
        star.style.transition = 'all 1s linear';
        document.body.appendChild(star);

        setTimeout(() => {
          star.style.opacity = '1';
          star.style.transform = 'rotate(-45deg) translateX(-150vw)';
        }, 50);

        setTimeout(() => star.remove(), 1050);
      }, i * 200);
    }

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 2000);
    }, 4500);
  }

  // 6. Galaxia Espiral Creciente
  function triggerGalaxySpiral() {
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const dot = document.createElement('div');
        dot.style.cssText = `position:fixed;top:50%;left:50%;width:6px;height:6px;background:#c484ff;border-radius:50%;box-shadow:0 0 10px #c484ff, 0 0 20px #fff;z-index:9999;pointer-events:none;transform:translate(-50%, -50%);transition:all 2s ease-out;opacity:1;`;
        document.body.appendChild(dot);

        const angle = i * 0.5;
        const radius = i * 8;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        setTimeout(() => {
          dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${(60 - i) / 30})`;
          dot.style.opacity = '0';
        }, 50);

        setTimeout(() => dot.remove(), 2000);
      }, i * 50);
    }
  }

  // 8. Glow Flotante y suave
  function triggerFloatingGlow(msg, color) {
    const text = document.createElement('div');
    text.textContent = msg;
    text.style.cssText = `position:fixed;bottom:-50px;left:50%;transform:translateX(-50%);font-family:"Dancing Script", cursive;font-size:4rem;color:#fff;text-shadow:0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px #fff;z-index:9999;pointer-events:none;opacity:0;transition:all 4s ease-out;`;
    document.body.appendChild(text);

    setTimeout(() => {
      text.style.bottom = '60vh';
      text.style.opacity = '1';
    }, 50);

    setTimeout(() => {
      text.style.bottom = '100vh';
      text.style.opacity = '0';
      setTimeout(() => text.remove(), 4000);
    }, 2000);
  }

  // 9. Mariposas Ascendentes
  function triggerButterflies() {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const bf = document.createElement('div');
        bf.textContent = '🦋';
        bf.style.cssText = `position:fixed;bottom:-50px;left:${Math.random() * 80 + 10}vw;font-size:${Math.random() * 1.5 + 1.5}rem;z-index:9999;pointer-events:none;transition:all 4s cubic-bezier(0.42, 0, 0.58, 1);opacity:0;`;
        document.body.appendChild(bf);

        setTimeout(() => {
          bf.style.bottom = '120vh';
          bf.style.transform = `translateX(${(Math.random() - 0.5) * 300}px) rotate(${(Math.random() - 0.5) * 45}deg)`;
          bf.style.opacity = '1';
        }, 50);

        setTimeout(() => bf.remove(), 4000);
      }, i * 300);
    }
  }

  // 10. Amanecer Cálido de Fondo
  function triggerSunrise() {
    const sun = document.createElement('div');
    sun.style.cssText = 'position:fixed;bottom:-20vh;left:50%;transform:translateX(-50%);width:60vw;height:60vw;background:radial-gradient(circle, #ffeb3b 0%, #ff9800 40%, transparent 70%);border-radius:50%;z-index:9990;pointer-events:none;opacity:0;transition:all 3s ease-in-out;mix-blend-mode:screen;';
    document.body.appendChild(sun);

    setTimeout(() => {
      sun.style.opacity = '0.7';
      sun.style.bottom = '10vh';
    }, 50);

    setTimeout(() => {
      sun.style.opacity = '0';
      sun.style.bottom = '30vh';
      setTimeout(() => sun.remove(), 3000);
    }, 4000);
  }

})();
