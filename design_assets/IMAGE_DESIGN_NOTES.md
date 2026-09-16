# 图片素材说明

本文档说明新增图片素材的设计目的，供后续编辑本项目的 agent 查阅。新增素材可先暂存于项目根目录的 `design_assets/`；正式接入页面后移动到对应章节的 `chapters/<章节>/assets/images/`，并在下方记录当前位置。注意 `.md` 说明文档不能放进 `src/content/docs/`，否则会被 Starlight 当成页面渲染。

## embodied-ai-keyword-collage.png

**具身智能关键词截图拼贴图**（2300×1960，约 1.6 MB）。

### 设计目的

- 用"各来源截图聚焦拼接"的视觉形式，直观传达"具身智能 / Embodied AI"这一关键词正在论文、政策、媒体、社交平台等多语境中同时出现、热度很高；
- 适合用作首页 hero、导读章节配图或"为什么要有这本书"的引入素材，帮助圈外读者建立"这个词已经无处不在"的直觉；
- 所有出现的关键词均以黄色高亮标记，保证不同来源、不同语言的碎片在视觉上被同一个焦点串联。

### 内容构成（9 块拼贴）

真实网页截图 ×6（2026-09-05 抓取，关键词已注入高亮）：

| 位置 | 来源 | 说明 |
| --- | --- | --- |
| 左上 | arXiv 检索页 | `"embodied AI"` 搜索结果 |
| 右上 | 中国政府网 | 政策解读《具身智能如何走向未来？》 |
| 中部 | 百度搜索 | "具身智能"搜索结果页 |
| 左下 | arXiv 论文页 | *A Survey of Embodied AI*（arXiv:2103.04918） |
| 右下 | 中国政府网转载 | 人民时评《由具身智能看健康消费》 |
| 中下 | Bing 搜索 | `具身智能 site:gov.cn` 结果页 |

推文样式卡片 ×3（两条英文、一条中文）：

- 注意：X/Twitter 需登录才能访问，这三张是**仿 X 界面制作的示例卡片**，账号与文案均为虚构，仅作视觉占位；
- 若需替换为真实推文截图，拿到真实推文截图后直接替换素材并重新拼图即可。

### 版式

米白背景（#F4F2EE），白框 + 柔和投影 + 轻微旋转（±3° 以内）的散落拼贴风格，允许局部重叠以营造"信息扑面而来"的感觉。

### 再生成 / 修改

源素材与生成脚本保留在仓库外的 `素材工作目录/`（Playwright 抓取的 `shots/` 原始截图、仿推文卡片 `tweets.html`、PIL 拼图脚本输出）。如需调整布局、替换素材或改尺寸，基于该目录重新生成后覆盖本文件即可，文件名保持不变以便引用方无需改动。

## physical-ai-keyword-collage.png

**物理AI 关键词截图拼贴图**（2300×1960，约 1.6 MB），与上一张"具身智能"拼贴图同版式、同尺寸，可并排使用或做"具身智能 ↔ 物理AI"概念对照。

### 设计目的

- "物理AI / Physical AI"是 2025 年以来由 NVIDIA 等推动的热门概念，与"具身智能"高度相关但侧重不同（前者强调理解物理规律、在物理世界行动，后者强调身体与环境的交互闭环）；用同样的多来源截图拼贴形式，直观传达该关键词在论文、厂商官方解读、百科、媒体、社交平台中的同时出现；
- 两张图风格一致，适合在"具身智能与物理AI是什么关系"这类导读内容中成对引用；
- 所有出现的关键词（物理AI / Physical AI / physical artificial intelligence）均以黄色高亮标记。

### 内容构成（9 块拼贴）

真实网页截图 ×6（2026-09-05 抓取，关键词已注入高亮）：

| 位置 | 来源 | 说明 |
| --- | --- | --- |
| 左上 | NVIDIA 官方 | Glossary《What Is Generative Physical AI?》（原 physical-ai 词条已重定向至此） |
| 右上 | 百度搜索 | "物理AI"搜索结果页 |
| 中部 | arXiv 检索页 | `"physical AI"` 搜索结果 |
| 左下 | 英文维基百科 | Physical artificial intelligence 词条 |
| 右下 | 36氪 | "物理AI"文章搜索页 |
| 中下 | NVIDIA 官方博客 | 《Into the Omniverse: How Open World Models Push the Frontier of Physical AI》（HTTP 200 实测；此前使用的《What Is Physical AI?》链接已 404，勿再使用） |

