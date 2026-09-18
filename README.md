# 《“听懂”具身智能——以人形机器人为例》

> 每个抽象术语，在机器人身上都有具体的样子。
>
> *Embodied AI, Explained — Through a Humanoid Robot. Every buzzword, shown on a real humanoid.*

**📖 在线阅读：<https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/>**

---

## 这是一本什么书

机器人项目里，机械、嵌入式、算法、软件说的是四套语言，产品与 PR 还要把技术讲给外面的人听。这本书把它们翻译成同一套，并且让每个抽象术语都在一台真实的**宇树 G1 人形机器人**上找到对应：它是什么、解决什么问题、落在系统的哪一层、对上下游有什么约束。

- **33 节正文 + 3 篇阅读路线 + 4 页 G1 速查附录**；
- 每个术语都给**中英对照**（如“浮动基座（Floating Base）”），并在首次出现处用一条 **一句话听懂** 收束，全书 301 条；
- 所有 G1 参数、消息字段与模型行为都**标注来源**，可以逐个点开核对；
- 关键概念配**可操作的交互演示**：URDF 模型查看、ZMP 小车、PID 调参、摩擦锥、力封闭、Isaac Lab 训练配置等。

## 三种读法

| 你是 | 怎么读 | 大约需要 |
| --- | --- | --- |
| **跨部门工程师** | [按部门查词](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/00-reading-guides/01-engineer-cross-team/)：这周和谁开会、和谁联调，就补谁的语言 | 每次 15–30 分钟 |
| **在校学生** | [顺序通读](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/00-reading-guides/02-student/)：每节附预计时长与建议先读的顺序 | 8–10 小时 |
| **产品 / PR** | [速通 21 节](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/00-reading-guides/03-product-pr/)：读到每节第一条“一句话听懂”即可 | 约 1 小时 10 分钟 |

## 目录

**一、系统总览**（3 节）
- [1.1 我们到底在研究什么：具身智能与人形机器人](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/01-system-overview/01-what-is-embodied-ai/)
- [1.2 一台人形机器人里面有什么：以 G1 为例](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/01-system-overview/02-humanoid-robot-anatomy/)
- [1.3 从任务到电机：一台现代人形机器人如何运行](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/01-system-overview/03-humanoid-robot-system-architecture/)

**二、机械与本体**（5 节）
- [2.1 机构、关节与自由度](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/02-mechanics/01-mechanisms-and-dof/)
- [2.2 结构设计、材料与刚柔性：从承力路径到质量分布](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/02-mechanics/02-links-structure-and-materials/)
- [2.3 传动与关节模组](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/02-mechanics/03-transmission-and-joint-modules/)
- [2.4 足部、接触与稳定性](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/02-mechanics/04-foot-contact-and-stability/)
- [2.5 机器人描述文件：机械与软件之间的契约](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/02-mechanics/05-robot-description-files/)

**三、电气与嵌入式**（6 节）
- [3.1 电源系统](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/01-power-system/)
- [3.2 电机、驱动器与伺服控制](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/02-motors-drivers-servo-control/)
- [3.3 传感器与数据采集：测量、坐标、时间与误差](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/03-sensors-and-data-acquisition/)
- [3.4 实时通信与总线](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/04-real-time-communication-and-buses/)
- [3.5 MCU、实时系统与嵌入式软件：从平台选型到最坏执行时间](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/05-mcu-realtime-embedded-software/)
- [3.6 电气安全与系统保护](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/03-electrical-embedded/06-electrical-safety-and-protection/)

**四、小脑：模型、状态估计与实时运控**（6 节）
- [4.1 机器人数学基础](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/01-robot-mathematics-foundations/)
- [4.2 运动学](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/02-kinematics/)
- [4.3 动力学](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/03-dynamics/)
- [4.4 状态估计：从测量到状态](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/04-state-estimation/)
- [4.5 基础控制](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/05-basic-control/)
- [4.6 双足平衡与全身控制：判据与手段](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/04-cerebellum-realtime-control/06-balance-and-whole-body-control/)

**五、大脑：感知、规划、VLA 与 WAM**（7 节）
- [5.1 机器人学习与 AI 词汇](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms/)
- [5.2 感知系统](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/02-perception-system/)
- [5.3 运动规划：大脑与小脑之间的桥](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/03-motion-planning/)
- [5.4 双臂操作与灵巧手](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands/)
- [5.5 学习控制：模仿学习、强化学习与 Sim2Real](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning/)
- [5.6 VLA：视觉-语言-动作模型](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai/)
- [5.7 WAM：世界动作模型](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/05-brain-perception-planning-vla-wam/07-wam-world-action-model/)

