/**
 * 首页 hero 拼贴背景生成器（构建期运行，产物进 public/，与 stats 一样由 CI 重建）。
 *
 * 素材全部来自本教程自己的图：从 dist/ 的构建产物里抽取组件内联的 <svg>（按中文 aria-label 识别），
 * 加上 chapters/ 各章 assets/images 下自绘的 SVG 示意图与实拍照片。
 *
 * 用法：
 *   node scripts/hero-collage.mjs            # 生成到 public/
 *   node scripts/hero-collage.mjs --dry      # 只打印选中素材，不渲染
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// 让 fontconfig 有可写缓存目录（容器里 /var/cache 通常不可写，只影响告警）
if (!process.env.XDG_CACHE_HOME) {
  const tmp = path.join(os.tmpdir(), 'hero-collage-cache');
  fs.mkdirSync(tmp, { recursive: true });
  process.env.XDG_CACHE_HOME = tmp;
}

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(siteRoot, '..');
const DIST = path.join(siteRoot, 'dist');
const OUT = path.join(siteRoot, 'public', 'hero-collage.webp');

const W = 2400, H = 1200;
const COLS = 7, ROWS = 4;
const PAD = 26, GAP = 18;

// 入选素材（按 aria-label 关键字），顺序即排布顺序；空字符串表示留白
const PICKS = [
  '整机总图', 'G1 指令旅程图', '在线运行闭环', '动作表示粒度阶梯',
  '谐波减速器', '行星减速器', '传动比演示', '单个关节模组传动链',
  '支撑多边形', '摩擦锥', 'cart-table', '力封闭',
  '电源树', '伺服三层级联', 'FOC 坐标变换', 'EtherCAT 一帧传阅',
  '齐次变换', '万向节锁', '内积与叉乘', '左乘与右乘',
  '互补滤波', 'MPC 滚动时域', '膝关节示意图', '浮动基座示意',
  '状态与动作随时间', '四连杆机构与死点', '模式切换与故障锁存', '裸机主循环',
  '应力应变', '右手定则', '轴向拉伸', '力系简化', '膝关节', '刚体力系', '关节状态与动作',
];

// 实拍素材（去色 + 单色调，作为纹理；可用 --no-photo 关闭）
const PHOTOS = [
  'chapters/02-mechanics/assets/images/04-reducer-harmonic-drive.jpg',
  'chapters/01-system-overview/assets/images/shadow-dexterous-hand-photo.jpg',
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

function extractSvgs(html) {
  const out = [];
  const re = /<svg\b[^>]*>|<\/svg>/g;
  let m, depth = 0, start = -1;
  while ((m = re.exec(html))) {
    if (m[0] === '</svg>') { depth--; if (depth === 0 && start >= 0) { out.push(html.slice(start, m.index + 6)); start = -1; } }
    else { if (depth === 0) start = m.index; depth++; }
  }
  return out;
}

function collectFigures() {
  const items = new Map();
  for (const p of walk(DIST)) {
    const html = fs.readFileSync(p, 'utf8');
    for (const s of extractSvgs(html)) {
      const open = s.slice(0, s.indexOf('>') + 1);
      const vb = open.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const label = (open.match(/aria-label="([^"]+)"/) || [])[1] || '';
      if (!vb || !/[\u4e00-\u9fff]/.test(label)) continue;
      const w = Number(vb[1]), h = Number(vb[2]);
      if (w < 200 || w > 2000 || h < 80) continue;
      if (!items.has(label)) items.set(label, { label, w, h, svg: s });
    }
  }
  return items;
}

/** HTML 序列化 → 合法 XML：剥 foreignObject、去无值属性、空元素自闭合 */
function toXml(svg) {
  let s = svg
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/g, '')
    .replace(/&nbsp;/g, '&#160;')
    .replace(/\s(data-[\w-]+|aria-[\w-]+)(?=\s|>)(?!\s*=)/g, '');
  const VOID = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop', 'image', 'animate', 'animateMotion', 'mpath'];
  // HTML 序列化会给出 <path …></path> 这种形式：先去掉显式闭标签，再统一自闭合
  s = s.replace(new RegExp('<\\/(' + VOID.join('|') + ')>', 'g'), '');
  for (const tag of VOID) {
    s = s.replace(new RegExp('<' + tag + '\\b([^>]*?)(?<!/)>', 'g'), '<' + tag + '$1 />');
  }
  return s.replace(/<svg\b([^>]*)>/, '<svg$1 xmlns="http://www.w3.org/2000/svg">');
}

