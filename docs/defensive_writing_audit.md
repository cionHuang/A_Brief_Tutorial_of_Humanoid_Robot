# 全书防御性写作检查

检查日期：2026-10-17。以下检查记录保留为编辑前的快照，所列原句与行号对应当时版本。

## 本轮完成情况（2026-10-18）

已按报告完成全书正文、阅读路线、附录、动效配文与章末问答的优化：将适用条件融入解释，合并重复提醒，直接说明概念、因果和操作。更新了 23 个组件中的配文及 55 组问答，并同步问答引用依据与写作规范。

保留公式、章节结构、必要的技术约束和本轮开始时已有的修改。4.3 保留原有文案与动效，仅修复两处加粗标记的显示。

验证：站点构建、4,126 个站内链接与锚点、21 个产品阅读路线终点、58 项现有测试通过；75 条问答引用摘录均与对应正文一致。

## 判断与覆盖范围

全书存在反复追加否定、限制和纠错说明的写作习惯。阅读负担主要来自三个地方：解释已经完整，句尾又防止一次误解；正文、图注、总结和问答重复同一项提醒；先给出过大的结论，再用长串例外补救。

**建议统一改成：先把适用场景说清，再直接解释发生了什么、为什么、接下来怎样做。** 一条说明讲清之后，让读者继续往下读。

本轮检查覆盖 33 节正文、3 份阅读路线、4 份附录，并检索审阅首页、60 个 Astro 组件、15 个脚本文件、8 张 SVG 中的中文文本，以及章末问答的 79 组问题和答案。组件检查包括图注、按钮说明、播放阶段提示、状态文字和无障碍描述；60 个组件含存量组件，不能全部算作当前页面中的动效。重点候选句结合所在段落和引用关系复核。

这是源码配文审校，未逐一播放所有动效，也未对位图、视频中的嵌入文字逐帧识别。自动检索的命中含正常术语、程序提示和注释，不用命中数充当问题数量。以下优先级反映阅读影响，不是技术错误等级。

## 最值得优先处理的六处

| 位置 | 阅读问题 | 处理方向 |
| --- | --- | --- |
| [4.4：互补滤波演示说明](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/04-state-estimation.mdx:80) | 演示解释到一半，插入“不代表它总是优于卡尔曼滤波”，突然要求读者处理另一种算法的比较。 | 说明当前演示条件和观察结果；算法比较留在专门段落。 |
| [5.6：动作粒度的总结](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx:109) | “不等于控制多快，更不等于已经安全；……必须另行说明”把一句直觉写成责任声明。 | 直接分清动作粒度、更新频率和执行控制各自描述什么。 |
| [5.7：WAM 的边界](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx:110) | “预测得像不等于物理可行”在段落、总结、评价段和收尾反复出现。 | 集中讲一次预测误差与执行检查；其他位置讲作用、评价方法和例子的结果。 |
| [6.1：ROS 2 的介绍](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/01-ros2-software-architecture.mdx:49) | 一段同时塞入实时性、进程与节点、周期数字、SDK 和故障排查，后面又重复两轮。 | 先讲组件与通信；实时线程放部署段；节点组合放组合段。 |
| [4.2：IK 跳变动效图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1IKJumpDemo.astro:9) | 观察说明之后接连写“不代表……也不是……”，播放结束又重复正文的安全结论。 | 图注明示“预设风险动画”；阶段提示只说当前发生的事。 |
| [5.7：章末问答](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:450) | 答案直接以“能写，但要补两句边界”开头，显露出整本书的追加式写法。 | 直接给出准确、可用的一句话定义。 |

## 代表句的具体改法

以下为编辑提案。涉及工程条件的改写保留了原段落需要表达的条件；需要技术复核的强结论单列在后面。

### 1. 把补救式提醒改成有范围的陈述

[4.4 原句所在段落](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/04-state-estimation.mdx:80)：互补滤波演示说明中插入“**不代表它总是优于卡尔曼滤波**”。

建议：“在这组噪声与零偏设定下，互补滤波结合了陀螺仪的快速响应和加速度计提供的重力方向，抑制了长期漂移。”

[4.4 公式前的说明](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/04-state-estimation.mdx:65)：先声明单轴，再警告三维不能照套，解释万向节锁，最后把读者引向后文。

