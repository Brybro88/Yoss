# Sitio Web Romántico 🌸

**🌸 Creado con código, corazón y toda la intención del mundo 🌸**

## 📖 Descripción del Proyecto

Este es un sitio web romántico interactivo, construido como un detalle especial. Permite a los usuarios acceder a una experiencia personalizada, con cartas encriptadas en el tiempo, pensamientos diarios, una línea del tiempo interactiva y una galería de momentos especiales. También incluye un panel de administración para gestionar este contenido.

## ✨ Características Principales

- **Cartas en el Tiempo:** Mensajes que se desbloquean en fechas y horas específicas.
- **Pensamientos Diarios:** Notas o mensajes románticos cortos.
- **Línea del Tiempo:** Visualización de momentos importantes o fechas clave en la relación.
- **Panel de Administración (Admin Dashboard):** Acceso restringido para gestionar y publicar nuevos momentos, cartas y pensamientos.
- **Diseño Responsivo:** Interfaz amigable visualmente atractiva (próximamente mejorada con minificación y optimización).

## 🛠 Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Base de Datos:** MongoDB, Mongoose
- **Autenticación:** JSON Web Tokens (JWT), Bcrypt.js
- **Seguridad:** Helmet, CORS
- **Frontend:** HTML5, CSS3Vanilla, Vanilla JavaScript

## ⚙️ Configuración del Entorno (Environment Setup)

Para ejecutar el proyecto localmente, necesitas configurar las variables de entorno.

1. Clona el repositorio.
2. Copia el archivo `.env.example` y renómbralo a `.env`.
   ```bash
   cp .env.example .env
   ```
3. Llena los valores de configuración en `.env` (ver `.env.example` para la guía sobre cada variable).

## 🚀 Instalación y Ejecución Local

1. Asegúrate de tener **Node.js** (v18+ recomendado) y **MongoDB** instalados y en ejecución.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador y navega a `http://localhost:3000`.

_(Opcional) Si la base de datos está vacía, puedes ejecutar un script de carga (si existe) utilizando `npm run seed`._

## 🤝 Pautas de Contribución (Contributing Guidelines)

Dado que es un proyecto personal con un propósito muy específico, no se buscan contribuciones externas de gran escala. Sin embargo:

- **Reporte de Bugs:** Se aprecian. Favor de abrir un _Issue_ con los pasos para reproducir el problema.
- **Mejoras Menores:** Crear un _Pull Request_ describiendo detalladamente la mejora. Asegúrate de que tu código cumpla con los estándares de ESLint y Prettier (configurados en el proyecto).

## 📜 Licencia

Este proyecto tiene licencia [ISC](https://opensource.org/licenses/ISC). Es de carácter personal, pero el código fuente está disponible para referencia educativa o de inspiración bajo los términos de la misma.
