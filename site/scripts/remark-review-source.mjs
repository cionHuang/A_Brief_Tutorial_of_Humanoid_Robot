import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = path.join(siteRoot, 'src/content/docs');
const repoRoot = path.dirname(siteRoot);
const blocks = new Set(['heading', 'paragraph', 'listItem', 'tableCell', 'blockquote']);
const firstContentLine = (text) => text.split('\n').findIndex((line) => line.trim() !== '');

/** Use parser positions, including list items and table cells, rather than nearby text. */
export function sourceLocation(file) {
  if (!file.path) return null;
  const relative = path.relative(docsRoot, file.path);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  const chapter = /^\d{2}-[^/]+\/[^/]+\.mdx?$/.test(relative);
  if (!chapter && !['index.mdx', '404.md'].includes(relative)) return null;
  const source = chapter ? path.join(repoRoot, 'chapters', relative) : file.path;
  const raw = readFileSync(source, 'utf8');
  const prefix = chapter
    ? raw.match(/^#\s+.+?\r?\n(\r?\n)?/)?.[0] ?? ''
    : raw.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/)?.[0] ?? '';
  const removedLines = prefix.split('\n').length - 1;
  const offset = removedLines + firstContentLine(raw.slice(prefix.length)) - firstContentLine(String(file.value));
  return { path: path.relative(repoRoot, source).split(path.sep).join('/'), offset };
}

export default function remarkReviewSource() {
  return (tree, file) => {
    const source = sourceLocation(file);
    if (!source) return;
    const visit = (node) => {
      if (blocks.has(node.type) && node.position?.start?.line) {
        node.data ??= {};
        node.data.hProperties ??= {};
        node.data.hProperties['data-src'] = `${source.path}:${node.position.start.line + source.offset}`;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
