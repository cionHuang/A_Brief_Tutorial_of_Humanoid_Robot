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

**三张通俗类比图**（2026-09-15 原创手绘 SVG，均为自包含矢量图：无外链字体、无外部位图、无 emoji，深浅色主题下均可正常显示）。用于把 5.1 节的抽象 AI 词汇讲成人话；正文图注只保留一句话说明，不含来源/作者/许可。整张图带浅色底 panel（`#f8fafc` 底、`#cbd5e1` 描边），主文字 `#0f172a`、次文字 `#475569`，配色蓝 `#2563eb`、绿 `#16a34a`、橙红 `#ea580c`、灰线 `#94a3b8`；站内 CSS `.sl-markdown-content img[src*="/ai-"]` 会把这些图放大到正文宽度（约 640 px），因此图内字号按放大后仍可读设计（主标签 24–28、次级 18–20、说明 16–18）。

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

### 已弃用：Dive into Deep Learning（D2L）图

原 5.1 节引用的 4 张 D2L 官方仓库图（`ai-rl-agent-environment.svg`、`ai-qkv-attention.svg`、`ai-multi-head-attention.svg`、`ai-transformer-arch.svg`，原图号 5.1-1 至 5.1-4，许可 CC BY-SA 4.0）已全部删除，5.1 正文的引用与参考资料 [10] 同步清理。弃用原因：图内标注过于专业、不够通俗，读者反馈不易看懂；现由上面三张原创类比图替代（并取消「多头注意力」「Transformer 完整架构」两张，正文保留一句「实际模型用多头注意力……」的说明即可）。

