/**
 * 机器人模型资源同步：把 G1 URDF 及其真实引用的 STL 网格复制到
 * Astro public/ 目录，供浏览器端 urdf-loader 加载。
 *
 * URDF 中的网格路径保持相对引用（meshes/*.STL），因此这里同步目录结构，
 * 不修改描述文件内容。生成结果不入库。
 */
import { copyFile, cp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const robotAssetsRoot = path.resolve(siteRoot, '..', 'robot_descriptions', 'g1');
const publicAssetsRoot = path.join(siteRoot, 'public', 'models', 'g1');
const urdfName = 'g1_29dof.urdf';
// 2.1 节并联踝演示使用的第三方简化踝网格（来源见 third_party/parallel_ankle_g1/SOURCE.md）
const ankleAssetsRoot = path.resolve(siteRoot, '..', 'third_party', 'parallel_ankle_g1', 'meshes');
const publicAnkleRoot = path.join(siteRoot, 'public', 'models', 'ankle-g1-simplified');

function assertSafeRelativePath(ref) {
  if (path.isAbsolute(ref)) {
    throw new Error(`URDF 引用了绝对网格路径：${ref}`);
  }

  const normalized = path.normalize(ref);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`URDF 引用了越界网格路径：${ref}`);
  }
  return normalized;
}

export async function syncRobotAssets() {
  const sourceUrdf = path.join(robotAssetsRoot, urdfName);
  const urdf = await readFile(sourceUrdf, 'utf8');
  const meshRefs = [
    ...new Set(
      [...urdf.matchAll(/<mesh\s+[^>]*filename=["']([^"']+)["']/g)].map((match) =>
        assertSafeRelativePath(match[1]),
      ),
    ),
  ];

  await rm(publicAssetsRoot, { recursive: true, force: true });
  await mkdir(path.join(publicAssetsRoot, 'meshes'), { recursive: true });
  await copyFile(sourceUrdf, path.join(publicAssetsRoot, urdfName));

  for (const ref of meshRefs) {
    const source = path.join(robotAssetsRoot, ref);
    const target = path.join(publicAssetsRoot, ref);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
  }

  await rm(publicAnkleRoot, { recursive: true, force: true });
  await cp(ankleAssetsRoot, publicAnkleRoot, { recursive: true });

  console.log(`机器人资源同步完成：1 个 URDF，${meshRefs.length} 个网格；踝部简化模型网格已同步。`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await syncRobotAssets();
}