推文样式卡片 ×3（两条英文、一条中文）：

- 注意：X/Twitter 需登录才能访问，这三张是**仿 X 界面制作的示例卡片**，账号与文案均为虚构，仅作视觉占位；其中英文卡片里关于 "next wave of AI is Physical AI" 的表述是对 NVIDIA 公开主题演讲观点的转述而非原文引用；
- 若需替换为真实推文截图，拿到真实截图后替换素材重新拼图即可。

### 再生成 / 修改

源素材与生成脚本在 `素材工作目录/`（`shots_pai/` 原始截图、仿推文卡片 `tweets_pai.html`）。

## intel-realsense-d435-photo.jpg

**Intel RealSense D435 深度相机实拍图**（3472×4624，约 2.2 MB）。

当前位置：`chapters/01-system-overview/assets/images/intel-realsense-d435-photo.jpg`

### 设计目的

- 用于传感器相关章节展示人形机器人常用的深度相机实物（真实拍摄照片，非渲染图/合成图）；
- RealSense D 系列是机器人领域最常见的深度相机之一，适合配合感知/嵌入式章节使用。

### 来源与授权（引用时必须署名）

- 来源：Wikimedia Commons，文件页 https://commons.wikimedia.org/wiki/File:Intel_Realsense_depth_camera_D435.jpg
- 作者：Marc Auledas（https://commons.wikimedia.org/wiki/User:Auledas）
- 授权：CC BY-SA 4.0（https://creativecommons.org/licenses/by-sa/4.0），使用时需署名作者并注明相同方式共享；
- 下载时间：2026-09-07；原图未经修改。

### 同类备选

更多传感器实拍图链接（LiDAR、IMU、触觉传感器、真机搭载图等，均来自 Wikimedia Commons）见 `素材工作目录里的 commons_results.json`，按需下载并在本节补充同样的署名信息。

## shadow-dexterous-hand-photo.jpg

**Shadow Dexterous Hand 灵巧手实拍图**（2560×3840，约 0.6 MB，Shadow Hand 握持灯泡的经典官方照片）。

当前位置：`chapters/01-system-overview/assets/images/shadow-dexterous-hand-photo.jpg`

### 设计目的

- 用于末端执行器/灵巧操作相关章节，展示多指灵巧手的实物形态（真实拍摄照片，非渲染图/合成图）；
- Shadow Hand 是灵巧操作研究中最经典的平台之一，与书中操作（manipulation）内容契合。

### 来源与授权（引用时必须署名）

- 来源：Wikimedia Commons，文件页 https://commons.wikimedia.org/wiki/File:Shadow_Hand_Bulb_large.jpg
- 作者：Richard Greenhill and Hugo Elias（Shadow Robot Company）
- 授权：CC BY-SA 3.0（http://creativecommons.org/licenses/by-sa/3.0/），使用时需署名作者并注明相同方式共享；
- 下载时间：2026-09-07；原图未经修改。

### 同类备选（均为实拍，检索自 Wikimedia Commons）

- Schunk SVH 五指手（CC BY-SA 4.0）：https://commons.wikimedia.org/wiki/File:Servo-electric_5-Finger_gripping_hand_-_Schunk_SVH.JPG
- NIST 灵巧操作测试台（公有领域）：https://commons.wikimedia.org/wiki/File:NIST_Dexterous_Manipulation_Testbed_(9502902636).jpg
## 减速器实拍图（2.3 节）

**谐波、行星、摆线三类减速器的真实照片**（2026-09-09 检索并下载自 Wikimedia Commons，均按标题/描述核对，未做 AI 识别；已缩放至最长边 1400px、JPEG q82）。

当前位置：`chapters/02-mechanics/assets/images/`

### 04-reducer-harmonic-drive.jpg

- 内容：Harmonic Drive AG 的谐波减速器零件——波发生器轴承（左上）、柔轮（右上）、刚轮（下）；
- 来源：https://commons.wikimedia.org/wiki/File:Harmonic_Drive_AG_strain_wave_gear_set.jpg
- 作者：Pieceofmetalwork；授权：CC BY-SA 4.0（署名 + 相同方式共享）。

### 04-reducer-planetary.jpg