建议公式前只写：“以简化的单轴姿态为例，两种测量按下面的权重融合。”三维姿态的计算方式在后面的三维实现段集中说明。

### 2. 让总结真正帮助记忆

[5.6 原句](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx:109)：“VLA 可以把动作说到关节这一层，但‘目标多细’不等于‘控制多快’，更不等于‘已经安全’；执行闭环和独立保护由谁负责，必须另行说明。”

建议：“动作粒度说明目标给到哪一层，更新频率说明多久给一次；控制与保护模块负责把目标落实到执行。”

[2.2 疲劳总结](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/02-links-structure-and-materials.mdx:131)：“零件一次没坏，不代表反复用下去也不会坏。”

建议：“疲劳关心的是反复受力后能用多久，评估时要结合载荷变化和目标寿命。”

### 3. 去掉凭空引入的对立说法

[关节轴线代码图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/JointAxisSnippet.astro:62)：“轴线不是注释，而是正运动学、雅可比和限位判断都要读取的模型数据。”

建议：“正运动学、雅可比和限位判断都会读取这些轴线数据。”

[5.4 原句](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx:28)：“这个选择不是审美问题”。

建议：“选择取决于物体形状、抓取动作和控制成本。”

### 4. 把播放提示留给正在发生的事

[EtherCAT 动效提示](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/EthercatFrameDemo.astro:205)：“左肩先收到、先动作，右肘后收到、后动作。这里放大的时间差不代表真实总线速度。”

建议：“左肩先开始，右肘后开始，两侧手臂的动作出现时间差。”慢放说明保留在图注一次。

[IK 跳变动效结尾](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1IKJumpDemo.astro:53)：“手臂扫到旁边的假人：末端到位，不等于过程安全。”

建议：“④ 手到达目标，手肘在切换途中扫到旁边的假人。”正文负责解释为何检查整条路径。

### 5. 用来源说明替代免责句

[控制截止时间图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ControlDeadlineDemo.astro:52)：“时间已慢放，机械姿态定格。数值为教学示例，不代表 G1 实际延迟；只展示目标生成，不计传输时间。”

建议：“时间已慢放，机械姿态定格。本例采用教学时间参数，展示目标生成阶段的计算耗时。”

[IK 跳变图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1IKJumpDemo.astro:9)建议：“两组关节姿态由 G1 URDF 求得，手的目标内移 2 厘米、朝向不变。姿态切换与假人倒地采用预设动画，慢放展示手肘扫过的区域。”保留预设动画的性质，避免把倒地画面写成求解器验证结果。

[保护状态机图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/FaultStateMachineDemo.astro:51)建议：“使用 G1 URDF 外形演示一套教学保护流程：电机保持姿态，恢复检查通过后重新启动。流程与时序采用教学设定。”

### 6. 用评估动作替代保底话术

[5.5 数据闭环](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx:159)：“每一圈通常更接近真实工况——但它不保证单调改进……”

建议：“把真实运行中的失败样本加入训练，再用同一套评测比较新旧版本，决定是否部署。”

[5.7 问答](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:450)建议：“WAM 将动作与未来变化放进同一个预测问题，用来预演和比较候选动作。这一研究方向的术语仍在发展。”命名背景在正文与问答各自独立阅读时可简短保留。

## 逐节检查清单

“优先”表示应重组相关段落；“局部”表示压缩个别句子或重复说明；“保持”表示本轮未发现需要集中处理的防御性写法。每行链接定位一处代表位置，建议同时检查该节的总结和问答。

