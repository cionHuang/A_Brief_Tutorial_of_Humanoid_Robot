# 产品 / PR 阅读路线

这条路线给需要听懂技术讨论、写宣传文案、但不写代码不调参的同学。目标不是学会技术，而是开会时知道大家在讨论什么、这个词会影响什么。

**读法约定**：下面每一节，只读开头的"现场问题"、黑话定义和配图，前两屏即可。全书精选 17 节，总计约 1 小时。遇到不懂的词，直接用页面顶部的搜索框。

## 第一步：建立整机概念（约 20 分钟）

| 小节 | 你将听懂 |
| --- | --- |
| [1.1 具身智能是什么](../01-system-overview/01-what-is-embodied-ai.mdx) | "具身智能"和人形机器人的关系；DoF、执行器、浮动基座 |
| [1.2 人形机器人：定义、构造与 G1](../01-system-overview/02-humanoid-robot-anatomy.mdx) | 人形机器人的定义；DoF、执行器、浮动基座、末端执行器 |
| [1.3 人形机器人系统架构](../01-system-overview/03-humanoid-robot-system-architecture.mdx) | 系统分哪几层；控制频率、LowCmd/LowState 是什么 |

## 第二步：机械与电气高频词（约 20 分钟）

| 小节 | 你将听懂 |
| --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | 自由度、限位、死点/奇异——"机器人卡住了"的常见原因 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | 谐波/行星减速器、峰值扭矩——关节性能宣传的关键参数 |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | 电池包、BMS、续航与峰值功率 |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | FOC、伺服——为什么机器人动作可以又稳又准 |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | EtherCAT、DDS——"全身 29 个关节如何同步" |

## 第三步：小脑、大脑与软件高频词（约 20 分钟）

| 小节 | 你将听懂 |
| --- | --- |
| [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | PID、kp/kd——"把 kp 调大"意味着机器人反应更灵敏 |
| [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | ZMP、平衡控制——"机器人为什么推不倒" |
| [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.md) | ROS 2、节点、Topic——软件团队口中的高频框架 |
| [5.1 机器人学习与 AI 词汇](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 策略、训练、推理、Transformer——和 AI 团队对话的入场券 |
| [5.2 感知系统](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 相机、深度、SLAM——机器人怎么"看见" |
| [5.4 双臂操作与灵巧手](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.md) | 抓取、灵巧手——"机器人会干活"具体指什么 |
| [5.6 VLA 与高级 AI 推理模型](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.md) | VLA——"大模型装进机器人"的真实含义 |
| [5.7 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | WAM——"预测动作后果"和"直接输出动作"有什么区别 |

## 第四步：理解工程现实（约 10 分钟）

| 小节 | 你将听懂 |
| --- | --- |
| [6.6 从仿真到真实系统](../06-software-tools-simulation/06-sim-to-real.md) | Sim2Real——为什么演示视频和真实表现有差距 |
| [7.3 机器人安全](../07-engineering-practice-safety/03-robot-safety.md) | 急停、降额、安全等级——产品宣传中不能乱说的部分 |

## 写文案时的两个提醒

- 涉及 G1 的参数（自由度、控制频率、关节数）以本书引用的小节为准，每个数字都有官方来源可核对；
- "反应更灵敏""站得更稳"这类描述背后都有具体机制（kp、ZMP、降额），写之前回对应小节确认因果方向，别把效果写反。
