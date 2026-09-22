/**
 * 统计模块：所有对外数字都从内容源推导，避免手写数字与正文漂移。
 *
 * 数据来源：
 *   - chapters/0[1-6]-*//*.md(x)      节数、汉字数 → 阅读时长
 *   - chapters/00-reading-guides/*.md 三条路线各收录了哪些节、路线内的步骤分组
 *   - site/src/data/reading-time.json 每节的阅读系数（人工判断：公式密度、交互演示数量）
 *   - site/src/data/section-qa.json   QA 统计
 *
 * 产物：
 *   - site/src/data/stats.json        首页等 .mdx 直接 import
 *   - {{stat:key}} 占位符             chapters/ 正文里由 sync-content.mjs 替换
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const repoRoot = path.resolve(siteRoot, '..');
const chaptersRoot = path.join(repoRoot, 'chapters');

const han = (s) => (s.match(/[\u4e00-\u9fff]/g) || []).length;

/** 分钟 → "12 分钟" / "1 小时 30 分钟" */
export function formatMinutes(m) {
  const t = Math.round(m);
  if (t < 60) return t + ' 分钟';
  const h = Math.floor(t / 60), r = t % 60;
  return r === 0 ? h + ' 小时' : h + ' 小时 ' + r + ' 分钟';
}

function sectionFiles() {
  const out = [];
  for (const d of fs.readdirSync(chaptersRoot).filter((x) => /^0[1-6]-/.test(x)).sort()) {
    for (const f of fs.readdirSync(path.join(chaptersRoot, d)).filter((x) => /\.mdx?$/.test(x)).sort()) {
      const chapter = Number(d.slice(1, 2));
      const section = Number(f.slice(0, 2));
      out.push({ id: chapter + '.' + section, chapter, section, dir: d, file: f, path: path.join(chaptersRoot, d, f) });
    }
  }
  return out;
}

/** 从导读里解析出：某条路线收录了哪些节；某个 ## 步骤收了哪些节 */
function parseGuide(rel) {
  const text = fs.readFileSync(path.join(chaptersRoot, rel), 'utf8');
  const sections = new Set();
  const re = /\]\(\.\.\/(0[1-6])-[^/]+\/(\d\d)-[^)]*\)/g;
  let m;
  while ((m = re.exec(text))) sections.add(Number(m[1]) + '.' + Number(m[2]));
  const steps = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) { cur = { title: h[1], sections: new Set() }; steps.push(cur); continue; }
    if (!cur) continue;
    const re2 = /\]\(\.\.\/(0[1-6])-[^/]+\/(\d\d)-[^)]*\)/g;
    let m2;
    while ((m2 = re2.exec(line))) cur.sections.add(Number(m2[1]) + '.' + Number(m2[2]));
  }
  return { sections, steps: steps.filter((s) => s.sections.size > 0) };
}

/** 从学生导读的三档表里数出每档多少节（支持 1.1–1.3、4.1 这种写法） */
function parseTiers() {
  const text = fs.readFileSync(path.join(chaptersRoot, '00-reading-guides/02-student.md'), 'utf8');
  const tiers = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*\*\*(基础必备|现代常用|研究前沿)\*\*\s*\|\s*([^|]+)\|/);
    if (!m) continue;
    const set = new Set();
    for (const part of m[2].split('、')) {
      const range = part.match(/(\d\.\d)\s*[–-]\s*(\d\.\d)/);
      if (range) {
        const [c1, s1] = range[1].split('.').map(Number), [c2, s2] = range[2].split('.').map(Number);
        if (c1 === c2) for (let s = s1; s <= s2; s++) set.add(c1 + '.' + s);
      } else {
        const one = part.match(/(\d\.\d)/);
        if (one) set.add(one[1]);
      }
    }
    tiers[m[1]] = set;
  }
  return tiers;
}

