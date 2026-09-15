# 在校学生阅读路线

这条路线给想系统了解人形机器人、找学习方向的同学。建议顺序通读，全书约 8 到 10 小时。每章先看小结表格，再按节推进。

读的过程中建议同步做两件事：把每节出现的黑话记成自己的词汇表；把 G1 的[开源模型](https://github.com/unitreerobotics/unitree_rl_gym)下载下来，边读边对照。

## 第 1 章 系统总览（约 45 分钟）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [1.1 具身智能是什么](../01-system-overview/01-what-is-embodied-ai.mdx) | 10 分钟 | 无 |
| [1.2 人形机器人：定义、构造与 G1](../01-system-overview/02-humanoid-robot-anatomy.mdx) | 15 分钟 | 1.1 |
| [1.3 人形机器人系统架构](../01-system-overview/03-humanoid-robot-system-architecture.mdx) | 20 分钟 | 1.1、1.2 |

## 第 2 章 机械（约 1.5 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | 20 分钟 | 1.2 |
| [2.2 结构设计、材料与刚柔性](../02-mechanics/02-links-structure-and-materials.mdx) | 15 分钟 | 2.1 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | 20 分钟 | 2.1 |
| [2.4 足部、接触与稳定性](../02-mechanics/04-foot-contact-and-stability.mdx) | 15 分钟 | 2.1 |
| [2.5 机器人描述文件](../02-mechanics/05-robot-description-files.mdx) | 20 分钟 | 2.1 |

## 第 3 章 电气与嵌入式（约 1.5 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | 15 分钟 | 无（个别词会指向 3.5/3.6，可先跳过） |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 20 分钟 | 2.3 |
| [3.3 传感器与数据采集](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 15 分钟 | 无（个别术语会指向 4.1/4.3/4.4，可先跳过） |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 15 分钟 | 无 |
| [3.5 MCU、实时系统与嵌入式软件](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 15 分钟 | 3.4 |
| [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | 10 分钟 | 3.1、3.2 |

## 第 4 章 小脑：模型、状态估计与实时运控（约 2 小时，全书核心）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [4.1 机器人数学基础](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 25 分钟 | 线性代数基础 |
| [4.2 运动学](../04-cerebellum-realtime-control/02-kinematics.mdx) | 20 分钟 | 4.1 |
| [4.3 动力学](../04-cerebellum-realtime-control/03-dynamics.mdx) | 20 分钟 | 4.2 |
| [4.4 状态估计](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 20 分钟 | 3.3、4.1 |
| [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | 20 分钟 | 4.2 |
| [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 20 分钟 | 2.4、4.3、4.5 |

## 第 5 章 大脑：感知、规划、VLA 与 WAM（约 1 小时 45 分钟）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [5.1 感知系统](../05-brain-perception-planning-vla-wam/01-perception-system.md) | 15 分钟 | 3.3、4.1 |
| [5.2 运动规划：大脑与小脑之间的桥](../05-brain-perception-planning-vla-wam/02-motion-planning.md) | 15 分钟 | 4.2、4.6 |
| [5.3 双臂操作与灵巧手](../05-brain-perception-planning-vla-wam/03-dual-arm-manipulation-and-dexterous-hands.md) | 15 分钟 | 4.2、5.2 |
| [5.4 学习控制与模仿学习](../05-brain-perception-planning-vla-wam/04-learning-control-and-imitation-learning.md) | 15 分钟 | 4.5 |
| [5.5 VLA 与高级 AI 推理模型](../05-brain-perception-planning-vla-wam/05-vla-and-advanced-ai.md) | 15 分钟 | 5.1、5.4 |
| [5.6 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/06-wam-world-action-model.md) | 15 分钟 | 5.5 |
| [5.7 从 VLA/WAM 到 G1 控制接口](../05-brain-perception-planning-vla-wam/07-vla-wam-to-g1-control-interface.md) | 15 分钟 | 4.6、5.6 |

## 第 6 章 软件与工具链（约 1.5 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.md) | 20 分钟 | 1.2 |
| [6.2 MuJoCo](../06-software-tools-simulation/02-mujoco.md) | 15 分钟 | 2.5、4.3 |
| [6.3 Isaac Sim 与 Isaac Lab](../06-software-tools-simulation/03-isaac-sim-isaac-lab.md) | 15 分钟 | 6.2 |
| [6.4 Gazebo、RViz 2 与 Foxglove](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | 10 分钟 | 6.1 |
| [6.5 运动学与动力学工具库](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 10 分钟 | 4.2、4.3 |
| [6.6 从仿真到真实系统](../06-software-tools-simulation/06-sim-to-real.md) | 15 分钟 | 6.2 |

## 第 7 章 工程实践与安全（约 45 分钟）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [7.1 软件工程与版本管理](../07-engineering-practice-safety/01-software-engineering-and-versioning.md) | 15 分钟 | 无 |
| [7.2 调试、测试与故障排查](../07-engineering-practice-safety/02-debugging-testing-troubleshooting.md) | 15 分钟 | 第 3、4 章 |
| [7.3 机器人安全](../07-engineering-practice-safety/03-robot-safety.md) | 15 分钟 | 3.6 |

## 读完之后往哪走

- 想做结构/硬件：从 2.3 的关节模组和 3.2 的驱动器往深挖，结合 G1 的 STL 和 URDF 研究真实设计取舍；
- 想做控制/算法：从 4.6 全身控制和 5.4 模仿学习切入，跑通 `unitree_rl_gym` 的官方示例；
- 想做 AI/VLA/WAM：从 5.5 和 5.6 出发，继续读 OpenVLA、LeRobot 和 WAM 论文的官方资料。
