/**
 * 开发模式：启动 Astro dev server，并监听 chapters/ 变化自动重新同步内容。
 *
 * 手册正文在仓库根目录 chapters/ 下，不在 Astro 默认监听范围内。
 * 本脚本在 dev 期间监视 chapters/，文件变化后防抖 300ms 重新执行同步，
 * 由 Astro 的内容集合热更新负责刷新页面。
 */
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { chaptersRoot, syncContent } from './sync-content.mjs';
import { syncRobotAssets } from './sync-robot-assets.mjs';

await syncRobotAssets();
await syncContent();

// Astro 7 检测到 AI agent 环境时会自动后台启动 dev server，容易留下旧进程
// 继续占用 4321 并返回旧内容。显式关闭该行为，让 dev server 跟随本进程退出。
const astro = spawn('npx', ['astro', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
});

let timer;
let syncing = false;
watch(chaptersRoot, { recursive: true }, () => {
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
});

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
