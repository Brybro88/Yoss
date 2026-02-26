/**
 * src/app.js — Configuración central de Express
 *
 * Aquí se montan todos los middlewares, rutas y la entrega
 * de vistas estáticas protegidas por autenticación.
 */

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const thoughtRoutes = require("./routes/thoughtRoutes");
const letterRoutes = require("./routes/letterRoutes");
const momentRoutes = require("./routes/momentRoutes");
const timelineRoutes = require('./routes/timelineRoutes');
const dateRoutes = require('./routes/dateRoutes');
const userRoutes = require('./routes/userRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const { protectView, requireAdmin } = require("./middlewares/authMiddleware");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ─── Middlewares globales de seguridad y utilidad ───
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"]
      }
    }
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Archivos estáticos públicos (CSS, JS, audio, imágenes) ───
// Estos se sirven SIN autenticación para que login.html cargue sus estilos
app.use(express.static(path.join(__dirname, "..", "public")));

// ─── Ruta pública: Página de login ───
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
});

// ─── Rutas de API ───
app.use("/api/auth", authRoutes);
app.use("/api/thoughts", thoughtRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/moments", momentRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/site-content', siteContentRoutes);

// ─── Ruta protegida: Panel de Admin (solo Bryan) ───
app.get("/admin", protectView, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "admin.html"));
});

// ─── Ruta protegida: Página principal ───
app.get("/", protectView, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

// ─── Ruta para que admin vea el sitio romántico ───
app.get("/site", protectView, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

// ─── Middleware global de errores ───
app.use(errorHandler);

module.exports = app;