export function computeStats() {
  const files = sectionFiles();
  const rt = JSON.parse(fs.readFileSync(path.join(siteRoot, 'src/data/reading-time.json'), 'utf8'));
  const baseline = rt.baseline || 300;
  const qa = JSON.parse(fs.readFileSync(path.join(siteRoot, 'src/data/section-qa.json'), 'utf8'));

  const minutes = {}, words = {}, productMinutes = {};
  for (const s of files) {
    const text = fs.readFileSync(s.path, 'utf8');
    words[s.id] = han(text);
    const factor = rt.factors[s.id] ?? 1;
    minutes[s.id] = Math.round((words[s.id] / baseline) * factor);
    // 产品 / PR 路线只读「现场问题 + 第一个术语定义 + 一条一句话听懂」，
    // 所以按读到第一条“一句话听懂”为止的真实字数计时，而不是整节时长
    const i = text.indexOf('> **一句话听懂**');
    const upto = i < 0 ? text : text.slice(0, text.indexOf('\n', i));
    productMinutes[s.id] = Math.max(1, Math.round(han(upto) / baseline));
  }
  const chapterMinutes = {}, chapterSections = {};
  for (const s of files) {
    chapterMinutes[s.chapter] = (chapterMinutes[s.chapter] || 0) + minutes[s.id];
    chapterSections[s.chapter] = (chapterSections[s.chapter] || 0) + 1;
  }
  const totalMinutes = Object.values(minutes).reduce((a, b) => a + b, 0);

  const routes = {
    engineer: parseGuide('00-reading-guides/01-engineer-cross-team.md'),
    student: parseGuide('00-reading-guides/02-student.md'),
    product: parseGuide('00-reading-guides/03-product-pr.md'),
  };
  const tiers = parseTiers();
  const sumMinutes = (set) => [...set].reduce((a, id) => a + (minutes[id] || 0), 0);

  const qaByRole = {};
  for (const items of Object.values(qa)) for (const it of items) qaByRole[it.role] = (qaByRole[it.role] || 0) + 1;
  const qaSections = Object.keys(qa).length;
  const qaTotal = Object.values(qa).reduce((a, v) => a + v.length, 0);

  // 扁平 token 表：正文里写 {{stat:key}}
  const tokens = {
    'reading.baseline': baseline,
    'sections.total': files.length,
    'chapters.total': Object.keys(chapterSections).length,
    'minutes.total': totalMinutes,
    'minutes.totalText': formatMinutes(totalMinutes),
    'minutes.totalTextRound': '约 ' + formatMinutes(Math.round(totalMinutes / 5) * 5),
    'minutes.totalTextRoundBare': formatMinutes(Math.round(totalMinutes / 5) * 5),
    'minutes.totalHours': (totalMinutes / 60).toFixed(1),
    'minutes.averageText': formatMinutes(totalMinutes / files.length),
    'qa.total': qaTotal,
    'qa.sections': qaSections,
  };
  for (const [id, m] of Object.entries(minutes)) tokens['minutes.section.' + id] = m;
  for (const [c, m] of Object.entries(chapterMinutes)) {
    tokens['minutes.chapter.' + c] = m;
    tokens['minutes.chapterText.' + c] = '约 ' + formatMinutes(m);
    tokens['sections.chapter.' + c] = chapterSections[c];
  }
  const sumProduct = (set) => [...set].reduce((a, id) => a + (productMinutes[id] || 0), 0);
  // 产品 / PR 路线要读的最长一段：用来生成“这三样都在每节开头约 N 汉字以内”这句话
  const prodIds = [...routes.product.sections];
  const maxId = prodIds.reduce((a, b) => (productMinutes[a] >= productMinutes[b] ? a : b), prodIds[0]);
  const readHan = (id) => {
    const text = fs.readFileSync(files.find((f) => f.id === id).path, 'utf8');
    const i = text.indexOf('> **一句话听懂**');
    return han(i < 0 ? text : text.slice(0, text.indexOf('\n', i)));
  };
  tokens['routes.product.maxReadHan'] = readHan(maxId);
  tokens['routes.product.maxReadSection'] = maxId;
  tokens['routes.product.maxReadMinutes'] = productMinutes[maxId];
  for (const [key, r] of Object.entries(routes)) {
    // 产品 / PR 路线按“摘读”模型计时，其余两条按整节计时
    const sum = key === 'product' ? sumProduct : sumMinutes;
    tokens['routes.' + key + '.sections'] = r.sections.size;
    tokens['routes.' + key + '.minutes'] = sum(r.sections);
    tokens['routes.' + key + '.timeText'] = '约 ' + formatMinutes(sum(r.sections));
    tokens['routes.' + key + '.perSectionText'] = formatMinutes(sum(r.sections) / r.sections.size);
    r.steps.forEach((s, i) => {
      tokens['routes.' + key + '.step' + (i + 1) + '.sections'] = s.sections.size;
      tokens['routes.' + key + '.step' + (i + 1) + '.timeText'] = '约 ' + formatMinutes(sum(s.sections));
    });
  }
  const tierKey = { '基础必备': 'base', '现代常用': 'common', '研究前沿': 'frontier' };
  for (const [zh, key] of Object.entries(tierKey)) {
    if (!tiers[zh]) continue;
    tokens['tier.' + key + '.sections'] = tiers[zh].size;
    tokens['tier.' + key + '.minutes'] = sumMinutes(tiers[zh]);
  }
  for (const [role, n] of Object.entries(qaByRole)) tokens['qa.role.' + role] = n;

  return {
    tokens,
    sections: files.map((s) => ({ id: s.id, chapter: s.chapter, minutes: minutes[s.id], words: words[s.id] })),
    chapterMinutes, totalMinutes, routes, tiers, qa: { total: qaTotal, sections: qaSections, byRole: qaByRole },
    generatedAt: new Date().toISOString(),
  };
}