/** 蓝图线稿：所有图形只保留描边，文字保留填充 —— 让 34 张风格各异的图统一成一套语言 */
function blueprint(svg, ink, accent) {
  // librsvg 不支持 CSS 变量与 !important：写字面色值，靠“CSS 规则优先于表现属性”覆盖原样式
  const style = '<style>'
    + '*{fill:none;stroke:' + ink + ';stroke-width:1.25;stroke-linejoin:round;stroke-linecap:round;}'
    + 'text,tspan{fill:' + ink + ';stroke:none;font-family:sans-serif;}'
    + 'marker path,marker polygon,marker circle,marker line,marker use{fill:' + ink + ';stroke:none;}'
    + '</style>';
  return svg.replace(/(<svg\b[^>]*>)/, '$1<defs>' + style + '</defs>');
}

/** 渲染一个 tile：等比放进 tile 框，带轻微旋转 */
async function renderTile(svg, tileW, tileH, angle, ink, accent, seed) {
  // 先按 1.4–2.4 倍渲染，再 cover 裁切 → 放大局部，避免“缩略图墙”的观感
  // 用 seed 决定的伪随机，保证同样的内容每次构建得到同一张图
  const jitter = Math.abs(Math.sin((seed + 1) * 91.37) * 43758.5453) % 1;
  const k = 1.4 + jitter * 1.0;
  const big = await sharp(Buffer.from(blueprint(toXml(svg), ink, accent)), { density: 200 })
    .resize({ width: Math.round(tileW * k), height: Math.round(tileH * k), fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const cropped = await sharp(big).resize({ width: tileW, height: tileH, fit: 'cover', position: 'centre' }).png().toBuffer();
  return sharp(cropped).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

/** 照片 → 单色调（去色后按强调色染色），作为低对比纹理 */
async function renderPhoto(file, tileW, tileH, accent) {
  const src = path.join(repoRoot, file);
  return sharp(src)
    .resize({ width: tileW, height: tileH, fit: 'cover' })
    .grayscale()
    .normalise()
    .tint(accent)
    .png()
    .toBuffer();
}

/** grid 专用：先 trim 掉透明边距，再等比贴合，四周留 4% 余量 —— 每格都填满且不裁切内容 */
async function renderTileFitted(svg, tileW, tileH, ink, accent) {
  const big = await sharp(Buffer.from(blueprint(toXml(svg), ink, accent)), { density: 300 })
    .png()
    .toBuffer();
  let trimmed = big;
  try {
    trimmed = await sharp(big).trim({ threshold: 8 }).png().toBuffer();
  } catch {
    trimmed = big; // 全透明或无法 trim 时退回原图
  }
  return sharp(trimmed)
    .resize({ width: Math.round(tileW * 0.96), height: Math.round(tileH * 0.96), fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}
/** 把 alpha 按不透明度缩放 */
async function fade(buf, opacity) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * opacity);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function main() {
  const dry = process.argv.includes('--dry');
  const withPhoto = !process.argv.includes('--no-photo');
  const figures = collectFigures();
  const picks = PICKS.map((k) => (k ? [...figures.values()].find((f) => f.label.includes(k)) : null));
  const oneIdx = process.argv.indexOf('--one');
  if (oneIdx > 0) {
    const key = process.argv[oneIdx + 1] || '';
    const fig = [...figures.values()].find((f) => f.label.includes(key));
    if (!fig) { console.log('未找到素材：' + key); return; }
    const buf = await renderTile(fig.svg, 900, 700, 0, '#cbd5e1', '#a78bfa', 0);
    const out = path.join(siteRoot, 'public', '_tile-debug.png');
    fs.writeFileSync(out, buf);
    const flat = await sharp(buf).flatten({ background: '#0a0e17' }).raw().toBuffer({ resolveWithObject: true });
    let ink = 0;
    for (let i = 0; i < flat.data.length; i += flat.info.channels) {
      const lum = 0.299 * flat.data[i] + 0.587 * flat.data[i + 1] + 0.114 * flat.data[i + 2];
      if (lum > 45) ink++;
    }
    console.log('单图：' + fig.label.slice(0, 28) + '  墨迹 ' + (ink / (flat.info.width * flat.info.height) * 100).toFixed(1) + '%  → ' + out);
    return;
  }

  const missing = PICKS.filter((k, i) => k && !picks[i]);
  if (missing.length) console.log('未找到素材：' + missing.join('、'));
  console.log('命中素材 ' + picks.filter(Boolean).length + ' / ' + PICKS.filter(Boolean).length);
  if (dry) { picks.forEach((p, i) => console.log('  ' + i + ' ' + (p ? p.label.slice(0, 30) : '（留白）'))); return; }

  // ===== 斜向无缝网格：格子零间距、整体旋转后中心裁切 =====
  {
  const CW = 3600, CH = 1800;            // 最终画布
  const GW = 3960, GH = 2640;            // 旋转前的工作画布（足够大，保证四角不露空）
  const GCOLS = 10, GROWS = 6;           // 60 格，格子紧贴无间距
  const cellW = GW / GCOLS, cellH = GH / GROWS;
  const ANGLE = 14;                      // 整体倾斜角（正数 = 顺时针，与上一版方向相反）
  const figs = picks.filter(Boolean);
  const SIGNATURE = ['整机总图', 'G1 指令旅程图', '在线运行闭环', '动作表示粒度阶梯', '支撑多边形', '电源树', '互补滤波'];
  const order = [...figs];
  while (order.length < GCOLS * GROWS) {
    for (const k of SIGNATURE) {
      const f = figs.find((x) => x.label.includes(k));
      if (f) order.push(f);
      if (order.length >= GCOLS * GROWS) break;
    }
  }
  const inkRatio = async (buf) => {
    const f = await sharp(buf).flatten({ background: '#0a0e17' }).raw().toBuffer({ resolveWithObject: true });
    let n = 0;
    for (let p = 0; p < f.data.length; p += f.info.channels) {
      if (0.299 * f.data[p] + 0.587 * f.data[p + 1] + 0.114 * f.data[p + 2] > 45) n++;
    }
    return n / (f.info.width * f.info.height);
  };
  const layers = [];
  for (let i = 0; i < GCOLS * GROWS; i++) {
    const c = i % GCOLS, r = Math.floor(i / GCOLS);
    const x = Math.round(c * cellW), y = Math.round(r * cellH);
    const w = Math.round(cellW), h = Math.round(cellH);
    // 整格底板铺满：格子之间看不出缝，图按各自比例居中放进去
    const plate = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0.03 } } }).png().toBuffer();
    layers.push({ input: plate, left: x, top: y });
    const ink = i % 6 === 0 ? '#c4b5fd' : '#c7d2e4';
    let raw = await renderTileFitted(order[i].svg, Math.round(w * 0.94), Math.round(h * 0.94), ink, '#a78bfa');
    if (await inkRatio(raw) < 0.012) {
      const alt = figs.find((f) => f.label.includes(SIGNATURE[i % SIGNATURE.length]));
      if (alt) {
        const altRaw = await renderTileFitted(alt.svg, Math.round(w * 0.94), Math.round(h * 0.94), ink, '#a78bfa');
        if (await inkRatio(altRaw) > 0.012) { console.log('  第 ' + (i + 1) + ' 格太空（' + order[i].label.slice(0, 12) + '）→ 换成 ' + alt.label.slice(0, 12)); raw = altRaw; }
      }
    }
    layers.push({ input: await fade(raw, 0.6), left: Math.round(x + (w - w * 0.94) / 2), top: Math.round(y + (h - h * 0.94) / 2) });
  }
  const sheet = await sharp({ create: { width: GW, height: GH, channels: 3, background: '#0a0e17' } }).composite(layers).png().toBuffer();
  const rotated = await sharp(sheet).rotate(ANGLE, { background: '#0a0e17' }).png().toBuffer();
  const meta = await sharp(rotated).metadata();
  console.log('旋转后 ' + meta.width + '×' + meta.height + '，中心裁 ' + CW + '×' + CH);
  const cropped = await sharp(rotated)
    .extract({ left: Math.round((meta.width - CW) / 2), top: Math.round((meta.height - CH) / 2), width: CW, height: CH })
    .png()
    .toBuffer();
  const gvign = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + CW + '" height="' + CH + '">'
    + '<defs><radialGradient id="v" cx="50%" cy="45%" r="78%">'
    + '<stop offset="66%" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset="100%" stop-color="#000" stop-opacity="0.5"/></radialGradient></defs>'
    + '<rect width="100%" height="100%" fill="url(#v)"/></svg>'
  );
  const gbuf = Buffer.alloc(CW * CH * 3);
  let gs = 20240922;
  for (let i = 0; i < gbuf.length; i++) {
    gs = (gs * 1103515245 + 12345) & 0x7fffffff;
    gbuf[i] = Math.max(0, Math.min(255, Math.round(128 + (gs / 0x7fffffff - 0.5) * 2 * 11)));
  }
  const grain = await sharp(gbuf, { raw: { width: CW, height: CH, channels: 3 } }).png().toBuffer();
  await sharp(cropped)
    .composite([{ input: gvign, left: 0, top: 0 }, { input: await fade(grain, 0.04), left: 0, top: 0, blend: 'overlay' }])
    .webp({ quality: 80 })
    .toFile(OUT);
  console.log('已生成 斜向无缝 ' + GCOLS + '×' + GROWS + ' 格 → ' + CW + '×' + CH + '，' + (fs.statSync(OUT).size / 1024).toFixed(0) + 'KB');
  await sharp(OUT).png({ compressionLevel: 9 }).toFile(path.join(siteRoot, 'public', 'hero-collage-preview.png'));
  return;
  }

  // 确定性伪随机（按序号哈希），保证每次构建结果一致
  const rnd = (i, salt) => {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // 自由拼贴：三种尺寸 + 松散网格 + 允许重叠与出血；图按 1.4–2.4 倍放大后裁切，只露局部（更有海报感）
  const cells = 6;
  const cellW = W / cells, cellH = H / 3;
  const SIZES = [
    { k: 0.62, n: 0 },   // 小
    { k: 0.86, n: 1 },   // 中
    { k: 1.15, n: 2 },   // 大
  ];
  const composites = [];
  picks.forEach((item, i) => {
    if (!item) return;
    const c = i % cells, r = Math.floor(i / cells) % 3;
    const size = SIZES[Math.floor(rnd(i, 7) * 3)];
    const tw = Math.round(cellW * size.k), th = Math.round(cellH * size.k);
    const jitterX = (rnd(i, 3) - 0.5) * cellW * 0.55;
    const jitterY = (rnd(i, 4) - 0.5) * cellH * 0.5;
    composites.push({
      item, i, w: tw, h: th,
      x: Math.round(c * cellW + (cellW - tw) / 2 + jitterX),
      y: Math.round(r * cellH + (cellH - th) / 2 + jitterY),
    });
  });
  if (withPhoto) {
    const slots = [{ c: 0, r: 2 }, { c: 5, r: 0 }];
    slots.forEach((s, k) => {
      const tw = Math.round(cellW * 0.8), th = Math.round(cellH * 0.8);
      composites.push({ photo: PHOTOS[k % PHOTOS.length], i: 90 + k, w: tw, h: th, x: Math.round(s.c * cellW + 20), y: Math.round(s.r * cellH + 20) });
    });
  }

  const layers = [];
  for (const t of composites) {
    const angle = (rnd(t.i, 1) - 0.5) * 7;            // ±3.5°
    const hero = rnd(t.i, 5) > 0.78;                  // 少数更亮，形成层次
    const opacity = t.photo ? 0.2 : hero ? 0.75 + rnd(t.i, 6) * 0.22 : 0.34 + rnd(t.i, 2) * 0.34;
    const ink = t.i % 6 === 0 ? '#c4b5fd' : '#c7d2e4';
    if (t.photo) {
      const raw = await renderPhoto(t.photo, t.w, t.h, '#4c1d95');
      layers.push({ input: await fade(raw, opacity), left: t.x, top: t.y });
    } else {
      const raw = await renderTile(t.item.svg, t.w, t.h, angle, ink, '#a78bfa', t.i);
      layers.push({ input: await fade(raw, opacity), left: t.x, top: t.y });
    }
  }
  // 颗粒：让画面有印刷质感，同时打散矢量边缘的“太干净”
  // 自己生成颗粒（sharp 的 noise 无种子，会让每次构建结果不同）
  const gbuf = Buffer.alloc(W * H * 3);
  let gseed = 20240922;
  for (let i = 0; i < gbuf.length; i++) {
    gseed = (gseed * 1103515245 + 12345) & 0x7fffffff;
    const n = (gseed / 0x7fffffff - 0.5) * 2;          // -1..1
    gbuf[i] = Math.max(0, Math.min(255, Math.round(128 + n * 18)));
  }
  const grain = await sharp(gbuf, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  layers.push({ input: await fade(grain, 0.07), left: 0, top: 0, blend: 'overlay' });

  const vignette = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">'
    + '<defs><radialGradient id="v" cx="50%" cy="45%" r="75%">'
    + '<stop offset="62%" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset="100%" stop-color="#000" stop-opacity="0.6"/></radialGradient></defs>'
    + '<rect width="100%" height="100%" fill="url(#v)"/></svg>'
  );
  layers.push({ input: vignette, left: 0, top: 0 });

  await sharp({ create: { width: W, height: H, channels: 3, background: '#0a0e17' } })
    .composite(layers)
    .webp({ quality: 82 })
    .toFile(OUT);
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log('已生成 ' + OUT + '（' + W + '×' + H + '，' + kb + 'KB，' + layers.length + ' 层）');
  // 同时出一张 PNG 便于本地预览
  await sharp(OUT).png({ compressionLevel: 9 }).toFile(path.join(siteRoot, 'public', 'hero-collage-preview.png'));
  console.log('预览图 public/hero-collage-preview.png');
}

await main();
