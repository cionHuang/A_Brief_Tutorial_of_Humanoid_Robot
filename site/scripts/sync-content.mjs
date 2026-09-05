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
 *
 * 生成结果不入库（见 site/.gitignore），由 dev/build 前自动执行。
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const chaptersRoot = path.resolve(siteRoot, '..', 'chapters');
const docsRoot = path.join(siteRoot, 'src', 'content', 'docs');

export async function syncContent() {
  const chapterDirs = (await readdir(chaptersRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (chapterDirs.length === 0) {
    throw new Error(`未在 ${chaptersRoot} 找到章节目录`);
  }

  let pageCount = 0;
  const missingImages = [];

  for (const chapter of chapterDirs) {
    const sourceDir = path.join(chaptersRoot, chapter);
    const targetDir = path.join(docsRoot, chapter);

    // 全量重建该章节目录，保证删除的小节不会残留
    await rm(targetDir, { recursive: true, force: true });
    await mkdir(targetDir, { recursive: true });

    const sections = (await readdir(sourceDir))
      .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
      .sort();

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
      const frontmatter = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
      await writeFile(path.join(targetDir, section), frontmatter + body);

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
    } catch {
      // 该章节没有 assets 目录
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
