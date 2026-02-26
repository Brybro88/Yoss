const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Empezando proceso de minificación...');

const publicDir = path.join(__dirname, '..', 'public');
const cssDir = path.join(publicDir, 'css');
const jsDir = path.join(publicDir, 'js');

// Minificar un archivo usando terser (JS) o cleancss (CSS)
function minifyFile(filePath, type) {
  const ext = path.extname(filePath);
  if (filePath.endsWith('.min' + ext)) return; // Ignorar si ya está minificado

  const minFilePath = filePath.replace(ext, `.min${ext}`);

  try {
    if (type === 'css') {
      execSync(`npx cleancss -o "${minFilePath}" "${filePath}"`);
      console.log(`✅ Minificado (CSS): ${path.basename(filePath)}`);
    } else if (type === 'js') {
      execSync(`npx terser "${filePath}" -o "${minFilePath}" --compress --mangle`);
      console.log(`✅ Minificado (JS): ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error al minificar ${filePath}:`, error.message);
  }
}

// Buscar y minificar archivos en un directorio
function processDirectory(dirPath, type) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath, type); // Recursivo
    } else if (stat.isFile() && fullPath.endsWith(`.${type}`)) {
      minifyFile(fullPath, type);
    }
  }
}

// Ejecutar para CSS y JS
processDirectory(cssDir, 'css');
processDirectory(jsDir, 'js');

console.log('✨ Proceso de minificación completado.');
