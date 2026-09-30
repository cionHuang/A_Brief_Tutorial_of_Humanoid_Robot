export const reviewStyle = `
.srcline-badge{position:fixed;top:.5rem;right:.75rem;z-index:60;font-size:12px;padding:3px 8px;border-radius:999px;background:var(--sl-color-accent-low);color:var(--sl-color-accent-high);opacity:.85;pointer-events:none}
.srcline-chip{position:absolute;top:-1.45em;right:0;z-index:45;font-family:var(--sl-font-mono,monospace);font-size:11px;line-height:1.7;padding:2px 7px;border-radius:5px;background:var(--sl-color-bg-nav);border:1px solid var(--sl-color-gray-5);color:var(--sl-color-text);cursor:pointer;opacity:.92;max-width:100%;overflow-wrap:anywhere;box-shadow:0 2px 10px rgba(0,0,0,.22)}
.srcline-chip:focus-visible{outline:2px solid var(--sl-color-accent-high);outline-offset:2px}
`;

// Self-contained: serialized into a REVIEW-only inline script by astro.config.mjs.
export function initReview() {
  function ready() {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'srcline-chip';
    chip.hidden = true;
    chip.setAttribute('aria-live', 'polite');
    const badge = document.createElement('div');
    badge.className = 'srcline-badge';
    badge.textContent = '审阅模式 · hover 段落看源行号（y 键复制）';
    document.body.appendChild(badge);
    let current = null, timer = 0, host = null, previousPosition = '';

    function detach() {
      if (host) host.style.position = previousPosition;
      chip.remove();
      chip.hidden = true;
      current = null;
      host = null;
    }
    function hideAfter(delay) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Do not remove a control while someone is using it with the keyboard.
        if (document.activeElement !== chip) detach();
      }, delay);
    }
    function show(element) {
      const src = element.getAttribute('data-src');
      if (!src) return;
      if (host !== element) {
        detach();
        host = element;
        previousPosition = element.style.position;
        if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
        element.appendChild(chip);
      }
      current = src;
      chip.hidden = false;
      chip.textContent = src + '　点击复制';
      hideAfter(9000);
    }
    async function copy() {
      if (!current) return;
      const src = current;
      try {
        await navigator.clipboard.writeText(src);
        if (current === src) chip.textContent = '已复制 ' + src;
        hideAfter(1800);
      } catch {
        if (current === src) chip.textContent = '复制失败，请手动复制：' + src;
        hideAfter(9000);
      }
    }
    document.addEventListener('mouseover', (event) => {
      if (event.target.closest?.('.srcline-chip')) return;
      const element = event.target.closest?.('[data-src]');
      if (element) show(element);
    }, true);
    chip.addEventListener('click', (event) => {
      event.stopPropagation();
      copy();
    });
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      if (event.key !== 'y' || !current || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
          target.isContentEditable || target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
      event.preventDefault();
      copy();
    });
  }
  if (document.readyState !== 'loading') ready();
  else document.addEventListener('DOMContentLoaded', ready, { once: true });
}
