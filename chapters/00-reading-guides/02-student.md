# 在校学生阅读路线

这条路线给想系统了解人形机器人、找学习方向的同学。建议顺序通读，全书约 8 到 10 小时。每章先看小结表格，再按节推进。

读的过程中建议同步做两件事：把每节出现的黑话记成自己的词汇表；把 G1 的[开源模型](https://github.com/unitreerobotics/unitree_rl_gym)下载下来，边读边对照。

## 第 1 章 系统总览（约 45 分钟）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [1.1 具身智能是什么](../01-system-overview/01-what-is-embodied-ai.mdx) | 10 分钟 | 无 |
| [1.2 人形机器人：定义、构造与 G1](../01-system-overview/02-humanoid-robot-anatomy.md) | 15 分钟 | 1.1 |
| [1.3 人形机器人系统架构](../01-system-overview/03-humanoid-robot-system-architecture.md) | 20 分钟 | 1.1、1.2 |

## 第 2 章 机械（约 1.5 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.md) | 20 分钟 | 无 |
| [2.2 结构设计、材料与刚柔性](../02-mechanics/02-links-structure-and-materials.md) | 15 分钟 | 无 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.md) | 20 分钟 | 2.1 |
| [2.4 足部、接触与稳定性](../02-mechanics/04-foot-contact-and-stability.md) | 15 分钟 | 2.1 |
| [2.5 机器人描述文件](../02-mechanics/05-robot-description-files.md) | 20 分钟 | 2.1 |

## 第 3 章 电气与嵌入式（约 1.5 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.md) | 15 分钟 | 无 |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.md) | 20 分钟 | 2.3 |
| [3.3 传感器与数据采集](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 15 分钟 | 无 |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.md) | 15 分钟 | 无 |
| [3.5 MCU、实时系统与嵌入式软件](../03-electrical-embedded/05-mcu-realtime-embedded-software.md) | 15 分钟 | 3.4 |
| [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.md) | 10 分钟 | 3.1、3.2 |

## 第 4 章 算法与软件（约 2.5 小时，全书核心）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [4.1 机器人数学基础](../04-algorithms-software/01-robot-mathematics-foundations.md) | 25 分钟 | 线性代数基础 |
| [4.2 运动学](../04-algorithms-software/02-kinematics.md) | 20 分钟 | 4.1 |
| [4.3 动力学](../04-algorithms-software/03-dynamics.md) | 20 分钟 | 4.2 |
| [4.4 状态估计](../04-algorithms-software/04-state-estimation.md) | 20 分钟 | 3.3、4.1 |
| [4.5 基础控制](../04-algorithms-software/05-basic-control.md) | 20 分钟 | 4.2 |
| [4.6 双足平衡与全身控制](../04-algorithms-software/06-balance-and-whole-body-control.md) | 20 分钟 | 2.4、4.3、4.5 |
| [4.7 运动规划](../04-algorithms-software/07-motion-planning.md) | 15 分钟 | 4.2 |
| [4.8 ROS 2 与机器人软件架构](../04-algorithms-software/08-ros2-software-architecture.md) | 20 分钟 | 1.2 |

## 第 5 章 感知、Manipulation 与 VLA（约 1 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [5.1 感知系统](../05-perception-manipulation-vla/01-perception-system.md) | 15 分钟 | 3.3、4.1 |
| [5.2 双臂操作与灵巧手](../05-perception-manipulation-vla/02-dual-arm-manipulation-and-dexterous-hands.md) | 15 分钟 | 4.2 |
| [5.3 学习控制与模仿学习](../05-perception-manipulation-vla/03-learning-control-and-imitation-learning.md) | 15 分钟 | 4.5 |
| [5.4 VLA 与高级 AI 推理模型](../05-perception-manipulation-vla/04-vla-and-advanced-ai.md) | 15 分钟 | 5.1、5.3 |

## 第 6 章 仿真、工具与系统集成（约 1 小时）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [6.1 MuJoCo](../06-simulation-tools-integration/01-mujoco.md) | 15 分钟 | 2.5、4.3 |
| [6.2 Isaac Sim 与 Isaac Lab](../06-simulation-tools-integration/02-isaac-sim-isaac-lab.md) | 15 分钟 | 6.1 |
| [6.3 Gazebo、RViz 2 与 Foxglove](../06-simulation-tools-integration/03-gazebo-rviz2-foxglove.md) | 10 分钟 | 4.8 |
| [6.4 运动学与动力学工具库](../06-simulation-tools-integration/04-kinematics-dynamics-libraries.md) | 10 分钟 | 4.2、4.3 |
| [6.5 从仿真到真实系统](../06-simulation-tools-integration/05-sim-to-real.md) | 15 分钟 | 6.1 |

## 第 7 章 工程实践与安全（约 45 分钟）

| 小节 | 预计时间 | 前置知识 |
| --- | --- | --- |
| [7.1 软件工程与版本管理](../07-engineering-practice-safety/01-software-engineering-and-versioning.md) | 15 分钟 | 无 |
| [7.2 调试、测试与故障排查](../07-engineering-practice-safety/02-debugging-testing-troubleshooting.md) | 15 分钟 | 第 3、4 章 |
| [7.3 机器人安全](../07-engineering-practice-safety/03-robot-safety.md) | 15 分钟 | 3.6 |

## 读完之后往哪走

- 想做结构/硬件：从 2.3 的关节模组和 3.2 的驱动器往深挖，结合 G1 的 STL 和 URDF 研究真实设计取舍；
- 想做控制/算法：从 4.6 全身控制和 5.3 模仿学习切入，跑通 `unitree_rl_gym` 的官方示例；
- 想做 AI/VLA：从 5.4 出发，继续读 OpenVLA 和 LeRobot 的官方文档。
