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

await syncContent();

const astro = spawn('npx', ['astro', 'dev'], { stdio: 'inherit' });

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

// Astro dev 以守护进程方式运行后会自行退出，本进程依靠 fs.watch 保持存活，
// 持续承担 chapters/ 的监听与同步职责。停止服务用 npx astro dev stop。
