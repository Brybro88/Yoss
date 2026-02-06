const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor romántico corriendo en http://localhost:${PORT}`);
});
