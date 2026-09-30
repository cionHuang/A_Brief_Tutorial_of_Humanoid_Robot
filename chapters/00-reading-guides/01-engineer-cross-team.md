# 跨部门工程师阅读路线

这条路线给已经在机器人行业（或相邻行业）工作的工程师。你不需要通读全书——你只需要补上“对面部门”的语言。

建议先花 {{stat:minutes.section.1.3}} 分钟读 [1.3 从任务到电机：一台现代人形机器人如何运行](../01-system-overview/03-humanoid-robot-system-architecture.mdx)：它给出整张总图——六层功能链、各层频率、算法跑在哪、两个闭环，后面每一节都会回到这张图定位自己；然后对号入座：你这周要和谁开会、和谁联调，就按对应的表读。

正文的**退出提示**会写清已讲完的概念与可留待以后看的内容，按它注明的目标结束阅读即可；**跳读提示**只略过指定中段，须跳到链接处接着读。概念与工程细节有时穿插出现，不要把跳读当成本节结束。开头的场景用于提出工程问题；没有注明实测来源的叙述按教学设例阅读。

## 你要和机械同学协作

| 顺序 | 小节 | 为什么读 | 读法 |
| --- | --- | --- | --- |
| 1 | [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | 机械说“到限位了”“接近死点了”时，知道在说什么 | 全读 |
| 2 | [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | 减速比、回差、峰值力矩决定你能向电机要什么性能 | 全读 |
| 3 | [2.4 足部、接触与稳定性](../02-mechanics/04-foot-contact-and-stability.mdx) | 理解支撑多边形、摩擦锥对控制策略的约束 | 全读 |
| 4 | [2.2 结构设计、材料与刚柔性](../02-mechanics/02-links-structure-and-materials.mdx) | 结构改动会怎样影响质量、惯量和动力学参数 | 读完[「质量、质心与转动惯量」](../02-mechanics/02-links-structure-and-materials.mdx#质量质心与转动惯量)，包括 G1 参数例子；结构设计段按正文提示跳读 |
| 5 | [2.5 机器人描述文件](../02-mechanics/05-robot-description-files.mdx) | URDF/MJCF 是机械和软件交接的界面；格式差异与模型版本管理 | 读完[「两种格式怎么分工」](../02-mechanics/05-robot-description-files.mdx#两种格式怎么分工) |

## 你要和电气/嵌入式同学协作

| 顺序 | 小节 | 为什么读 | 读法 |
| --- | --- | --- | --- |
| 1 | [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | FOC、电流环、kp/kd 在驱动器里是怎么跑的 | 全读 |
| 2 | [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | CAN/EtherCAT/DDS 的带宽和延迟决定控制周期上限 | 全读 |
| 3 | [3.5 MCU、实时系统与嵌入式软件](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 为什么控制指令必须按固定周期下发，抖动意味着什么 | 全读 |
| 4 | [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | 峰值功率与持续功率的差距为什么会限制动作幅度 | 读到[「峰值功率与持续功率」末尾](../03-electrical-embedded/01-power-system.mdx#product-read-end) |
| 5 | [3.3 传感器与数据采集](../03-electrical-embedded/03-sensors-and-data-acquisition.mdx) | 编码器、IMU 的精度和时间同步如何影响状态估计 | 读完传感器类别，再按跳读提示读完[「标定」及后续同步、误差段](../03-electrical-embedded/03-sensors-and-data-acquisition.mdx#标定内参与外参) |
| 6 | [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | 过流、过温保护触发时，机器人为什么会“突然卸力” | 读完[「异常检测的共同规则」](../03-electrical-embedded/06-electrical-safety-and-protection.mdx#异常检测的共同规则)；状态机细节可以后再看 |

## 你要和算法同学协作

| 顺序 | 小节 | 为什么读 | 读法 |
| --- | --- | --- | --- |
| 1 | [4.1 机器人数学基础](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 坐标系和旋转表示是所有算法对话的通用语 | 全读 |
| 2 | [4.2 运动学](../04-cerebellum-realtime-control/02-kinematics.mdx) | IK 报“目标不可达”时，分清是几何问题还是代码问题 | 全读 |
| 3 | [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | “把 kp 调大”意味着什么，机器人会有什么表现 | 全读 |
| 4 | [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | ZMP、支撑多边形、全身控制的任务栈 | 读完[「约束不是附属品」](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx#约束不是附属品)，QP 公式按正文提示跳读 |
| 5 | [4.4 状态估计](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 为什么“机器人以为自己在哪里”和“实际在哪里”会不一样 | 读完[「浮动基座估计：姿态、速度和位置各有难点」](../04-cerebellum-realtime-control/04-state-estimation.mdx#浮动基座估计姿态速度和位置各有难点) |
| 6 | [4.3 动力学](../04-cerebellum-realtime-control/03-dynamics.mdx) | 质量、惯量参数的改动如何传导到关节力矩需求 | 读完[「质量矩阵、动量与能量的工程意义」](../04-cerebellum-realtime-control/03-dynamics.mdx#质量矩阵动量与能量的工程意义)；方程按正文提示跳读 |

## 你要和软件/AI 同学协作

| 顺序 | 小节 | 为什么读 | 读法 |
| --- | --- | --- | --- |
| 1 | [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.mdx) | 节点、Topic、TF 是软件层的通用语 | 全读 |
| 2 | [5.1 机器人学习与 AI 词汇](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.mdx) | 会上那些 AI 词分别指什么、在哪一层 | 全读 |
| 3 | [5.2 感知系统](../05-brain-perception-planning-vla-wam/02-perception-system.mdx) | 相机、深度数据如何进入坐标链 | 读完[「深度、点云与平面提取」](../05-brain-perception-planning-vla-wam/02-perception-system.mdx#深度点云与平面提取) |
| 4 | [5.6 VLA](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 大模型输出如何一步步变成关节动作 | 读到[动作粒度、频率与责任边界](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx#product-read-end) |
| 5 | [5.7 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx) | 世界动作模型与 VLA 的分工 | 读完[「WAM 与 VLA 的分工」](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx#wam-与-vla-的分工) |
| 6 | [6.2 MuJoCo](../06-software-tools-simulation/02-mujoco.mdx) | 接触模型与仿真执行器的约定如何影响验证 | 读完[「Sensor：带噪声和滤波的仿真传感器」](../06-software-tools-simulation/02-mujoco.mdx#sensor带噪声和滤波的仿真传感器) |
| 7 | [6.6 软件工程与版本管理](../06-software-tools-simulation/06-software-engineering-and-versioning.mdx) | 哪些东西需要版本化、怎么复现 | 全读 |

## 读完之后

当某个方向的协作变多，就把那一章补完；遇到具体术语，直接用页面顶部的搜索框查。这本书是工具，不是课本。
