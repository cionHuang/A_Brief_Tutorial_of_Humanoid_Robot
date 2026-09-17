# 产品 / PR 阅读路线

这条路线给需要听懂技术讨论、写宣传文案、但不写代码不调参的同学。目标不是学会技术，而是开会时能判断三件事：大家在讨论哪个词、这个词落在系统的哪一层、自己写出去的那句话会不会被工程师当场纠正。

**读法约定**：每一节只读三样东西——开头的现场问题（读到最后那句被引用的话）、术语定义（首次成文处带中英对照），以及紧跟其后的第一条“一句话听懂”。读到第一条“一句话听懂”就翻下一节，平均每节约 3 分钟；遇到不懂的词，用页面顶部的搜索框。

表中每行末尾引号里的句子，都是该节现场问题里的原句，可以在正文里搜到；标着“紧随其后”的词，定义在第一条“一句话听懂”之后几段，需要时再往下多读一点。

全书 33 节中有 21 节进了这条路线，合计约 1 小时 10 分钟。顺序与正文章节一致，可以顺着左侧边栏一路往下点；没进这条路线的小节不是不重要，只是对产品 / PR 岗位的单位收益更低，需要时再单独查。

## 第一步：建立整机概念（3 节，约 10 分钟）

*这一步解决“别人提起一个概念，你接不上话”的问题。*

| 小节 | 读到第一条“一句话听懂”，你将听懂 |
| --- | --- |
| [1.1 具身智能是什么](../01-system-overview/01-what-is-embodied-ai.mdx) | 判断一段演示是不是“具身智能”的三条标准（身体、闭环、从交互里长出来），遥控和脚本为什么都不算；“物理 AI”紧随其后 |
| [1.2 人形机器人：定义、构造与 G1](../01-system-overview/02-humanoid-robot-anatomy.mdx) | “像人”要像到什么程度（结构接近人体、能主动运动）；先数自由度；执行器、末端执行器紧随其后 |
| [1.3 人形机器人系统架构](../01-system-overview/03-humanoid-robot-system-architecture.mdx) | 机械、电气、算法、软件四张图怎么合成一张；分层之后“谁定目标、谁算轨迹、谁出力、谁兜底” |

## 第二步：机械与电气（7 节，约 25 分钟）

*这一步解决“硬件参数听不懂、转述时容易说错”的问题。*

| 小节 | 读到第一条“一句话听懂”，你将听懂 |
| --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | 零位、限位——“同一组指令在仿真和实机上就是两个动作”是怎么回事；死点紧随其后 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | 关节模组——“电机已经在用力，为什么关节还是推不动？”；减速比、回差、发热紧随其后 |
| [2.4 足部、接触与稳定性](../02-mechanics/04-foot-contact-and-stability.mdx) | 接触——“脚已经碰到地面，为什么还会滑？”；摩擦、支撑多边形紧随其后 |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | 母线、电压、电流与容量——“电池还有 50% 电，为什么机器人不能完成一个短动作？”；BMS 紧随其后 |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 伺服、舵机的区别——“控制器给的是角度，驱动器为什么还要处理电流？”；FOC、电流环紧随其后 |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 物理总线与软件中间件的分工——“CAN、EtherCAT 和 DDS 各自负责哪一段？”；丢帧、乱序、超时策略紧随其后 |
| [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | 保护是好几道防线，而不是一道闸——“急停按下后，应该只降扭矩，还是切断电源？”；急停、过流、过温紧随其后 |

## 第三步：小脑与大脑（8 节，约 25 分钟）

*这一步解决“‘大模型’‘端到端’‘它学会了’这些说法真假难辨”的问题。*

| 小节 | 读到第一条“一句话听懂”，你将听懂 |
| --- | --- |
| [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | 反馈控制、开环与闭环——“机器人已经碰到东西了，控制器为什么还在用力顶？”；kp、kd、前馈、柔顺紧随其后 |
| [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 支撑域、ZMP——“每个关节都控得好好的，为什么整机还是倒了？” |
| [5.1 机器人学习与 AI 词汇](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 模仿学习、强化学习，以及训练与推理的区别——“策略、模型、训练、推理、token、注意力、扩散、流匹配……这些词在机器人项目里到底指什么？”；策略紧随其后 |
| [5.2 感知系统](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 状态估计与感知的分工、坐标系——“相机明明看到了，为什么机器人抓不准？”；点云、深度相机紧随其后 |
| [5.4 双臂操作与灵巧手](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 接触的角色：行走时用来支撑自己，操作时用来改变世界——“碰到和抓住差在哪里？双手一起动的时候，左右臂谁听谁的？” |
| [5.5 学习控制](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 模型驱动与数据驱动的分工——“仿真里满分的策略，为什么一换环境就垮？”；模仿学习、遥操作、Sim2Real 紧随其后 |
| [5.6 VLA](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | VLA——“模型明明听懂了，为什么做错了？”；它给的是意图级动作，不是关节级闭环 |
| [5.7 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | WAM——“VLA 已经在输出动作了，为什么还要一个世界模型？” |

## 第四步：软件、仿真与可复现（3 节，约 10 分钟）

*这一步解决“哪句话能写进对外材料、哪句话只是内部说法”的问题。*

| 小节 | 读到第一条“一句话听懂”，你将听懂 |
| --- | --- |
| [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.md) | 模块之间的约定——“每个节点单独跑都对，为什么连起来就乱？”；ROS 2、节点、Topic 紧随其后 |
| [6.3 Isaac Sim 与 Isaac Lab](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | Isaac Sim 与 Isaac Lab 各管什么——“并行几千个环境到底图什么？”；并行环境、Sim2Sim 紧随其后 |
| [6.6 软件工程与版本管理](../06-software-tools-simulation/06-software-engineering-and-versioning.md) | 代码、模型、参数、固件、数据——“它上周还能走”这句话，怎么才能变成可以核查的事实？ |

## 写文案时的三个提醒

- 涉及 G1 的参数（自由度、控制频率、关节数）以本书引用的小节为准，每个数字都有官方来源可核对；
- “反应更灵敏”“站得更稳”这类描述背后都有具体机制（kp、kd、ZMP、温升降额），写之前回对应小节确认因果方向，别把效果写反；
- “能完成”和“能稳定完成”不是一回事：演示的成功率、地面条件、有没有人扶，以及“仿真里练会了”和“真机上能用”之间的差距（见 5.5、6.3），都不适合在文案里省略。
