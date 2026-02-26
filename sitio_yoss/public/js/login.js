// ─── Stars Background ───
(function createStars() {
  const container = document.getElementById("stars");
  const count = 80;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--duration", 2 + Math.random() * 4 + "s");
    star.style.setProperty(
      "--max-opacity",
      (0.4 + Math.random() * 0.6).toString(),
    );
    star.style.animationDelay = Math.random() * 4 + "s";
    container.appendChild(star);
  }
})();

// ─── Floating Petals ───
(function createPetals() {
  const container = document.getElementById("petals");
  const petals = ["🌸", "💮", "🏵️"];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + "%";
    petal.style.setProperty("--fall-duration", 8 + Math.random() * 12 + "s");
    petal.style.setProperty("--delay", Math.random() * 10 + "s");
    petal.style.setProperty("--drift", Math.random() * 100 - 50 + "px");
    container.appendChild(petal);
  }
})();

// ─── Login Form Handler ───
const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");
const originalBtnText = loginBtn ? loginBtn.textContent : "";

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset error
    errorDiv.classList.remove("visible");
    errorDiv.textContent = "";

    // Get values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      showError("Completa ambos campos, por favor 💕");
      return;
    }

    // Loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span>Un momento...';

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "same-origin",
      });

      const data = await res.json();

      if (data.success) {
        // Login exitoso → redirigir al sitio principal
        loginBtn.innerHTML = "¡Bienvenid@! 🌸 Entrando...";
        setTimeout(() => {
          window.location.href = "/";
        }, 600);
      } else {
        showError(data.message || "Credenciales incorrectas");
        resetBtn();
      }
    } catch (err) {
      showError("Error de conexión. Intenta de nuevo.");
      resetBtn();
    }
  });
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.add("visible");
}

function resetBtn() {
  loginBtn.disabled = false;
  loginBtn.textContent = originalBtnText;
}
