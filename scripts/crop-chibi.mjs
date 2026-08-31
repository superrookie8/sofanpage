import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SRC_DIR = "public/images";
const OUT_DIR = "public/images/chibi";
const TARGET_LONG_EDGE = 640;
const BG_TOLERANCE = 26;   // 배경으로 간주할 색 거리
const PAD_RATIO = 0.03;    // 크롭 여백

const FILES = process.argv.slice(2);

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2));
}

async function processImage(file) {
  const src = path.join(SRC_DIR, file);
  const image = sharp(src).ensureAlpha();
  const { width: W, height: H } = await image.metadata();
  const raw = await image.raw().toBuffer();

  // 배경색: 네 모서리 픽셀의 중앙값을 대표값으로
  const corners = [
    [0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1],
  ].map(([x, y]) => {
    const i = (y * W + x) * 4;
    return [raw[i], raw[i + 1], raw[i + 2]];
  });
  const [bgR, bgG, bgB] = corners[0];

  // 1) 테두리에서 플러드필 → 바깥 배경만 투명 처리 (흰 유니폼 등 내부는 보존)
  const outside = new Uint8Array(W * H);
  const stack = [];
  const pushIfBg = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (outside[p]) return;
    const i = p * 4;
    if (colorDistance(raw[i], raw[i + 1], raw[i + 2], bgR, bgG, bgB) > BG_TOLERANCE) return;
    outside[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < W; x++) { pushIfBg(x, 0); pushIfBg(x, H - 1); }
  for (let y = 0; y < H; y++) { pushIfBg(0, y); pushIfBg(W - 1, y); }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W, y = (p / W) | 0;
    pushIfBg(x + 1, y); pushIfBg(x - 1, y); pushIfBg(x, y + 1); pushIfBg(x, y - 1);
  }

  // 2) 남은 전경에서 연결 요소를 찾아 가장 큰 것만 유지
  //    → 로고·워터마크·공 등 분리된 요소가 자동으로 제거된다.
  const label = new Int32Array(W * H).fill(-1);
  let best = { id: -1, size: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let nextId = 0;
  const queue = new Int32Array(W * H);
  for (let start = 0; start < W * H; start++) {
    if (outside[start] || label[start] !== -1) continue;
    const id = nextId++;
    let head = 0, tail = 0, size = 0;
    let minX = W, minY = H, maxX = 0, maxY = 0;
    queue[tail++] = start; label[start] = id;
    while (head < tail) {
      const p = queue[head++];
      size++;
      const x = p % W, y = (p / W) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      const neighbours = [p + 1, p - 1, p + W, p - W];
      const xs = [x + 1, x - 1, x, x];
      for (let k = 0; k < 4; k++) {
        const q = neighbours[k], nx = xs[k];
        if (q < 0 || q >= W * H) continue;
        if (nx < 0 || nx >= W) continue;
        if (outside[q] || label[q] !== -1) continue;
        label[q] = id; queue[tail++] = q;
      }
    }
    if (size > best.size) best = { id, size, minX, minY, maxX, maxY };
  }

  // 3) 알파 적용: 최대 연결 요소가 아닌 모든 픽셀을 투명하게
  const out = Buffer.from(raw);
  for (let p = 0; p < W * H; p++) {
    if (label[p] !== best.id) out[p * 4 + 3] = 0;
  }

  // 4) bbox + 여백으로 크롭
  const bw = best.maxX - best.minX + 1;
  const bh = best.maxY - best.minY + 1;
  const pad = Math.round(Math.max(bw, bh) * PAD_RATIO);
  const left = Math.max(0, best.minX - pad);
  const top = Math.max(0, best.minY - pad);
  const cw = Math.min(W - left, bw + pad * 2);
  const ch = Math.min(H - top, bh + pad * 2);

  const scale = TARGET_LONG_EDGE / Math.max(cw, ch);
  const outName = file.replace(/\.(png|PNG|jpg|JPG|jpeg)$/i, "").toLowerCase() + ".webp";

  mkdirSync(OUT_DIR, { recursive: true });
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left, top, width: cw, height: ch })
    .resize({
      width: Math.max(1, Math.round(cw * scale)),
      height: Math.max(1, Math.round(ch * scale)),
      fit: "fill",
    })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(OUT_DIR, outName));

  console.log(
    `${file.padEnd(28)} ${String(W).padStart(4)}x${String(H).padStart(4)}` +
    ` → bbox ${cw}x${ch} @(${left},${top})` +
    `  요소크기 ${(best.size / (W * H) * 100).toFixed(1)}%` +
    `  → chibi/${outName} ${Math.round(cw * scale)}x${Math.round(ch * scale)}`
  );
}

for (const f of FILES) {
  try { await processImage(f); } catch (e) { console.error(`${f}: ${e.message}`); }
}
