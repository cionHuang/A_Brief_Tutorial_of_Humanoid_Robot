import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const base = fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8').match(/siteBase\s*=\s*'([^']+)'/)[1];
const files = fs.readdirSync(dist, { recursive: true }).filter((file) => file.endsWith('.html'));
const ids = new Map();
const issues = [];
let links = 0, qaLinks = 0, endpoints = 0;
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const htmlFor = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

for (const file of files) {
  const html = htmlFor(file);
  ids.set(file, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1]))));
  if (!process.env.REVIEW) assert.ok(!/class="srcline-|data-src="chapters\//.test(html), `${file}: review data in production`);
  if (html.includes('id="product-read-end"')) endpoints++;
  const answer = html.match(/<aside class="[^"]*\bsection-qa-answer\b[^"]*"[\s\S]*?<\/aside>/)?.[0];
  const qa = answer?.match(/<p class="qa-hint[^"]*"[^>]*>[\s\S]*?<\/p>/)?.[0];
  if (answer) {
    const expectsHint = ![
      '03-electrical-embedded/03-sensors-and-data-acquisition/index.html',
      '03-electrical-embedded/04-real-time-communication-and-buses/index.html',
      '03-electrical-embedded/05-mcu-realtime-embedded-software/index.html',
    ].includes(file);
    assert.equal(Boolean(qa), expectsHint, `${file}: unexpected SectionQA return hint visibility`);
  }
  if (qa) {
    assert.ok(qa.includes(`href="${base}/01-system-overview/03-humanoid-robot-system-architecture/"`), `${file}: malformed SectionQA return link`);
    qaLinks++;
  }
}
for (const file of files) {
  const html = htmlFor(file);
  const url = `https://cionhuang.github.io${base}/${file.replace(/index\.html$/, '')}`;
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!href || /^(?:mailto|tel|javascript|data):/.test(href)) continue;
    const target = new URL(href, url);
    if (target.origin !== 'https://cionhuang.github.io') continue;
    links++;
    if (!target.pathname.startsWith(base + '/') && target.pathname !== base) {
      issues.push(`${file}: outside project base: ${href}`); continue;
    }
    let relative = decodeURIComponent(target.pathname.slice(base.length)).replace(/^\//, '');
    if (!path.extname(relative)) relative = path.join(relative, 'index.html');
    if (!fs.existsSync(path.join(dist, relative))) { issues.push(`${file}: missing ${href}`); continue; }
    if (target.hash && ids.has(relative) && !ids.get(relative).has(decodeURIComponent(target.hash.slice(1)))) {
      issues.push(`${file}: missing anchor ${href}`);
    }
  }
}
assert.equal(endpoints, 21, 'product route must have 21 real reading endpoints');
assert.equal(qaLinks, 30, 'all 30 enabled SectionQA return links must use the normalized base');
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${files.length} HTML pages, ${links} internal links/anchors, 21 product endpoints, SectionQA base links, production/review isolation.`);
