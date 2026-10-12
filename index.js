/**
 * faces-data
 * Descarga 30 fotos de https://thispersondoesnotexist.com/
 * las redimensiona a 150 x 180 y las convierte a WebP
 * manteniendo el nombre base del archivo.
 *
 * Uso:
 *   npm install
 *   npm start
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const TOTAL = 30;
const WIDTH = 150;
const HEIGHT = 180;

// Endpoint que devuelve una cara aleatoria (image/jpeg).
// Se agrega cache-buster (?t=...) para evitar caché y obtener una distinta cada vez.
const SOURCE_URL = "https://thispersondoesnotexist.com/random-person.jpeg";

const RAW_DIR = path.join(__dirname, "originals");
const OUT_DIR = path.join(__dirname, "output");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pad(n) {
  return String(n).padStart(2, "0");
}

async function downloadOne(index, retries = 3) {
  const baseName = `face-${pad(index)}`; // <-- el nombre NO cambia, solo la extensión
  const rawPath = path.join(RAW_DIR, `${baseName}.jpg`);
  const outPath = path.join(OUT_DIR, `${baseName}.webp`);

  const url = `${SOURCE_URL}?t=${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;

  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) faces-data/1.0",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("image")) {
        throw new Error(`Content-Type inesperado: ${contentType}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 10_000) {
        throw new Error(`Imagen sospechosamente pequeña (${buffer.length} bytes)`);
      }

      // 1. Guardar original (re-crea carpetas por si el SO/antivirus las limpió)
      await fs.promises.mkdir(RAW_DIR, { recursive: true });
      await fs.promises.mkdir(OUT_DIR, { recursive: true });
      await fs.promises.writeFile(rawPath, buffer);

      // 2. Achicar a 150x180 + convertir a WebP (mismo nombre base)
      await sharp(buffer)
        .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
        .webp({ quality: 85 })
        .toFile(outPath);

      const meta = await sharp(outPath).metadata();
      console.log(
        `✔ ${baseName}: ${buffer.length} bytes -> ${meta.width}x${meta.height} ${meta.format} (${path.basename(outPath)})`
      );
      return { baseName, rawPath, outPath };
    } catch (err) {
      lastErr = err;
      console.warn(`  ↻ ${baseName} intento ${attempt}/${retries} falló: ${err.message}`);
      await sleep(1500 * attempt);
    }
  }
  throw lastErr;
}

async function main() {
  await fs.promises.mkdir(RAW_DIR, { recursive: true });
  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  console.log(`Descargando ${TOTAL} fotos desde ${SOURCE_URL} ...`);
  console.log(`Salida: ${OUT_DIR} (${WIDTH}x${HEIGHT} webp)\n`);

  for (let i = 1; i <= TOTAL; i++) {
    await downloadOne(i);
    // Pausa para no saturar al servidor
    if (i < TOTAL) await sleep(800);
  }

  console.log(`\nListo: ${TOTAL} imágenes en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
