import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines: width * 4 bytes + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing routine for SiklusAkun icon
function drawSiklusIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Center coordinates (-1 to 1)
  const cx = (nx - 0.5) * 2;
  const cy = (ny - 0.5) * 2;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Background
  let r = 15, g = 23, b = 42, a = 255; // #0f172a
  // Gradient to #1e293b at bottom
  r = Math.round(15 + 15 * ny);
  g = Math.round(23 + 18 * ny);
  b = Math.round(42 + 17 * ny);

  // Maskable doesn't need rounded corners; regular does
  if (!isMaskable) {
    // Squircle radius check
    const cornerR = 0.35;
    const cornerDx = Math.max(0, Math.abs(cx) - (1 - cornerR));
    const cornerDy = Math.max(0, Math.abs(cy) - (1 - cornerR));
    const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
    if (cornerDist > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Inner book/card area: central 60%
  const inCardX = Math.abs(cx) < 0.65;
  const inCardY = Math.abs(cy) < 0.65;

  if (inCardX && inCardY) {
    // Card background
    r = 30; g = 41; b = 59; // #1e293b

    // Green spine on left
    if (cx >= -0.65 && cx <= -0.45) {
      r = 16; g = 185; b = 129; // Emerald #10b981
    }

    // Balance Scale / Center Line
    if (Math.abs(cx - 0.08) < 0.02 && cy >= -0.25 && cy <= 0.25) {
      r = 148; g = 163; b = 184; // Slate-400 pillar
    }

    // Top Beam
    if (cy >= -0.26 && cy <= -0.21 && cx >= -0.32 && cx <= 0.48) {
      r = 248; g = 250; b = 252; // White beam
    }

    // Left Scale Pan (Debet)
    if (Math.abs(cx - (-0.18)) < 0.12 && cy >= -0.05 && cy <= 0.05) {
      r = 16; g = 185; b = 129; // Emerald Pan
    }

    // Right Scale Pan (Kredit)
    if (Math.abs(cx - 0.34) < 0.12 && cy >= -0.05 && cy <= 0.05) {
      r = 56; g = 189; b = 248; // Cyan Pan
    }

    // SA Lettering Pill at Bottom of Card
    if (Math.abs(cx - 0.08) < 0.32 && cy >= 0.32 && cy <= 0.52) {
      r = 15; g = 23; b = 42; // Dark badge
      if (Math.abs(cx - 0.08) < 0.30 && (Math.abs(cy - 0.32) < 0.02 || Math.abs(cy - 0.52) < 0.02)) {
        r = 56; g = 189; b = 248; // Cyan border
      }
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => drawSiklusIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => drawSiklusIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => drawSiklusIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => drawSiklusIcon(x, y, w, h, false)));

// Generate a 32x32 favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, (x, y, w, h) => drawSiklusIcon(x, y, w, h, false)));

console.log('All icons generated successfully in public/');
