# 在校学生阅读路线

这条路线给想系统了解人形机器人、找学习方向的同学。建议顺序通读，全书约 8 到 10 小时：先看下表中每节的预计时长与“建议先读”的顺序，再按节推进。时长按每分钟约 300 字的正文速度估算，另加看公式、配图和动手试交互演示的时间；按自己的节奏读即可。

全书是一条问题链：先认清整机（第 1 章），再往下拆成硬件（第 2–3 章），然后回答“这些量怎么算、身体怎么站住”（第 4 章）、“目标是谁给的”（第 5 章）、“怎么开发与验证”（第 6 章）。每章结尾都会把下一个问题交给下一章——所以卡住时，先看本节开头那句现场问题，它通常就是这一节要回答的东西。

读的过程中建议同步做两件事：把每节出现的术语（行业里也叫“黑话”）记成自己的词汇表；把 G1 的[开源模型](https://github.com/unitreerobotics/unitree_rl_gym)下载下来，边读边对照。

需要查词时用[附录 A 术语速查表](../07-appendix/01-terms.md)（中英对照 + 一句话解释）；G1 的模型文件、关节索引与消息字段分别在[附录 B](../07-appendix/02-model-index.md)、[附录 C](../07-appendix/03-joint-index.md)、[附录 D](../07-appendix/04-messages.md)。

## 先读什么、什么可以以后再看

同样的内容，对不同目的的人优先级不同。按“对建立整机认知的必要程度”分三档：

| 档位 | 内容 | 怎么用 |
| --- | --- | --- |
| **基础必备** | 1.1–1.3、2.1、3.1–3.3、4.1–4.6、5.1–5.3、6.1、6.6（18 节） | 顺序读完，这是理解一台整机的最小集合——它已经按依赖关系闭合：读 4.4 之前先有 4.1 的坐标系与 3.3 的传感器 |
| **现代常用** | 2.2–2.5、3.4–3.6、5.4–5.6、6.2–6.5（14 节） | 用到再读，或跟着下面各章的表格读 |
| **研究前沿** | 5.7（WAM） | 知道它在系统里扮演什么角色即可，不必现在读透 |

这张表说的是“哪些内容重要”，不是“按什么顺序读”——每节的前置依赖看后面各章表格里的“建议先读”一列。三档加起来覆盖全部 33 节；之所以把 3.3（传感器）和 4.1–4.3（坐标系、运动学、动力学）也放进基础必备，是因为状态估计与全身控制离不开它们：4.4 要先读 4.1，4.5／4.6 要先读 4.2／4.3，而 4.4 的输入来自 3.3。

节内同样有“可以晚点看”的部分——它们不是不重要，而是**不影响你理解主线**：

- **具体型号参数与字段**（G1 关节索引、SDK 字段、Topic 名称）：查手册时再看，[附录 B](../07-appendix/02-model-index.md)–[附录 D](../07-appendix/04-messages.md) 就是为这个准备的；
- **推导与公式细节**（万向节锁的矩阵推导、动力学方程各项、QP 标准型）：第一次读可以跳过，知道“它解决什么问题”就够；
- **库与工具的接口细节**（Pinocchio／Drake／MoveIt 2 的 API、Isaac Lab 的配置项）：等真要动手时再查。

判断标准只有一句：**如果跳过这一段，你还能说清“这一层在整机里干什么、输入输出是什么”，那它就可以晚点看。** 正文里标着“进阶”“可跳过”“工程细节”的小节，都按这条标准处理即可。

正文里还有一种提示框，样子是：

> **第一次阅读如果只是建立系统概念，到这里即可。** 你已经拿到……下面的……属于深入内容。

这句话标的是本节的**安全退出点**：看到它，说明这一节的第一层已经讲完，后面的推导、参数和接口细节可以留到第二遍。全书每一节都按三层组织——**第一层**是系统认知（现场问题 → 术语 → 一句话听懂 → 能力解锁），**第二层**是工程细节（型号、参数、现场经验），**第三层**是公式与实现（推导、标准型、API）。安全退出点只出现在公式最密、细节最碎的节里，它不是“别读了”，而是“现在停下，主线是完整的”。

## 第 1 章 系统总览（约 45 分钟）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [1.1 我们到底在研究什么：具身智能与人形机器人](../01-system-overview/01-what-is-embodied-ai.mdx) | 10 分钟 | 无 |
| [1.2 一台人形机器人里面有什么：以 G1 为例](../01-system-overview/02-humanoid-robot-anatomy.mdx) | 15 分钟 | 1.1 |
| [1.3 从任务到电机：一台现代人形机器人如何运行](../01-system-overview/03-humanoid-robot-system-architecture.mdx) | 20 分钟 | 1.2 |

## 第 2 章 机械与本体（约 1 小时 30 分钟）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | 30 分钟 | 1.2 |
| [2.2 结构设计、材料与刚柔性](../02-mechanics/02-links-structure-and-materials.mdx) | 15 分钟 | 2.1 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | 25 分钟 | 2.1 |
| [2.4 足部、接触与稳定性](../02-mechanics/04-foot-contact-and-stability.mdx) | 10 分钟 | 2.1 |
| [2.5 机器人描述文件](../02-mechanics/05-robot-description-files.mdx) | 10 分钟 | 2.1 |

## 第 3 章 电气与嵌入式（约 1 小时 35 分钟）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | 15 分钟 | 无（个别词会指向 3.5/3.6，可先跳过） |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 25 分钟 | 2.3 |
| [3.3 传感器与数据采集](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 15 分钟 | 无（个别术语会指向 4.1/4.3/4.4，可先跳过） |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 15 分钟 | 无 |
| [3.5 MCU、实时系统与嵌入式软件](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 15 分钟 | 3.4 |
| [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | 10 分钟 | 3.1、3.2 |

## 第 4 章 小脑：模型、状态估计与实时运控（约 2 小时 40 分钟，全书核心）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [4.1 机器人数学基础](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 50 分钟 | 线性代数基础 |
| [4.2 运动学](../04-cerebellum-realtime-control/02-kinematics.mdx) | 25 分钟 | 4.1 |
| [4.3 动力学](../04-cerebellum-realtime-control/03-dynamics.mdx) | 20 分钟 | 2.2、4.2 |
| [4.4 状态估计](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 25 分钟 | 3.3、4.1 |
| [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | 20 分钟 | 4.2 |
| [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 20 分钟 | 2.4、4.3、4.5 |

## 第 5 章 大脑：感知、规划、VLA 与 WAM（约 2 小时 5 分钟）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [5.1 机器人学习与 AI 词汇](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 20 分钟 | 无 |
| [5.2 感知系统](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 12 分钟 | 3.3、4.1 |
| [5.3 运动规划：大脑与小脑之间的桥](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 20 分钟 | 4.2、4.6 |
| [5.4 双臂操作与灵巧手](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 12 分钟 | 4.2、5.3 |
| [5.5 学习控制](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 22 分钟 | 4.5 |
| [5.6 VLA](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 22 分钟 | 5.2、5.5 |
| [5.7 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | 16 分钟 | 5.6 |

## 第 6 章 软件与工具链（约 1 小时 5 分钟）

| 小节 | 预计时间 | 建议先读 |
| --- | --- | --- |
| [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.md) | 10 分钟 | 1.2（个别词会指向 3.4/4.4/4.5/4.6/5.3/3.6，可先跳过） |
| [6.2 MuJoCo](../06-software-tools-simulation/02-mujoco.mdx) | 15 分钟 | 2.5、4.3 |
| [6.3 Isaac Sim 与 Isaac Lab](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | 15 分钟 | 6.2 |
| [6.4 Gazebo、RViz 2 与 Foxglove](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | 5 分钟 | 6.1 |
| [6.5 运动学与动力学工具库](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 15 分钟 | 4.2、4.3（个别词会指向 2.1/3.3/4.4/4.6/5.3/6.1/6.2，可先跳过） |
| [6.6 软件工程与版本管理](../06-software-tools-simulation/06-software-engineering-and-versioning.md) | 5 分钟 | 6.1、6.4 |

## 读完之后往哪走

- 想做结构/硬件：从 2.3 的关节模组和 3.2 的驱动器往深挖，结合 G1 的 STL 和 URDF 研究真实设计取舍；
- 想做控制/算法：从 4.6 全身控制和 5.5 模仿学习切入，跑通 `unitree_rl_gym` 的官方示例；
- 想做 AI/VLA/WAM：从 5.6 和 5.7 出发，继续读 OpenVLA、LeRobot 和 WAM 论文的官方资料。