| 章节 | 优先级 | 发现与建议 |
| --- | --- | --- |
| [工程师阅读路线](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/00-reading-guides/01-engineer-cross-team.md:7) | 局部 | 已解释退出与跳读，又补“不要把跳读当结束”。直接写操作顺序；教学设例的识别规则集中说明一次。 |
| [学生阅读路线](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/00-reading-guides/02-student.md:27) | 局部 | “不是不重要”“不能直接进入下一节”等增加被纠正的感觉。改成先读什么、跳到哪里、何时补读。 |
| [产品 / PR 路线](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/00-reading-guides/03-product-pr.md:3) | 局部 | “会不会被工程师当场纠正”、未入选内容“不是不重要”等。改成阅读目标和选篇理由。 |
| [1.1 具身智能](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/01-system-overview/01-what-is-embodied-ai.mdx:64) | 局部 | Physical AI 与具身智能的概念差异在正文和总结重复。保留一次范围说明，总结提取共同问题。 |
| [1.2 一台人形机器人里面有什么：以 G1 为例](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/01-system-overview/02-humanoid-robot-anatomy.mdx:1) | 局部 | 正文防御性较轻；主要处理膝关节与 URDF 查看器的长图注。 |
| [1.3 系统架构](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/01-system-overview/03-humanoid-robot-system-architecture.mdx:64) | 局部 | “可共用硬件”后又说“并非一一对应”。保留正面解释即可。 |
| [2.1 机构与自由度](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/01-mechanisms-and-dof.mdx:217) | 局部 | 增加自由度后连写两项“不保证”；Link / Coupler 区分则有实际教学作用。说明姿势如何影响运动能力，保留术语辨析。 |
| [2.2 结构、材料与刚柔性](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/02-links-structure-and-materials.mdx:87) | 优先 | 弹性变形、刚度与强度、疲劳几处均为正文提醒一次、总结再提醒一次。按“卸载后能否恢复／变形有多大／何时损坏”分别直接定义。 |
| [2.3 传动与关节模组](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/03-transmission-and-joint-modules.mdx:76) | 局部 | “不是凭空增加能量”“减速器一定很大并不是普遍规律”等。直接讲功率关系与尺寸决定因素。 |
| [2.4 接触与稳定性](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/04-foot-contact-and-stability.mdx:75) | 局部 | “不能只盯这个圈”等总结追加条件。把静态、慢动作的适用场景写入判据介绍；普通地面接触只能推不能拉应保留。 |
| [2.5 机器人描述文件](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/02-mechanics/05-robot-description-files.mdx:85) | 局部 | `qpos/qvel` 长度与电机数的区别反复否定。直接列出浮动基座与关节各占多少维。 |
| [3.1 电源系统](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/01-power-system.mdx:43) | 局部 | 能量公式列完影响因素又补精确性提醒；SOC 总结重复功率限制。公式前写清估算条件，结论聚焦能量与功率各管什么。 |
| [3.2 电机与伺服](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/02-motors-drivers-servo-control.mdx:144) | 局部 | “不能只把增益调大”等结尾可压缩。`tau` 指令与 `tau_est` 估计的语义需要保留，改成正面定义。 |
| [3.3 传感器与采集](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/03-sensors-and-data-acquisition.mdx:27) | 局部 | 编码器零位、IMU 误差已有解释，末尾又提醒“不天然知道”“不能当真实姿态”。直接写测量与标定流程。 |
| [3.4 实时通信](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/04-real-time-communication-and-buses.mdx:117) | 局部 | 吞吐、可靠送达与及时性差异反复以“不等于”表达。按带宽、延迟、抖动、时效分开定义；过期数据的处理规则保留。 |
| [3.5 MCU 与实时软件](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/05-mcu-realtime-embedded-software.mdx:107) | 局部 | 实测最大耗时与 WCET 的区别是主题所需。压缩重复警示，明确测试覆盖和截止时间即可。 |
| [3.6 电气安全与保护](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/03-electrical-embedded/06-electrical-safety-and-protection.mdx:108) | 局部 | 多层保护、异常命令、复位流程是有效内容。压缩“不能单凭现象”及反复概括，保留真正决定动作的约束。 |
| [4.1 机器人数学](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx:216) | 局部 | 四元数正负同姿态后又补“不代表突然转身”；转环、坐标演示也补假想误解。直接写对应关系。 |
| [4.2 运动学](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/02-kinematics.mdx:161) | 优先 | “到达目标不等于过程安全”在正文、总结、动效三处重复；阻尼后又堆连续性、碰撞、限速的否定。集中讲求解输出与后续路径检查。 |
| [4.3 动力学](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/03-dynamics.mdx:1) | 保持 | 当前版本已较直接；两项动效图注用“固定哪些关节、参数从哪来、计算什么”说明范围，可作为后续样式参考。 |
| [4.4 状态估计](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/04-state-estimation.mdx:65) | 优先 | 单轴与三维说明前后重复；卡尔曼比较、可观性、G1 仿真参数与真机指标的提醒密集。重组为测量→融合→输出→适用条件。 |
| [4.5 基础控制](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/05-basic-control.mdx:138) | 局部 | “不是二选一”“不可能无限大”“不是藏起来……”等。用前馈与反馈的分工、增益与响应的关系直接讲清。 |
| [4.6 平衡与全身控制](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx:29) | 优先 | ZMP 的一句话总结塞入大量场景排除；锁腰含义重复纠错。先给经典平面接触条件，再讲判据；复杂接触另段介绍。 |
| [5.1 AI 词汇](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.mdx:15) | 局部 | 开头用很长一段划章节和“大脑／小脑”的边界；推理定义中途补在线学习例外。缩短导航，写成“常规部署推理……”即可。 |
| [5.2 感知系统](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/02-perception-system.mdx:7) | 局部 | 设想场景之后再补“不是实测报告”；教学图又补“不是推理输出”。直接标“教学场景／教学标注”；深度缺测含义保留。 |
| [5.3 运动规划](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/03-motion-planning.mdx:42) | 优先 | “不是为了图好看”“不是保守”等无助于解释；“完全不可控”属于结论过强，需要连同图内文字收准。 |
| [5.4 双臂与灵巧手](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx:90) | 局部 | “不是先进性问题”和“不是先走再抓”多次出现。直接写任务选型、腿腰臂手如何配合。 |
| [5.5 学习控制](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx:159) | 优先 | 数据闭环“更接近真实”后再补“不保证改进”；评测段反复批评单次演示。改成数据回采、训练、比较、部署的具体流程。 |
| [5.6 VLA](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx:107) | 优先 | 输出粒度、控制频率、安全责任混在警示串中；图注与总结重复“不是唯一方案”。采用本节示例架构一次讲明分工。 |
| [5.7 WAM](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx:110) | 优先 | “不是必备层”“预测像不等于可行”“不能绕过底层”重复密集。保留研究定位和一次接入说明，恢复预演与评价主线。 |
| [6.1 ROS 2](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/01-ros2-software-architecture.mdx:49) | 优先 | 定义段承担过多实时性纠错；同一说明在图后、跳读提示、部署段再次出现。按概念所在位置拆回对应小节。 |
| [6.2 MuJoCo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/02-mujoco.mdx:31) | 优先 | 先把工具定位成主要用于验证，再括号承认训练用途；仿真 PD 与真机参数提醒多次出现。明确“本教程选用的工作流”，参数迁移集中说明。 |
| [6.3 Isaac Sim / Lab](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx:59) | 局部 | 模型转换核对项正文和总结整串复读；“并行度不是白来的”重复。总结保留导入核对与吞吐观察两个核心动作。 |
| [6.4 Gazebo / RViz / Foxglove](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/04-gazebo-rviz2-foxglove.mdx:73) | 局部 | RViz 的用途后追加“显示对不等于动力学可行”。直接说显示订阅数据，物理仿真由仿真器完成。 |
| [6.5 工具库](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/05-kinematics-dynamics-libraries.mdx:96) | 局部 | 已列时间参数化、限幅检查，又补“不能默认直接执行”；“不能蒙混”语气偏训诫。用明确检查项收尾。 |
| [6.6 软件工程](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/06-software-engineering-and-versioning.mdx:72) | 局部 | 多种子评测与单次曲线的区别重复三次。保留评测单位和记录要求；版本审查等操作规则维持明确。 |
| [附录 A：术语表](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/07-appendix/01-terms.md:178) | 局部 | 个别通俗解释沿用“不是先走再抓”等对立句。释义直接给功能；不同字段、同名术语的区分保留。 |
| [附录 B：模型文件索引](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/07-appendix/02-model-index.md:1) | 保持 | 文件范围、来源、缺失场景引用都有具体用途，未见集中堆叠的防御性解释。 |
| [附录 C：关节索引](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/07-appendix/03-joint-index.md:102) | 局部 | 两张参数表都强调“不代表真机”。各表保留简短“URDF 模型值”来源标签，热限制解释放相关正文。 |
| [附录 D：消息接口](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/07-appendix/04-messages.md:3) | 局部 | 示例是否访问字段，连续写两次“不代表”。直接定义该列的统计范围，保留固件版本与单位约定。 |

