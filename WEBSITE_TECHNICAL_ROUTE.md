# 网站技术路线

本文件记录把本手册发布为 GitHub Pages 网站的技术选型与实施路线。目标形态：以文字为主的在线文档，内嵌可交互的 URDF 机器人渲染、参数化交互动画、带来源的代码展示，以及图片、动图、视频和外链能力。

## 总体架构：静态文档站 + 交互组件岛

GitHub Pages 只提供静态托管，因此全站采用静态站点生成（SSG）：构建期产出纯 HTML/CSS/JS，无服务端依赖。页面默认零 JS，只有交互组件所在的区域加载并激活对应脚本（Islands 架构）。这本书约九成内容是文字，交互组件集中在少数小节，Islands 架构与之匹配。

## 技术选型

### 站点框架：Astro + Starlight

- Starlight 是 Astro 官方的文档站方案，自带侧边栏导航、全文搜索、代码高亮（Shiki）、明暗色主题；
- Markdown 直接作为内容源（Content Collections），现有 `chapters/` 目录结构可原样迁入；
- Islands 架构允许在 Markdown 中嵌入按激活的交互组件，其余页面保持纯静态；
- 参考实例：Astro 官方文档（docs.astro.build）、Cloudflare 开发者文档（developers.cloudflare.com）、Biome（biomejs.dev）。

备选方案：Docusaurus（React 生态，功能完备但更重）、VitePress（Vue 生态，更轻）。交互组件若用 React 编写，三条路线都可行，迁移成本低。

### URDF 交互渲染：three.js + urdf-loader

- `urdf-loader`（gkjohnson 开源库）在浏览器中直接加载 URDF 与 STL/OBJ 网格；
- 目标交互：关节滑条摆姿势、鼠标旋转缩放、切换模型变体（`g1_29dof` / 锁腰 / 带手）；
- 首批落点：2.1（机构与自由度）、2.5（机器人描述文件）；
- 后期增强（非首版范围）：用 MuJoCo 的 WASM 构建在浏览器内运行真实物理仿真。

### 参数化交互动画：手写 Canvas/SVG 组件

四连杆死区、万向节锁、摩擦锥、ZMP 支撑域等图示都是确定性的参数化几何，用原生 TypeScript + Canvas 实现拖动与参数调节，每个组件约一两百行，无需引入绘图库。每章一至两个，作为 Astro Island 嵌入对应小节。

### 代码展示：构建期拉取 + 来源标注

- 语法高亮由 Starlight 内置（Shiki）；
- 引用上游仓库代码时，构建期脚本按 `third_party/README.md` 固定的提交 SHA 从 GitHub 拉取指定文件与行段，内联为代码块，并附"仓库 / 相对路径 / 行号 / 许可证"出处行；
- 链接使用带 SHA 的 GitHub 永久链接，避免上游漂移导致引用失效；
- 首版可先只做"带行号的永久链接"，拉取内联作为增强。

### 媒体与外链

- 图片沿用现有 PNG，Markdown 原生引用；
- 动图优先使用 `<video loop muted>`（MP4/WebM），体积比 GIF 小一个数量级；
- 视频支持本地文件与外链嵌入；外链资源在构建期做可达性检查。

### 网格资产体积优化

`robot_descriptions/g1/meshes/` 的 STL 全量进入站点会拖慢首次加载，构建期将其转为 Draco 或 meshopt 压缩的 glTF（通常可减少 70–90% 体积），或按模型变体懒加载：读者打开对应小节时才下载对应网格。

### 部署：GitHub Actions → GitHub Pages

当前状态：工作流为**手动触发**（`workflow_dispatch`，见提交 940406d「本地调试期间暂停自动部署」），构建步骤是 `npm ci && npm run build`，产物发布到 Pages。

恢复自动部署的条件：本手册的整改批次收敛、站点连续若干次构建与预览验收通过之后，把 `on: workflow_dispatch` 换回 `on: push: branches: [main]`（建议加 `paths` 过滤，只在 chapters/、site/、robot_descriptions/ 变化时触发），并同步更新本节文字。

## 分阶段实施

| 阶段 | 内容 | 验收标准 |
| --- | --- | --- |
| P0 骨架 | Astro + Starlight 初始化，22 个小节迁入，图片路径适配，Actions 部署 | 全书可在线阅读，构建无警告 |
| P1 URDF 查看器 | urdf-loader 组件：关节滑条、变体切换、视角操作 | 嵌入 2.1、2.5 节，移动端可用 |
| P2 首个交互动画 | 四连杆死区拖动组件 | 验证组件模式后推广到万向节锁、摩擦锥、ZMP |
| P3 代码引用组件 | 构建期按 SHA 拉取代码段并标注来源 | 至少覆盖 SDK 消息定义与低层示例 |
| P4 媒体与打磨 | 动图/视频、暗色模式核对、移动端排版检查 | 全站 Lighthouse 达标 |

## 已识别的风险

1. urdf-loader 对 G1 STL 网格的加载效果与压缩后体积，需要在 P1 早期验证；
2. Starlight 与 Astro 主版本升级较快，依赖应锁版本并定期做升级测试；
3. 交互组件数量增长后需要统一的样式与加载策略，避免单页 JS 体积膨胀。
