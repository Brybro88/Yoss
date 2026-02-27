/**
 * server.js — Bootstrap del servidor Yoss
 *
 * Responsabilidades:
 * 1. Cargar variables de entorno
 * 2. Conectar a MongoDB
 * 3. Arrancar el servidor HTTP
 */

require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✨ Servidor Yoss corriendo en http://localhost:${PORT}`);
      console.log(`🌸 Entorno: ${process.env.BEGIEYFT || "development"}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();