## 动效与图中配文清单

动效的文字分工建议：**标题说明观察目标，播放提示说明当前变化，图注说明模型和数据来源。** 有限条件以具体设定呈现，例如“固定躯干、仅肘关节转动”。源码署名、许可和参数出处照常保留。

| 组件或图 | 问题 | 建议 |
| --- | --- | --- |
| [DofHingeDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/DofHingeDemo.astro:79) | 模型范围出处写两遍，最后再否定实测含义。 | 图注保留“膝关节范围取自 URDF 的 limit 字段；屈膝为正；腿长为示意”。方向说明紧贴对应画面。 |
| [G1UrdfViewer](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1UrdfViewer.astro:44) | 操作、源码定位、简化网格和真实性说明挤在同一长段。 | 操作提示分两句；来源写“官方 URDF 可视化网格，用于观察连杆与关节布局”。 |
| [ParallelAnkleDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ParallelAnkleDemo.astro:56) | 颜色读法、操控、数学含义、第三方来源和免责句混在一起。 | 保留第三方来源和个人装配参数身份；用图例解释颜色，将来源单列在末尾。 |
| [JointAxisSnippet](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/JointAxisSnippet.astro:62) | “轴线不是注释”没有必要的前文误解。 | 直接写轴线参与哪些计算。 |
| [InertialSnippet](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/InertialSnippet.astro:63) | “不要跨文件比较”接结构修改提醒，偏离当前字段教学。 | 保留两个模型质量不同的具体例子；比较前统一模型与参考系，维护要求放工程章节。 |
| [PowerTreeDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/PowerTreeDemo.astro:144) | 图注像第二段正文，最后又追加真实性否定。 | 观察说明只留当前现象，来源写“电压、电流、功率和阈值采用教学参数”。 |
| [ServoLoopCascadeDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ServoLoopCascadeDemo.astro:59) | 参数、角度约定和“不是所有驱动器”连在一起。 | “以三环级联为例；角度从下垂姿态起算；质量与电气参数采用教学值”。 |
| [FocTransformDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/FocTransformDemo.astro:93) | “固定电流时不能播放”是功能提示，语气可更有用。 | “已固定电流。拖动转子电角度，观察转矩变化。”保留按钮可用状态的正确逻辑。 |
| [MotorFieldSnippet](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/MotorFieldSnippet.astro:63) | 用否定句解释估计力矩、再叠其他字段核对。 | “tau_est 是估计力矩”；版本、单位与有效范围作为接口说明。 |
| [EthercatFrameDemo 图注](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/EthercatFrameDemo.astro:77) | G1 外形易被读成 G1 的真实总线，需要来源范围，但表达可简洁。 | “用 G1 外形演示一条假设的 EtherCAT 通信链；时间慢放，时间差放大。” |
| [EthercatFrameDemo 播放提示](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/EthercatFrameDemo.astro:205) | 观察动作差异时突然打断，强调并非真实速度。 | 提示只讲哪个关节先动，慢放说明放图注一次。 |
| [ControlDeadlineDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ControlDeadlineDemo.astro:52) | 同一句连用“不代表”“只展示”“不计”。 | 说明“教学时间参数、目标生成阶段”即可界定范围。 |
| [FaultStateMachineDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/FaultStateMachineDemo.astro:51) | 把教学流程写成一串免责说明。 | 明确是教学保护流程并说明保持姿态、恢复检查、再次启动的顺序。 |
| [G1CoordinateDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1CoordinateDemo.astro:43) | 先说目标标记，又否定“同时经过的路线”。 | 直接标注两种指令各自的目标；“整体位姿变换演示”说明画面内容。 |
| [GimbalLockDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/GimbalLockDemo.astro:15) | 解释转环与方块用途后，补“不代表机器人关节”。 | “转环表示欧拉角的三次旋转，方块显示合成姿态”。 |
| [VectorProductDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/VectorProductDemo.astro:48) | 为防误读，动态图注反复说不模拟什么。 | 用“定速条件下的力与功率”和“门轴处的力矩方向”定义当前实验。 |
| [G1IKJumpDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/G1IKJumpDemo.astro:9) | 图注两条否定，末帧再讲安全大原则。 | 明示预设动画性质；末帧描述手肘扫过假人。 |
| [ComplementaryFilterDemo](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ComplementaryFilterDemo.astro:152) | “调增益补不回来”“行为是真实的”把解释变成保证与反保证。 | “重力方向可校正 roll/pitch；yaw 的长期校正需要其他方向观测。本例采用教学噪声与零偏。” |
| [LowLevelCmdSnippet](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/LowLevelCmdSnippet.astro:77) | 已经是特定官方示例，结尾再说“不代表所有任务”。 | 标明示例周期、幅度和增益来源即可。 |
| [MjcfFieldSnippet：状态字段](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/MjcfFieldSnippet.astro:171) | 解释安装和仿真噪声后，补真机偏置、延迟、量程的排除串。 | 图注集中讲模型中能读到的量；真机标定留正文一次。 |
| [ActionRepresentationLadder](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/ActionRepresentationLadder.astro:85) | 图注末尾再次提醒“不是唯一方案”。 | “本图以较低频智能模块向较高频控制模块给目标的分工为例。” |
| [注意力指代 SVG](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/assets/images/ai-attention-coreference.svg:41) | “不是某个真实模型的注意力输出”。 | 标“教学示意：线宽表示设定的相关程度”；保持示意与实测身份清楚。 |
| [关节空间／笛卡尔空间 SVG](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/assets/images/joint-vs-cartesian-space.svg:21) | “走什么路不可控”过强，后文容易再补丁式解释。 | 与 5.3 一起核对，建议表述为“末端路径由关节运动共同决定”。 |

