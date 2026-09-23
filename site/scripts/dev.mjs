/**
 * 开发模式：启动 Astro dev server，并监听 chapters/ 变化自动重新同步内容。
 *
 * 手册正文在仓库根目录 chapters/ 下，不在 Astro 默认监听范围内。
 * 本脚本在 dev 期间监视 chapters/：
 *  - 只改正文内容：防抖 300ms 重新同步，由 Astro 内容集合热更新自动刷新页面；
 *  - 新增 / 改名 / 删除小节，或增删 assets/images 下的图片（结构变化）：
 *    清除 .astro 缓存并自动重启 Astro，
 *    避免内容集合缓存过期导致的 404——以前这种情况必须手动重启 dev server；
 *  - fs.watch 在编辑器原子写入后偶发漏报，用 2s 的 mtime 扫描兜底。
 *
 * 进程管理：Astro 直接以子进程运行在独立进程组里，重启/退出时整组回收，
 * 避免旧进程继续占用 4321 导致新实例悄悄换端口（浏览器就停在旧页面）。
 * 启动前还会清理本项目上一次残留的 astro（端口被占时）。
 * Astro 重启后，浏览器里的 Vite 客户端会自动重连并刷新页面，无需手动操作。
 */
import { watch } from 'node:fs';
import { readdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chaptersRoot, syncContent } from './sync-content.mjs';
import { syncRobotAssets } from './sync-robot-assets.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_PORT = 4321;
const ASTRO_BIN = path.join(siteRoot, 'node_modules', 'astro', 'bin', 'astro.mjs');

const REVIEW = process.argv.includes('--review');
if (REVIEW) {
  process.env.REVIEW = '1';
  console.log('[review] 审阅模式：hover 页面上的任意段落可看到源文件行号（点击复制）；正式构建不含这些标记。');
}

await syncRobotAssets();
await syncContent();

let astro = null;
let restarting = false;
let shuttingDown = false;
let consecutiveFailures = 0;

/** 找出监听某端口、且属于本项目的 astro 进程并强杀，释放端口。 */
function freeStalePort(port) {
  let raw = '';
  try {
    raw = execSync(`ss -ltnp 2>/dev/null | grep -E ':?${port} ' || true`, { encoding: 'utf8' });
  } catch {
    return;
  }
  const pids = [...new Set([...raw.matchAll(/pid=(\d+)/g)].map((m) => Number(m[1])))];
  for (const pid of pids) {
    let args = '';
    try {
      args = execSync(`ps -p ${pid} -o args=`, { encoding: 'utf8' });
    } catch {
      continue;
    }
    if (!/astro/i.test(args) || !args.includes(siteRoot)) continue;
    console.log(`[dev] 端口 ${port} 被上一次残留的 astro（pid ${pid}）占用，已释放。`);
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      /* 进程可能已退出 */
    }
  }
}

function startAstro() {
  freeStalePort(SITE_PORT);
  // Astro 7 检测到 AI agent 环境时会自动后台启动 dev server，容易留下旧进程；
  // 关闭该行为；--ignore-lock 避免上次异常退出留下的锁文件挡住新实例。
  astro = spawn(
    process.execPath,
    [ASTRO_BIN, 'dev', '--force', '--port', String(SITE_PORT)],
    {
      stdio: 'inherit',
      detached: true,
      env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
    },
  );
  const startedAt = Date.now();
  astro.on('exit', (code, signal) => {
    if (shuttingDown || restarting || signal) return;
    consecutiveFailures = Date.now() - startedAt < 5000 ? consecutiveFailures + 1 : 0;
    if (consecutiveFailures >= 3) {
      console.error('[dev] astro 连续启动失败，已停止自动重启，请检查上面的报错。');
      process.exit(1);
    }
    console.error(`[dev] astro 意外退出（code=${code}），3 秒后自动重启…`);
    setTimeout(startAstro, 3000);
  });
}

/** 结束当前 Astro 进程组，等待其真正退出（必要时升级为 SIGKILL）。 */
function killAstro(signal = 'SIGTERM') {
  return new Promise((resolve) => {
    if (!astro || astro.exitCode !== null) return resolve();
    const pid = astro.pid;
    const done = () => resolve();
    astro.once('exit', done);
    try {
      process.kill(-pid, signal);
    } catch {
      try {
        astro.kill(signal);
      } catch {
        /* 忽略 */
      }
    }
    setTimeout(() => {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {
        /* 忽略 */
      }
      resolve();
    }, 4000).unref();
  });
}

async function restartAstro(reason) {
  if (restarting || shuttingDown) return;
  restarting = true;
  console.log(`[dev] 检测到章节结构变化（${reason}），清除 .astro 缓存并重启 Astro…`);
  try {
    await killAstro();
    await rm(path.join(siteRoot, '.astro'), { recursive: true, force: true });
    await syncContent();
  } catch (error) {
    console.error(`[dev] 重启前处理失败：${error.message}`);
  } finally {
    restarting = false;
  }
  if (!shuttingDown) {
    startAstro();
    console.log('[dev] Astro 已重启，浏览器会自动刷新。');
  }
}

startAstro();

let timer;
let syncing = false;
function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (syncing || restarting) return;
    syncing = true;
    try {
      await syncContent();
      console.log('[dev] 已同步 chapters 改动，页面热更新。');
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

// mtime 扫描兜底 + 结构变化检测（新增/删除小节会改变集合大小）
async function snapshotChapters() {
  const next = new Map();
  for (const chapter of await readdir(chaptersRoot, { withFileTypes: true })) {
    if (!chapter.isDirectory() || !/^\d{2}-/.test(chapter.name)) continue;
    const dir = path.join(chaptersRoot, chapter.name);
    for (const name of await readdir(dir).catch(() => [])) {
      if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
      const s = await stat(path.join(dir, name)).catch(() => null);
      if (s) next.set(`${chapter.name}/${name}`, s.mtimeMs);
    }
    // 图片增删会让 Astro 的 content-assets 缓存失效；若不重启，页面会报
    // ImageNotFound。所以把 chapters/*/assets/images 里的文件也纳入结构检测：
    // 数量或文件名一变，就按“结构变化”清 .astro 并重启。
    const imagesDir = path.join(dir, 'assets', 'images');
    for (const name of await readdir(imagesDir).catch(() => [])) {
      next.set(`${chapter.name}/assets/images/${name}`, 1);
    }
  }
  return next;
}

let snapshot = await snapshotChapters();
setInterval(async () => {
  const next = await snapshotChapters();
  const structural =
    next.size !== snapshot.size || [...next.keys()].some((key) => !snapshot.has(key));
  const changed = [...next].some(([key, value]) => snapshot.get(key) !== value);
  snapshot = next;
  if (structural) {
    await restartAstro('新增或删除了小节文件');
  } else if (changed) {
    scheduleSync();
  }
}, 2000);

console.log(`已监听 ${chaptersRoot}，正文修改将自动同步并刷新页面。`);
console.log(`页面：http://127.0.0.1:${SITE_PORT}/A_Brief_Tutorial_of_Humanoid_Robot/`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await killAstro(signal);
    process.exit(0);
  });
}