- 内容：行星齿轮组实物（Maybach-Motors VL2，腓特烈港齐柏林博物馆藏）；
- 来源：https://commons.wikimedia.org/wiki/File:Planetary_gears,_Maybach-Motors_VL2_-_Zeppelin_Museum_Friedrichshafen_-_DSC06814.jpg
- 作者：Daderot；授权：CC0。

### 04-reducer-cycloidal.jpg

- 内容：组装后的摆线减速器（立体光固化 3D 打印件）；
- 来源：https://commons.wikimedia.org/wiki/File:Stereolithography_cycloidal_drive.JPG
- 作者：Clemenspool；授权：CC BY-SA 3.0（署名 + 相同方式共享）。

### 备选

- 摆线驱动动画（公有领域，Petteri Aimonen，POV-Ray 渲染）：https://commons.wikimedia.org/wiki/File:Cycloidal_drive.gif
- 摆线减速器零件分解图（公有领域，Petteri Aimonen）：https://commons.wikimedia.org/wiki/File:Cycloidal_drive_parts.png
- 行星齿轮组特写（CC0）：https://commons.wikimedia.org/wiki/File:Looking_through_a_set_of_planetary_gears.png


## 5.1 自制概念图（原创、无第三方许可问题）

**六张通俗类比图**（2026-09-15 原创手绘 SVG，均为自包含矢量图：无外链字体、无外部位图、无 emoji，深浅色主题下均可正常显示）。用于把 5.1 节的抽象 AI 词汇讲成人话；正文图注只保留一句话说明，不含来源/作者/许可。整张图带浅色底 panel（`#f8fafc` 底、`#cbd5e1` 描边），主文字 `#0f172a`、次文字 `#475569`，配色蓝 `#2563eb`、绿 `#16a34a`、橙红 `#ea580c`、灰线 `#94a3b8`；站内 CSS `.sl-markdown-content img[src*="/ai-"]` 会把这些图放大到正文宽度（约 640 px），因此图内字号按放大后仍可读设计（主标签 24–28、次级 18–20、说明 16–18）。

当前位置：`chapters/05-brain-perception-planning-vla-wam/assets/images/`

### ai-rl-dog-training.svg（图 5.1-1）

- 内容：强化学习 = 训狗——左为简笔小狗（智能体 Agent）、右为简笔主人（环境 Environment）；上方蓝色箭头「动作 action：坐下 / 打滚 / 乱跑」，下方绿色箭头「奖励 reward：给零食 ✔」，另加一条橙色虚线分支「没做对 → 不给 ✘」；底部结论「做对了有零食 → 这个动作以后出现的概率变大」；
- 用途：放在 5.1「模型从哪来：三条路」小节讲「从试错学」之后，帮助读者一眼记住 agent / environment / action / reward 四个词；
- viewBox：`0 0 720 360`（显示宽约 640 px）。

### ai-attention-coreference.svg（图 5.1-2）

- 内容：注意力 = 每个词「看一圈」按相关度加权——以「小猫坐在垫子上，它很舒服」的 10 个 token 方块为例，从「它」出发，对「小猫」画一条粗蓝弧线（标 0.7），对「垫子」「上」画两条细灰弧线（各标 0.1）；右侧小图例「线越粗 = 注意力权重越大」，并注明这是示意、不是某个真实模型的输出；底部结论「注意力 = 让序列里每个 token 互相看一遍，按相关度加权取信息」；
- 用途：放在 5.1「架构：Transformer 与注意力」小节，讲完 QKV 与 softmax 加权之后，用指代消解类比解释「按相关度加权」；
- viewBox：`0 0 720 310`（显示宽约 640 px）。

### ai-token-pipeline.svg（图 5.1-3）

- 内容：VLA / WAM 的通用套路——左侧三张入口卡片「图像 / 语言指令 / 关节状态」（各配相机轮廓、对话气泡、简笔机械臂图标）汇入一排彩色 token 小方块（颜色区分来源），标注「统一成一条 token 序列」；中间圆角大框「Transformer（让每个 token 互相看）」；最右输出一排动作方块，标「动作块 action chunk：未来 N 步的关节 / 末端动作」，旁注「1–10 Hz」；底部结论「VLA / WAM 的通用套路：输入切成 token，输出也是 token（动作 token）」；
- 用途：放在 5.1「架构：Transformer 与注意力」小节末尾，讲完「为什么 VLA/WAM 选它」之后，用一张流水线图收束「多模态输入 → 动作输出」的通用流程；
- viewBox：`0 0 720 330`（显示宽约 640 px）。