4.3 的两项演示，以及 4.2 奇异姿态演示的当前图注，已经能用具体设定表达范围，可作为其他动效的参考。长图注中的操作负担也值得单独优化，但本轮清单聚焦文案。

## 章末问答与公共模板

正文之外，`section-qa.json` 是后续改稿必须同步处理的一层。下列答案尤其明显：

| 位置 | 问题 | 处理方向 |
| --- | --- | --- |
| [2.2：更换外壳后的检查](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:74) | 从质量、惯量一路补到寿命、柔性和增益，答案变成例外清单。 | 按动力学模型、结构强度与疲劳两项分开回答，柔性按问题需要展开。 |
| [2.2：疲劳](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:80) | 答完疲劳后再次声明开场不是 G1 实测故障。 | 教学场景身份在开场标明，答案聚焦疲劳。 |
| [2.3：减速比](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:94) | “不是白来的”“不会凭空造能量”“力气有上限”接连出现。 | 直接给转速、力矩、效率关系。 |
| [3.3：IMU 姿态](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:188) | 说明积分误差之后又补“不能当没有偏差的真实姿态”。 | 解释误差如何累积、其他测量如何校正即可。 |
| [3.6：卸力原因](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:230) | 已列排查数据，末尾再否定仅凭外观判断。 | 用数据对照的顺序收尾。 |
| [4.6：ZMP](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:334) | 先用“动态版质心投影”简化，再补平面条件、多点接触、飞行相等大串修正。 | 开头直接交代经典平面接触场景；用该场景解释判据。 |
| [5.7：如何介绍 WAM](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:450) | “能写，但要补两句边界”。 | 给出可直接使用的准确介绍。 |
| [6.1：ROS 2 职责](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:464) | 一串否定后才说明组件与约定，且复制正文频率限制。 | 定义先行，以本教程架构说明分工。 |
| [6.2：PD 放哪里](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/data/section-qa.json:478) | 位置已经答清，结尾再次展开仿真与固件差异。 | 保留本模型的控制实现；参数迁移另设一句具体操作要求。 |

