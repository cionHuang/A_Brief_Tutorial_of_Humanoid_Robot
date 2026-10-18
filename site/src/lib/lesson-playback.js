/** One-button, visible-only playback shared by the guided arm lessons. */
import { createVisibleRaf } from './visible-raf.js';
export function createLessonPlayback(root, button, { duration, draw, load }) {
  let time = 0, playing = false, last = 0, ready = false, started = false, disposed = false;
  const updateButton = () => {
    button.textContent = playing ? '暂停' : time >= duration ? '再看一遍' : time > 0 ? '继续播放' : '播放演示';
    root.dataset.playing = String(playing);
    root.dataset.lessonTime = String(time);
  };
  const loop = createVisibleRaf(root, { rootMargin: '0px', onEnter: async () => {
    last = 0;
    if (started || disposed) return;
    started = true;
    try {
      await load();
      if (disposed) return;
      ready = true; button.disabled = false; draw(time); loop.schedule();
    } catch { root.dataset.state = 'error'; }
  }});
  loop.onFrame(now => {
    if (!ready) return false;
    if (playing && last && now - last < 200) time = Math.min(duration, time + Math.min(.05, (now-last)/1000));
    last = playing ? now : 0;
    if (time >= duration) playing = false;
    draw(time); updateButton();
    return playing;
  });
  const click = () => {
    if (!ready) return;
    if (time >= duration) time = 0;
    playing = !playing; last = 0; updateButton();
    if (playing) loop.start(); else loop.schedule();
  };
  button.addEventListener('click', click);
  updateButton();
  return { schedule: () => loop.schedule(), dispose: () => {
    disposed = true; loop.dispose(); button.removeEventListener('click', click);
  }};
}