### ai-action-multimodal.svg（图 5.1-4）

- 内容：为什么动作不能直接回归——左右两小格放在同一张图里：左为俯视示意，中间一个灰色障碍块，上方绿色弧线「方案 A」、下方绿色弧线「方案 B」分别绕过它，再从起点到终点画一条红色虚线直穿障碍、末端打红叉，标「回归的平均动作 ✗」；右为一维动作分布，横轴上两个绿色峰（做法 1 / 做法 2），两峰之间的红色竖虚线标「平均」，并注明「两峰之间取平均 → 左图直穿的红线」；底部结论「动作是连续、多峰的分布：直接回归容易把多个可行动作平均成一个不可行的动作」；
- 用途：放在 5.1「生成：扩散与流匹配」小节第一段之后、两个项目符号之前，先说明「为什么动作不能直接回归」；
- viewBox：`0 0 720 330`（显示宽约 640 px）。

### ai-diffusion-denoise.svg（图 5.1-5）

- 内容：扩散 = 先加噪再迭代去噪——上排 5 个并排小面板从左到右依次为「干净动作 → 加一点噪 → 噪声更多 → 几乎没结构 → 纯噪声」，红色小箭头向右，上方标「训练：逐步加噪 x_t」；下排同样 5 个面板（最右纯噪声、最左干净动作），蓝色小箭头向左，下方标「采样：从纯噪声出发，迭代去噪 N 步」；中间用红色「训练加噪 →」与蓝色「采样去噪 ←」两个大箭头区分方向；下方小注「每步：网络先预测“噪声有多少”，再减掉」「步数越多越慢 → 1–10 Hz 的来源之一」；底部结论「扩散 = 先教网络认噪声，再让它一步步把动作从噪声里“擦”出来」；
- 用途：放在 5.1「生成：扩散与流匹配」小节的 Diffusion 项目符号之后；
- viewBox：`0 0 720 388`（显示宽约 640 px）。

### ai-flow-matching.svg（图 5.1-6）

- 内容：流匹配 = 学一张速度地图——左侧一团灰蓝散点（噪声）、右侧一小簇收拢的橙色点（动作）；中间 5 条蓝色平滑流线把左侧散点连到右侧动作簇，每条流线中点带一个箭头，上方标「速度场 v_θ(x,t)：每个位置告诉你“往哪走、走多快”」；下方时间轴「t=0（噪声） ——沿流线积分（解常微分方程）→ t=1（动作）」；右下小注「与扩散的区别：不预测噪声，直接学速度；同样要迭代多步积分」；底部结论「流匹配 = 学一张速度地图，从噪声出发顺着箭头走到动作」；
- 用途：放在 5.1「生成：扩散与流匹配」小节的 Flow Matching 项目符号之后；
- viewBox：`0 0 720 340`（显示宽约 640 px）。

### 已弃用：Dive into Deep Learning（D2L）图

原 5.1 节引用的 4 张 D2L 官方仓库图（`ai-rl-agent-environment.svg`、`ai-qkv-attention.svg`、`ai-multi-head-attention.svg`、`ai-transformer-arch.svg`，原图号 5.1-1 至 5.1-4，许可 CC BY-SA 4.0）已全部删除，5.1 正文的引用与参考资料 [10] 同步清理。弃用原因：图内标注过于专业、不够通俗，读者反馈不易看懂；现由上面的原创类比图替代（并取消「多头注意力」「Transformer 完整架构」两张，正文保留一句「实际模型用多头注意力……」的说明即可）。

## 5.2 检测与分割对比图（真实照片 + 自制标注）

### detection-vs-segmentation.png（图 5.2-1）

