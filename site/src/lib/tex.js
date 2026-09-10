/**
 * 在客户端把数学表达式渲染成 KaTeX HTML。
 * 供交互组件在拖动/切换后更新 SVG（foreignObject）和 HTML 读数里的公式。
 */
import katex from 'katex';

const OPTS = { throwOnError: false, strict: false };

/** 单个数学表达式 -> KaTeX HTML 字符串 */
export function katexHtml(tex) {
  return katex.renderToString(tex, OPTS);
}

/**
 * 混排片段 -> HTML 字符串。
 * parts: [{ tex: '\\mu F_n' }] 走 KaTeX；[{ text: '地面 ' }] 走普通文本（跟随页面字体）。
 */
export function texParts(parts) {
  return (parts || [])
    .map((part) => (part && part.tex != null ? katexHtml(part.tex) : String((part && part.text) ?? '')))
    .join('');
}

/** 把混排片段写进某个元素（通常是 .tex-box 或 <output>） */
export function setParts(el, parts) {
  if (el) el.innerHTML = texParts(parts);
}
