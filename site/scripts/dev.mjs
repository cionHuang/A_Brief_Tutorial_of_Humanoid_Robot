/**
 * 开发模式：启动 Astro dev server，并监听 chapters/ 变化自动重新同步内容。
 *
 * 手册正文在仓库根目录 chapters/ 下，不在 Astro 默认监听范围内。
 * 本脚本在 dev 期间监视 chapters/，文件变化后防抖 300ms 重新执行同步，
 * 由 Astro 的内容集合热更新负责刷新页面。
 */
import { watch } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chaptersRoot, syncContent } from './sync-content.mjs';
import { syncRobotAssets } from './sync-robot-assets.mjs';

await syncRobotAssets();
await syncContent();

// Astro 7 检测到 AI agent 环境时会自动后台启动 dev server，容易留下旧进程
// 继续占用 4321 并返回旧内容。显式关闭该行为，让 dev server 跟随本进程退出。
const astro = spawn('npx', ['astro', 'dev', '--force'], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
});

let timer;
let syncing = false;
function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (syncing) return;
    syncing = true;
    try {
      await syncContent();
    } catch (error) {
      console.error(`内容同步失败：${error.message}`);
    } finally {
      syncing = false;
    }
  }, 300);
}
const chaptersWatcher = watch(chaptersRoot, { recursive: true }, scheduleSync);
// 编辑器原子写入时，递归 watch 可能对已被删除的临时目录抛 ENOENT；
// 监听只是热更新的加速器，出错时应忽略，不能让整个 dev server 退出。
chaptersWatcher.on('error', (error) => {
  console.warn(`chapters 监听出错（已忽略）：${error.message}`);
});

// fs.watch 在编辑器的原子重命名写入后偶发漏报，用周期性 mtime 扫描兜底，
// 保证 chapters/ 的改动一定会触发同步
let snapshot = new Map();
async function scanChanges() {
  const next = new Map();
  for (const chapter of await readdir(chaptersRoot, { withFileTypes: true })) {
    if (!chapter.isDirectory() || !/^\d{2}-/.test(chapter.name)) continue;
    const dir = path.join(chaptersRoot, chapter.name);
    for (const name of await readdir(dir).catch(() => [])) {
      if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
      const s = await stat(path.join(dir, name));
      next.set(`${chapter.name}/${name}`, s.mtimeMs);
    }
  }
  const changed =
    next.size !== snapshot.size || [...next].some(([key, value]) => snapshot.get(key) !== value);
  snapshot = next;
  if (changed) scheduleSync();
}
setInterval(scanChanges, 2000);

console.log(`已监听 ${chaptersRoot}，正文修改将自动同步。`);

astro.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!astro.killed) astro.kill(signal);
    setTimeout(() => process.exit(0), 200).unref();
  });
}