**六、软件与工具链**（6 节）
- [6.1 ROS 2 与机器人软件架构](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/01-ros2-software-architecture/)
- [6.2 MuJoCo：接触仿真与 Sim2Sim 验证](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/02-mujoco/)
- [6.3 Isaac Sim 与 Isaac Lab：GPU 并行训练](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/03-isaac-sim-isaac-lab/)
- [6.4 Gazebo、RViz 2 与 Foxglove：仿真、看空间、看时间](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/04-gazebo-rviz2-foxglove/)
- [6.5 运动学与动力学工具库：什么时候该调用哪个](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/05-kinematics-dynamics-libraries/)
- [6.6 软件工程与版本管理：代码、模型、参数、固件、数据](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/06-software-tools-simulation/06-software-engineering-and-versioning/)

**附录**
- [附录 A 术语速查表](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/07-appendix/01-terms/)
- [附录 B G1 模型文件索引](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/07-appendix/02-model-index/)
- [附录 C G1 关节索引](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/07-appendix/03-joint-index/)
- [附录 D G1 消息接口](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/07-appendix/04-messages/)

## 每一节怎么读

每一节都从“现场问题”开始、以“参考资料”结束，中间是同一套顺序：

| 每一节里的块 | 你会看到什么 |
| --- | --- |
| 现场问题 | 一段真实场景，末尾是一句被引用的提问。每节开头的固定标题 |
| 术语名称（中英对照） | 本节的核心词，第一次出现就给英文原词 |
| 一句话听懂 | 紧跟术语的加粗结论句，用大白话说清它是什么 |
| 上下游影响 | 这一层怎么影响别的层，又被谁约束 |
| G1 落地 | 这些说法在宇树 G1 上的具体落点：模型、关节、消息或仿真现象 |
| 参考资料 | 编号来源，可以点开逐个核对。每节末尾的固定标题 |

所以：**赶时间**就只读现场问题、术语定义和紧跟其后的第一条“一句话听懂”；**要查词**直接搜术语名；**要核对数字**翻到节末。

## 关于 G1 与数据来源

全书用宇树 G1 作唯一贯穿案例，按内容切换模型变体（无手 `g1_29dof`、锁腰 `g1_29dof_lock_waist`、带手 `g1_29dof_with_hand`）。

- G1 模型文件：[robot_descriptions/g1/](./robot_descriptions/g1/)，来源、固定提交与许可见 [SOURCE.md](./robot_descriptions/g1/SOURCE.md)；
- 第三方代码与网格（含平行踝简化模型）：[third_party/](./third_party/)；
- 关节顺序、消息字段与模型变体差异：[附录 B/C/D](https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/07-appendix/02-model-index/)。

## 勘误与反馈

错别字、术语不一致、来源对不上，或者某一节没讲清楚——都欢迎提到 [Issues](https://github.com/cionHuang/A_Brief_Tutorial_of_Humanoid_Robot/issues)。**技术上说不清的地方尤其欢迎**，这本书的目标就是把它们讲清楚。

## 版权与使用

| 内容 | 许可 |
| --- | --- |
| 书稿文字、自制图表与配图 | [**CC BY-NC-SA 4.0**](./LICENSE)（署名—非商业性使用—相同方式共享）。转载或引用请注明出处并附本仓库（或在线阅读）链接；商业用途请先联系作者 |
| `site/` 站点代码、脚本与交互组件 | [**MIT**](./LICENSE-CODE) |
| 宇树 G1 模型文件 | BSD 3-Clause（Unitree 官方开源仓库），见 [`robot_descriptions/g1/SOURCE.md`](./robot_descriptions/g1/SOURCE.md) |
| 平行踝简化网格等第三方代码 | MIT，见 [`third_party/README.md`](./third_party/README.md) |
| 实拍照片 | Wikimedia Commons，CC BY-SA 3.0 / 4.0 或 CC0，逐张署名见各节参考资料与 [`docs/IMAGE_DESIGN_NOTES.md`](./docs/IMAGE_DESIGN_NOTES.md) |

## 参与编写 / 本地构建

| 目录 | 内容 |
| --- | --- |
| `chapters/` | 正文源文件（33 节 + 3 篇导读 + 4 页附录），改内容改这里 |
| `site/` | Astro + Starlight 站点；构建时由 `site/scripts/sync-content.mjs` 从 `chapters/` 同步生成页面（生成物不入库） |
| `robot_descriptions/`、`third_party/` | G1 模型与第三方资产及其来源记录 |
| `docs/` | [写作与配图规范](./docs/AUTHORING.md)、[站点技术路线](./docs/WEBSITE.md)、[图片素材台账](./docs/IMAGE_DESIGN_NOTES.md)、[命名讨论记录](./docs/NAMING.md) |

本地预览需要 Node 22：

```bash
cd site
npm ci
npm run dev      # 本地预览；改 chapters/ 会自动同步
npm run build    # 生成静态站点到 site/dist
```

站点由 GitHub Actions 发布（[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)）：**推送到 `main` 自动构建并发布**，也可以在 Actions 页手动运行。首次部署需要仓库 `Settings → Pages → Source` 选 **GitHub Actions**。