公共组件 [SectionQA](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/components/SectionQA.astro:39) 中，“这些问题都没把握？”先替读者判断学习情况，“答案只是一种说法，你自己的表述能自洽就够了”又把准确性要求说得太松。建议：“试着用自己的话说明这一节的输入、输出和上下游，再对照参考答案补齐关键关系。”

首页的 [关于简化与出处](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/site/src/content/docs/index.mdx:71) 适合保留全书层面的简短说明，例如：“本书以直觉、简化模型和工程例子解释核心关系。模型条件和参数来源随文标注，完整推导见各节参考资料。”各节据此写具体条件，减少泛泛的“不适用于所有情况”。

## 需要保留的表达

判断依据是这句话是否帮助读者理解机制或采取正确动作。以下内容有实际作用：

- **物理条件**：普通非黏附地面接触只能提供推力；接触力和摩擦的可行范围是模型的一部分。
- **操作约束**：急停复位后需要再次明确启动，过期命令和旧状态如何处理。它们决定系统行为，不能作为语气问题删去。
- **字段语义**：`tau` 是指令、`tau_est` 是估计值；URDF 参数来自模型文件。这些可以正面定义。
- **明确的图源身份**：第三方踝模型、教学参数、预设倒地动画与官方模型的来源区别。保持短而具体。
- **真实状态提示**：模型加载失败、目标不可达、恢复检查尚未完成等。最好同时告诉读者当前状态和下一步操作。
- **以概念辨析为主题的比较**：带宽与延迟、刚度与强度、一次演示与统计评测。必要的对照保留一次，后续总结提炼各自含义。

