/**
 * 内容同步脚本：把仓库根目录 chapters/ 下的章节 Markdown 同步为
 * Starlight 的 src/content/docs/ 内容集合。
 *
 * 章节文件是手册的唯一内容源，本脚本只做构建期转换：
 * 1. 从每个小节首行 `# X.Y 标题` 提取标题，注入 Starlight frontmatter；
 * 2. 删除正文中的首个 H1，避免与 Starlight 页面标题重复；
 * 3. 按原目录结构复制 assets/ 图片，保持相对路径引用不变；
 * 4. 支持 .md 与 .mdx 小节（需要嵌入交互组件的小节使用 .mdx，
 *    组件放在 site/src/components/，用相对路径引入）；
 * 5. 校验每条图片引用在目标侧存在，缺失时让构建失败。
 * 6. 原地增量更新：内容未变的文件不重写，仅删除已不属于内容源的文件，
 *    避免整目录删除重建导致 dev 服务器的文件监听失效。
 * 7. 把指向其他小节的相对 .md/.mdx 链接改写为带 base 的站点路由，
 *    Astro 只解析 .md 正文中的 .md 链接，.mdx 来源或 .mdx 目标都会
 *    留下不可点击的裸相对路径。
 *
 * 生成结果不入库（见 site/.gitignore），由 dev/build 前自动执行。
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { substituteStats, writeStatsFile } from './stats.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const chaptersRoot = path.resolve(siteRoot, '..', 'chapters');
const docsRoot = path.join(siteRoot, 'src', 'content', 'docs');

// 从 astro.config.mjs 读取部署 base（如 /A_Brief_Tutorial_of_Humanoid_Robot）
const astroConfigSrc = await readFile(path.join(siteRoot, 'astro.config.mjs'), 'utf8');
const siteBase = astroConfigSrc.match(/siteBase\s*=\s*'([^']+)'/)?.[1] ?? '';

export async function syncContent() {
  const chapterDirs = (await readdir(chaptersRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  // 章节目录重命名后，删除已不属于内容源的旧生成目录，避免旧章节残留。
  const generatedDirs = (await readdir(docsRoot, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name);
  for (const generatedDir of generatedDirs) {
    if (!chapterDirs.includes(generatedDir)) {
      await rm(path.join(docsRoot, generatedDir), { recursive: true, force: true });
    }
  }

  if (chapterDirs.length === 0) {
    throw new Error(`未在 ${chaptersRoot} 找到章节目录`);
  }

  let pageCount = 0;
  const missingImages = [];
  // 统计数字（节数、时长、路线覆盖、QA）统一从内容源推导，正文里写 {{stat:key}}
  const { stats } = writeStatsFile();

  for (const chapter of chapterDirs) {
    const sourceDir = path.join(chaptersRoot, chapter);
    const targetDir = path.join(docsRoot, chapter);

    await mkdir(targetDir, { recursive: true });

    const sections = (await readdir(sourceDir))
      .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
      .sort();

    // 删除目标侧已不属于内容源的小节文件
    const existingSections = (await readdir(targetDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')))
      .map((entry) => entry.name);
    for (const stale of existingSections.filter((name) => !sections.includes(name))) {
      await rm(path.join(targetDir, stale), { force: true });
    }

    for (const section of sections) {
      const raw = await readFile(path.join(sourceDir, section), 'utf8');
      const match = raw.match(/^#\s+(.+?)\s*$/m);
      if (!match) {
        throw new Error(`${chapter}/${section} 缺少一级标题，无法生成 frontmatter`);
      }
      const title = match[1];
      // 去掉首个 H1 及其后紧跟的空行，其余内容原样保留
      let body = raw.replace(/^#\s+.+?\r?\n(\r?\n)?/, '');
      // MDX 不支持 <url> 自动链接语法（会被当成 JSX），转换为裸 URL，
      // 由 remark-gfm 自动链接化；组件标签（如 <ClosedLoopDiagram />）不受影响
      if (section.endsWith('.mdx')) {
        body = body.replace(/<(https?:\/\/[^>\s]+)>/g, '$1');
      }
      // 相对小节链接 → 站点路由：./xx.md、../02-mechanics/xx.md#锚点 等
      body = body.replace(
        /\]\((\.{1,2}\/[^)\s]+?\.mdx?)(#[^)\s]+)?\)/g,
        (match, file, anchor = '') => {
          const rel = file.startsWith('./') ? `${chapter}/${file.slice(2)}` : file.replace(/^\.\.\//, '');
          const route = rel.replace(/\.mdx?$/, '');
          return `](${siteBase}/${route}/${anchor})`;
        },
      );
      // 统计占位符 → 实际数字（未知 key 会直接抛错，避免占位符上线）
      body = substituteStats(body, stats.tokens);
      const frontmatter = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
      const targetFile = path.join(targetDir, section);
      const next = frontmatter + body;
      // 内容未变时不重写，保持文件 mtime 稳定，减少 dev 热重载的无效触发
      let prev = null;
      try {
        prev = await readFile(targetFile, 'utf8');
      } catch {
        // 目标文件不存在
      }
      if (prev !== next) {
        await writeFile(targetFile, next);
      }

      // 校验图片引用（直接核对源目录，复制结构与原目录一致）
      for (const img of raw.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
        const ref = img[1];
        if (/^https?:\/\//.test(ref)) continue;
        const target = path.join(sourceDir, ref);
        try {
          await stat(target);
        } catch {
          missingImages.push(`${chapter}/${section} -> ${ref}`);
        }
      }
      pageCount += 1;
    }

    const assetsDir = path.join(sourceDir, 'assets');
    try {
      await stat(assetsDir);
      await cp(assetsDir, path.join(targetDir, 'assets'), { recursive: true });
      // 删除目标侧已不属于内容源的图片
      const srcImagesDir = path.join(assetsDir, 'images');
      const dstImagesDir = path.join(targetDir, 'assets', 'images');
      const srcImages = await readdir(srcImagesDir).catch(() => []);
      const dstImages = await readdir(dstImagesDir).catch(() => []);
      for (const stale of dstImages.filter((name) => !srcImages.includes(name))) {
        await rm(path.join(dstImagesDir, stale), { force: true });
      }
    } catch {
      // 该章节没有 assets 目录；若目标侧残留则删除
      await rm(path.join(targetDir, 'assets'), { recursive: true, force: true });
    }
  }

  if (missingImages.length > 0) {
    throw new Error(`以下图片引用无法解析：\n  ${missingImages.join('\n  ')}`);
  }

  console.log(`同步完成：${chapterDirs.length} 章，${pageCount} 个小节。`);
}

// 直接执行（npm run sync）时运行一次；被 dev.mjs 引用时只导出函数
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await syncContent();
}
