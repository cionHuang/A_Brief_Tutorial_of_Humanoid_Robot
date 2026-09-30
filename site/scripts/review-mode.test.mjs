import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import remarkReviewSource from './remark-review-source.mjs';
import { initReview } from './review-mode.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('review maps native list and table positions without inheriting a previous paragraph', () => {
  const relative = '01-system-overview/01-what-is-embodied-ai.mdx';
  const raw = readFileSync(path.join(siteRoot, '../chapters', relative), 'utf8');
  const prefix = raw.match(/^#\s+.+?\r?\n(\r?\n)?/)[0];
  const removed = prefix.split('\n').length - 1;
  const body = raw.slice(prefix.length);
  const sourceLine = raw.split('\n').findIndex((line) => line.startsWith('- 机器人自己')) + 1;
  assert.ok(sourceLine > 0);
  for (const leading of ['', '   \n   \n   \n']) {
    const leadingLines = leading.split('\n').length - 1;
    const tree = { type: 'root', children: ['paragraph', 'listItem', 'tableCell', 'blockquote'].map((type) => ({
      type, position: { start: { line: sourceLine - removed + leadingLines } },
    })) };
    remarkReviewSource()(tree, { path: path.join(siteRoot, 'src/content/docs', relative), value: leading + body });
    for (const node of tree.children) assert.equal(node.data.hProperties['data-src'], `chapters/${relative}:${sourceLine}`);
  }
});

test('review keeps exact source lines on handwritten pages', () => {
  const filePath = path.join(siteRoot, 'src/content/docs/index.mdx');
  const raw = readFileSync(filePath, 'utf8');
  const prefix = raw.match(/^---\n[\s\S]*?\n---\n/)[0];
  const line = raw.split('\n').findIndex((text) => text.startsWith('## 这本书')) + 1;
  const masked = prefix.replace(/[^\n]/g, ' ') + raw.slice(prefix.length);
  const tree = { type: 'heading', position: { start: { line } } };
  remarkReviewSource()(tree, { path: filePath, value: masked });
  assert.equal(tree.data.hProperties['data-src'], `site/src/content/docs/index.mdx:${line}`);
});

function reviewHarness(writeText) {
  const handlers = {}, writes = [], elements = [];
  const document = { readyState: 'complete', body: { appendChild() {} }, activeElement: null,
    addEventListener(name, handler) { handlers[name] = handler; },
    createElement() {
      const element = { style: {}, hidden: false, textContent: '', setAttribute() {}, remove() {},
        addEventListener(name, handler) { this[name] = handler; } };
      elements.push(element); return element;
    },
  };
  vm.runInNewContext(`(${initReview.toString()})();`, { document, getComputedStyle: () => ({ position: 'static' }),
    setTimeout: () => 1, clearTimeout() {}, navigator: { clipboard: { async writeText(text) { writes.push(text); await writeText(text); } } },
  });
  const host = { style: { position: '' }, getAttribute: () => 'chapters/example.mdx:14', appendChild() {} };
  handlers.mouseover({ target: { closest: (selector) => selector === '[data-src]' ? host : null } });
  return { handlers, writes, chip: elements[0] };
}

test('y stays normal input in inputs, search, selects and editable regions', async () => {
  const { handlers, writes } = reviewHarness(async () => {});
  for (const target of [
    { closest: () => ({ tagName: 'INPUT' }) },
    { closest: () => ({ tagName: 'TEXTAREA' }) },
    { closest: () => ({ tagName: 'SELECT' }) },
    { isContentEditable: true, closest: () => null },
  ]) handlers.keydown({ key: 'y', target, preventDefault() { assert.fail('input was intercepted'); } });
  assert.deepEqual(writes, []);
  let prevented = false;
  handlers.keydown({ key: 'y', target: { closest: () => null }, preventDefault() { prevented = true; } });
  await new Promise(setImmediate);
  assert.equal(prevented, true);
  assert.deepEqual(writes, ['chapters/example.mdx:14']);
});

test('copy reports success only after clipboard resolves, and reports rejection', async () => {
  let resolve;
  const pending = reviewHarness(() => new Promise((done) => { resolve = done; }));
  pending.chip.click({ stopPropagation() {} });
  assert.match(pending.chip.textContent, /点击复制/);
  resolve();
  await new Promise(setImmediate);
  assert.match(pending.chip.textContent, /^已复制 /);
  const failed = reviewHarness(async () => { throw new Error('denied'); });
  failed.chip.click({ stopPropagation() {} });
  await new Promise(setImmediate);
  assert.match(failed.chip.textContent, /^复制失败，请手动复制：/);
});