- 当前位置：`chapters/05-brain-perception-planning-vla-wam/assets/images/detection-vs-segmentation.png`
- 尺寸与体量：1600×698，PNG，约 0.72 MB（小于 1.5 MB 上限）。正文列宽约 45rem（≈720px），图内文字按缩到 720px 显示仍清晰设计：顶部标题 40px、面板标题 38px、检测标签 34px、图例/分隔线标注 32px、底部说明 28px。
- 内容：同一张桌面俯拍照片左右两格。左格为「目标检测」：4 个彩色包围框（laptop 0.94、cup 0.91、book 0.87、notepad 0.83），逐个标注类别与置信度；另有一个灰色虚线框 `? 0.31` 标在蜡烛上，作为「低置信度不应直接进抓取闭环」的反例。右格为「实例分割」：仅对马克杯沿轮廓画约 40% 不透明度的青色多边形掩码并加同色描边，其余物体不标注，右上角附「cup 掩码」图例。两格之间用一条竖直分隔线加竖排「同一张照片」标注，强调两格为同一底图。
- 用途：放在 5.2「### 检测与分割」小节末尾，和正文「检测输出类别/置信度/包围框、实例分割输出每像素掩码、低置信度先二次确认」一一对应。
- 底图来源与许可：Unsplash 免费照片（Unsplash License，可自由用于商业/非商业、无需署名）。底图直链：<https://images.unsplash.com/photo-1587614382346-4ec70e388b28>；摄影师的 Unsplash 照片页在本次可达网络中无法确认（unsplash.com 页面被反爬拦截，oEmbed/napi 端点需授权），因此 5.2 参考资料 [7] 按许可仅标注来源站点与直链，未编造摄影师姓名。
- 标注性质：图中所有检测框、类别/置信度标签、掩码多边形与图例均为**作者自制示意标注**，不是任何真实模型（YOLO / SAM 等）在底图上的实际输出，置信度数值为示意值。底图本身未经修改，仅在渲染时缩放并叠加上述矢量标注。
- 再生成：生成脚本为本次会话使用的临时脚本（已清理）。逻辑为用 sharp 将照片缩放为两格底图，分别 composite 一层自绘制 SVG（`rect` 画框与标签、`polygon` 画掩码），再叠加整幅画布的标题条、格题、竖直分隔线与竖排标注、页脚。若需调整框或掩码，按同样的 SVG 叠加方式重做即可。

## 5.2 真实点云与平面提取对比图（真实点云 + 自制渲染）

### point-cloud-plane-extraction.png（图 5.2-2）

- 当前位置：`chapters/05-brain-perception-planning-vla-wam/assets/images/point-cloud-plane-extraction.png`
- 尺寸与体量：1600×1060，PNG，约 0.20 MB（远小于 1.5 MB 上限）。正文列宽约 720px，图内文字按缩到 720px 显示仍清晰设计：主标题 40px、格题 38px、图例与标签 34px、底部来源小字 28px（因源串较长分两行排布）。
- 内容：同一份真实点云左右两格。左格「原始点云：每个点带三维坐标」按点的高度 z 着色（深蓝低 → 青 → 浅黄高），并附竖直高度色标与 x/y/z 坐标轴示意，另以引线标注「杯子」，并标注桌面上的白色空洞——那是杯子遮挡导致的无深度点区域，即正文所说的「没观测 ≠ 没东西」；右格「平面提取：桌面被拟合出来（RANSAC），桌上物体留下」把 RANSAC 拟合出的桌面平面内点染成绿色、平面上方物体点（杯子等）染成橙色、平面以下背景点染成浅灰，底部标注「RANSAC 桌面内点 123,927（59%）」。两格之间用竖分隔线隔开。
- 数据处理：真实点云取自 PCL 官方示例 `table_scene_mug_stereo_textured.pcd`（640×480 组织化点云，307,200 点，其中有效点 209,280 个），文件为 `DATA binary_compressed`，按 PCL 的 LZF 格式解压后按字段分离（SoA：x/y/z/rgb 各自连续）解析。对有效点做一次 RANSAC 平面拟合（40,000 点子采样、1200 次迭代、距离阈值 0.012 m），再用 SVD 在全部内点上精修平面，得到桌面平面（内点 123,927 个）；把点云旋转到以该平面为 z=0 的桌面坐标系后按高度着色。渲染为自写透视投影（方位角 −95°、俯仰角 18°、按深度排序画半径约 1.7px 的圆点）。为突出桌面与马克杯，裁掉了平面以下 0.12 m 以外的远景背景点。
- 用途：放在 5.2「### 深度、点云与平面提取」小节末尾，与正文「深度图配合内参反投影成点云、经去噪/降采样/平面提取得到桌面结构、RANSAC 是标配」一一对应。
- 数据来源与许可：PointCloudLibrary/data 仓库 `tutorials/table_scene_mug_stereo_textured.pcd`，真实 Kinect 采集的桌面 + 马克杯场景，许可 **BSD-3-Clause**。仓库主页 <https://github.com/PointCloudLibrary/data>；文件位于 `master` 分支 `tutorials/` 目录（blob sha `64ab201b9063d968e5fc093b30e96642a9fab024`）。文件经 GitHub API（contents + git blobs）下载，仅在会话临时目录中解压解析，未入库。
- 标注性质：图中的着色方案、色标、坐标轴示意、平面分类配色与全部文字标注均为**本书自制**；RANSAC 平面拟合与透视投影为本次自写脚本真实运行的结果，不是示意图。
- 再生成：生成脚本为本次会话使用的临时脚本（已清理）。逻辑为 curl 经 GitHub API 取回 base64 blob → 解码 PCD → 自写 LZF 解压 → numpy 解析并 RANSAC 拟合平面 → 自写透视投影着色渲染 → PIL 叠加中文标题、图例与页脚。若需调整视角或配色，按同样的流程重跑即可。