/** 把 {{stat:key}} 替换成数字；未知 key 直接抛错，避免把占位符发到线上 */
export function substituteStats(text, tokens) {
  return text.replace(/\{\{stat:([A-Za-z0-9._-]+)\}\}/g, (m, key) => {
    if (!(key in tokens)) throw new Error('未知统计占位符 {{stat:' + key + '}}');
    return String(tokens[key]);
  });
}

/** 计算并写出 src/data/stats.json，返回统计结果（sync / dev / 手动运行共用） */
export function writeStatsFile() {
  const s = computeStats();
  const out = path.join(siteRoot, 'src/data/stats.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ generatedAt: s.generatedAt, tokens: s.tokens, chapterMinutes: s.chapterMinutes, totalMinutes: s.totalMinutes, qa: s.qa }, null, 2) + '\n');
  return { stats: s, out };
}

if (process.argv[1] && process.argv[1].endsWith('stats.mjs')) {
  const { stats: s, out } = writeStatsFile();
  console.log('已写出 ' + out);
  console.log('节数 ' + s.tokens['sections.total'] + '，章数 ' + s.tokens['chapters.total'] + '，总时长 ' + s.tokens['minutes.totalText'] + '（' + s.tokens['minutes.total'] + ' 分钟）');
  for (const c of Object.keys(s.chapterMinutes).sort()) console.log('  第 ' + c + ' 章 ' + s.tokens['sections.chapter.' + c] + ' 节 ' + s.tokens['minutes.chapterText.' + c]);
  for (const k of ['engineer', 'student', 'product']) console.log('  路线 ' + k + '：' + s.tokens['routes.' + k + '.sections'] + ' 节 ' + s.tokens['routes.' + k + '.timeText']);
  console.log('  三档：' + ['base','common','frontier'].map(k => k + '=' + s.tokens['tier.' + k + '.sections']).join(' '));
  console.log('  QA：' + s.qa.total + ' 问 / ' + s.qa.sections + ' 节，' + JSON.stringify(s.qa.byRole));
  for (const k of ['routes.product.step1','routes.product.step2','routes.product.step3','routes.product.step4']) console.log('  ' + k + '：' + s.tokens[k + '.sections'] + ' 节 ' + s.tokens[k + '.timeText']);
}
