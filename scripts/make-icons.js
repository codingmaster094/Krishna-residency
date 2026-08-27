const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crc32 = require("buffer").Buffer;

function crc(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  const out = Buffer.alloc(4);
  out.writeUInt32BE((~c) >>> 0);
  return out;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  return Buffer.concat([len, body, crc(body)]);
}

function png(size, r, g, b) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size, 0);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * stride + 1 + x * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const gold = Math.abs(cx) < size * 0.28 && Math.abs(cy) < size * 0.22;
      if (gold) {
        raw[i] = 201;
        raw[i + 1] = 162;
        raw[i + 2] = 39;
      } else {
        raw[i] = r;
        raw[i + 1] = g;
        raw[i + 2] = b;
      }
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const dir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(dir, "icon-192.png"), png(192, 15, 39, 68));
fs.writeFileSync(path.join(dir, "icon-512.png"), png(512, 15, 39, 68));
fs.copyFileSync(path.join(dir, "icon-192.png"), path.join(dir, "apple-touch-icon.png"));
console.log("icons written");