## 5.3 自制概念图（原创、无第三方许可问题）

**两张原创手绘 SVG**（2026-09-15 原创，自包含矢量图：无外链字体、无外部位图、无 emoji，深浅色主题下均可正常显示）。用于把 5.3 节的「关节空间 vs 笛卡尔空间」与「时间参数化」两个概念讲成图；正文图注只保留一句话说明，不含来源/作者/许可。整图带浅色底 panel（`#f8fafc` 底、`#cbd5e1` 描边），配色与 5.1 自制图一致（主文字 `#0f172a`、次文字 `#475569`、蓝 `#2563eb`、绿 `#16a34a`、橙红 `#ea580c`、灰 `#94a3b8`）。

当前位置：`chapters/05-brain-perception-planning-vla-wam/assets/images/`

### joint-vs-cartesian-space.svg（图 5.3-1）

- 内容：左格「笛卡尔空间规划」画起点到终点的直线（蓝实线，标「末端走直线：路径可控」）与关节空间插值出的末端大弧线（灰虚线，标「走什么路不可控」）；右格「肘朝上 / 肘朝下：两组解」用同一末端点（黑点）配两组二连杆构型（蓝实线 / 橙虚线），底部红框内以三个连续末端点 → 红叉 → 换色，标「相邻两帧跳到另一组解 → 关节猛跳（末端没动，只有关节角突变）」；顶部标题「同一个末端位置，可能有多组关节角」；
- 用途：放在 5.3「### 笛卡尔空间规划」小节末尾，回收开头现场问题里的「到末端附近开始高频抖动」（IK 解分支跳变）；
- viewBox：`0 0 720 420`。

### trapezoid-velocity-profile.svg（图 5.3-2）

- 内容：横轴时间、纵轴速度的梯形速度曲线（加速段 / 匀速段 / 减速段，蓝色实线，「匀速段」标在平台内部）；橙色虚线标 `v_max（速度上限）`，红色虚线标 `a_max` 并注明「加速段斜率 = 加速度上限」；另有一条更矮更长的灰色虚线曲线，标「力矩或接触约束收紧后 只能更慢、更久」；底部结论条「约束越多、越靠近执行器极限，轨迹能分配的时间就越长」；
- 用途：放在 5.3「## 时间参数化与速度约束」小节末尾，图解梯形速度剖面与速度 / 加速度（力矩）两类上限；
- viewBox：`0 0 720 360`。

## 5.5 LeRobot 数据集片段查看器（真实数据集片段 + 自绘曲线）

### site/public/lerobot-snippet/sprite.jpg + site/src/components/LeRobotDatasetViewer.astro

