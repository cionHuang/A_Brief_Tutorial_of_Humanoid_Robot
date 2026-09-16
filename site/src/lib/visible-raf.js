/**
 * 可见性感知的 `requestAnimationFrame` 调度器（全站共用一个实现）。
 *
 * 解决的问题：交互组件里的常驻动画循环，在元素滚出视口、或标签页切到后台之后
 * 仍以 60 fps 空转。Chrome 只对「隐藏标签页」节流 rAF，对「可见但滚出视口」
 * 不节流，读者往下翻几屏，前面几个演示还在烧 CPU 和电量。
 *
 * 本模块把「元素在视口内」与「标签页可见」两个条件合并成一个调度器，
 * 组件不再各自实现 `IntersectionObserver` + `visibilitychange`（避免每个组件
 * 都挂一套观察者，最后没人摘）。
 *
 * 用法（每个组件只建一个实例）：
 *   import { createVisibleRaf } from '../lib/visible-raf.js';
 *   const loop = createVisibleRaf(demo);
 *   loop.onFrame(() => { 画一帧 });   // 返回 false 可让连续模式自行停下
 *   loop.start();                     // 连续渲染：离屏自动暂停，回来自动续
 *   loop.schedule();                  // 交互后补一帧（幂等，可反复调用）
 *   loop.dispose();                   // 卸载：停帧 + 断开 observer + 摘监听
 *
 * rootMargin：进入判定向外扩的边距，默认 160px（提前 160px 恢复渲染，
 * 滚回来时不会看到停住的画面）。
 * onEnter：每次进入视口时调用；「进视口才初始化」的场景由调用方自行守卫首次。
 */
export function createVisibleRaf(el, { rootMargin = '160px', onEnter } = {}) {
  let frameFn = null;
  let raf = 0;
  let continuous = false;
  let inView = true; // 无 IntersectionObserver 时退化为「按可见处理」，行为同旧代码
  let pageVisible = !document.hidden;
  let disposed = false;

  const canRun = () => !disposed && inView && pageVisible && frameFn !== null;
  const schedule = () => {
    if (raf || !canRun()) return;
    raf = requestAnimationFrame(run);
  };
  const run = (now) => {
    raf = 0;
    if (!canRun()) return;
    const keepGoing = frameFn(now) !== false;
    if (continuous && keepGoing) schedule();
  };

  const io = typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(
        (entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          if (!inView) return;
          if (onEnter) onEnter();
          schedule();
        },
        { rootMargin },
      );
  if (io) io.observe(el);
  else if (onEnter) onEnter();

  const onVisibility = () => {
    pageVisible = !document.hidden;
    if (pageVisible) schedule();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    /** 注册每帧回调（只会有一个）。 */
    onFrame(fn) { frameFn = fn; return this; },
    /** 排一帧；离屏或后台时什么都不做。 */
    schedule,
    /** 进入连续渲染模式（离屏/后台自动暂停，回来自动续）。 */
    start() { continuous = true; schedule(); return this; },
    /** 暂停连续渲染（已排的帧会取消）。 */
    stop() { continuous = false; if (raf) cancelAnimationFrame(raf); raf = 0; return this; },
    /** 销毁：停帧、断开 observer、摘掉 visibilitychange。 */
    dispose() { disposed = true; this.stop(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', onVisibility); },
  };
}