## 需要先收准结论的地方

以下是审校中发现的强表述，应在实际改稿时结合模型或官方资料复核。这里记录文字风险，不把未经复核的替代句当作新的技术结论。

1. [5.3 “末端路径完全不可控”](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/03-motion-planning.mdx:52)与对应 SVG：需要区分“没有直接指定末端路径”和“无法确定末端路径”。
2. [6.1 以固定频段定义 ROS 2 职责](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/01-ros2-software-architecture.mdx:49)：需要区分本教程采用的部署架构、普通执行器行为与技术本身的能力。正文多次从示例分工推到普遍排除，造成后续补充。
3. [6.2 将 MuJoCo 定位成主要验证而非训练](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/06-software-tools-simulation/02-mujoco.mdx:31)：可以明确为本教程的工具链选择，避免先把工具用途说窄，再用括号补回其他用途。
4. [5.6 “换场景就崩，说明学的是场景相关性，不是任务”](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx:151)：从一个失败现象直接推出学习机制，归因过满。可以先陈述“新场景下表现下降”，再列需要分析的变化因素。
5. [5.7 对底层控制的保证性描述](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/chapters/05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx:114)：需核对接入架构与验证条件。建议具体说明下游控制器检查哪些约束、如何处理执行偏差。

## 写作规范也需要同步调整

现有规范强调来源、模型条件和强结论限定，这些目标合理；执行时缺少“放在哪里、说几次”的规则，容易变成每段最后追加说明。

另有一处模板张力：[AUTHORING](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/docs/AUTHORING.md:39) 要求每个术语级 H3 都有“一句话听懂”，还要求删掉它会影响理解；[写作原则](/Users/cionhuang/Documents/A_Brief_Tutorial_of_Humanoid_Robot/docs/tutorial_writing_principles.md:111) 又限制同一节的同义压缩句。这可能促使总结为了显得有新内容，不断加入额外限制和例外。

建议后续将规范统一为：

1. **适用条件跟着结论走。** “在单轴模型中……”直接放进该句，不先下广义结论再补排除项。
2. **每段回答一个问题。** 问题已答完就结束；只有会影响理解或操作的条件才补充。
3. **总结只压缩已经讲过的关系。** 允许帮助记忆的少量复述，不为了增加信息而引入新警告。
4. **同一提醒在同一阅读段落中集中一次。** 独立可查阅的问答和附录可保留必要范围，但应简短自足。
5. **图注陈述演示设定。** 参数采用何种来源、哪些部分固定、动画如何生成，优先用肯定句写清。
6. **提示语给当前状态与下一步。** 播放阶段围绕画面变化，禁用状态说明恢复条件。
7. **先修正过大的结论。** 发现需要三条例外来兜住一句话时，先检查这句话是否说得太满。
8. **保留用户已经确认的表达。** 修改以问题句及其上下文为单位，避免整章覆盖式改写。

## 建议的修改顺序

先统一写作规则和公共问答提示，再按“正文 → 同节动效 → 总结 → 问答”成组修改。第一批处理 4.4、5.6、5.7、6.1；第二批处理 2.2、4.2、4.6、5.3、5.5、6.2；其余章节做局部压缩。4.3 保持现有表达，作为风格参照。

完成后检查页面配文与导读锚点、问答 evidence 字段和源文的一致性，再运行站点构建与内容校验。