- 文件：`site/public/lerobot-snippet/sprite.jpg`（535,489 字节，5760×1350，JPEG quality 82，sha256 `555fa984c90c9168dd47c36287e7eff69fa5a1440b8ac37905cc887930aeaadf`）；配套来源说明 `site/public/lerobot-snippet/SOURCE.txt`；组件 `site/src/components/LeRobotDatasetViewer.astro`（40 帧的曲线数据直接内联在组件里，无独立数据文件）。
- 内容：sprite 为 8 列 × 5 行共 40 个单元，每单元 720×270，左半是 `observation.images.up` 俯视相机、右半是 `observation.images.side` 侧视相机；40 帧等间隔抽样自完整 episode 0（原始 303 帧 @ 30 fps），覆盖 SO-101 从臂从初始位姿、下探、合拢夹爪抓起粉色乐高积木、搬到透明盒子并放入的完整过程。组件把 40 帧做成可拖动的帧播放器（CSS 背景定位，不用 canvas、不引外部库），并用内联 SVG 画出 `observation.state` 与 `action` 的关节曲线（6 维中画 5 条代表维度，实线为实测、虚线为目标），时间轴游标与帧一一对齐。
- 用途：放在 5.5「### 数据采集」记录字段表之后，把「观测流、动作、时间戳、任务标注」等字段做成可交互实例；元数据卡列出数据集名、许可、episode 长度、fps、key/形状与 task 字符串。
- 数据来源与许可：Hugging Face 数据集 `lerobot/svla_so101_pickplace`（真实 SO-101 从臂遥操作演示），许可 **Apache-2.0**，revision `f641879e22172be7e8161d5e6c1503c2d2feb657`，数据集主页 <https://huggingface.co/datasets/lerobot/svla_so101_pickplace>。本次下载经由 `hf-mirror.com` 镜像（huggingface.co 在本次可达网络中不可达），只取 `meta/info.json`、`meta/tasks.parquet`、`data/chunk-000/file-000.parquet` 与两台相机的 `videos/.../file-000.mp4`，解析后仅保留 40 帧抽样。
- 数据处理：`meta/info.json` 给出 fps=30、total_episodes=50、total_frames=11939、robot_type=so100_follower；`data/chunk-000/file-000.parquet` 共 11939 行 7 列，取 `episode_index==0` 的 303 行；帧号与状态/动作直接来自该 parquet，时间戳来自其 `timestamp` 列。视频用 ffmpeg（libdav1d 解 AV1）顺序解码 episode 0 的全部帧，再用 PIL 缩放拼接成 sprite。
- 标注性质：sprite 中的画面是数据集原始相机帧，未经修改，仅缩放与左右拼接；曲线由原始 `observation.state`/`action` 数值绘制，不是示意值；组件中的文字、配色与图标为本书自制。
- 再生成：生成脚本为本次会话使用的临时脚本（已清理）。流程为 curl 取 parquet → pyarrow 读 episode 0 → 等间隔抽 40 个帧号 → ffmpeg 解码对应帧 → PIL 拼 sprite；若需换 episode 或帧窗，按同样流程重跑即可。

## 5.5 VR 遥操作 G1 动图（图 5.5-1）

- 文件：`chapters/05-brain-perception-planning-vla-wam/assets/images/g1-vr-teleoperation.gif`
- 内容：VR 遥操作下 G1 灵巧手完成操作任务的过程，双目相机视角（左俯视 / 右侧视），24 帧动图
- 来源：GalaxyGeneralRobotics/OpenWBT 仓库 `img/demo.webp`（<https://github.com/GalaxyGeneralRobotics/OpenWBT>）。该仓库实现用 Apple Vision Pro 对 Unitree G1/H1 做全身遥操作（README 原文可核对）
- 许可：**Apache-2.0**（仓库 LICENSE；`xr_teleoperate` 等仓库为 NOASSERTION，已排除）
- 处理：用 sharp 把 24 页动画 WebP 缩放至宽 640 并转 GIF（colours=160, effort=7）：640×360、24 帧、2.73 MB；未修改画面内容，仅缩放与转码。站点构建时 Astro 会再转成动画 WebP（实测 pages=24，动画保留）
- 用途：5.5「### 遥操作」小节末尾，配合正文讲「VR 手柄 / 头显驱动」这一类遥操作

## 5.7 WAM 系统概览图（图 5.7-1）

- 文件：`chapters/05-brain-perception-planning-vla-wam/assets/images/wam-lingbot-va-teaser.png`
- 内容：LingBot-VA 的系统概览——训练数据来源（互联网视频 / 机器人视频）、模型结构（语言模型 + 视频模型 + 动作模型）、未来想象与机器人动作两个出口、下方“预测未来 → 逆动力学 → 真机执行”链路，以及真机与仿真评测结果
- 来源：Robbyant/lingbot-va 仓库 `assets/teaser_v3.png`（<https://github.com/Robbyant/lingbot-va>，提交 `7c6ffa9bfc4b83582cafc860fab4c82cc7deeeeb`）
- 许可：**Apache-2.0**（仓库 LICENSE）
- 处理：**未做任何修改**，直接使用仓库原始 PNG（1860×1078，1.1 MB）
- 用途：5.7「WAM 与 VLA 的分工」小节末尾，用真实项目的系统图给读者一个“WAM 到底长什么样”的锚点



