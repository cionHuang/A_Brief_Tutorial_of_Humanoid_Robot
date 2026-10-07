# 产品 / PR 阅读路线

这条路线给需要听懂技术讨论、写宣传文案、但不写代码不调参的同学。目标不是学会技术，而是开会时能判断三件事：大家在讨论哪个词、这个词落在系统的哪一层、自己写出去的那句话会不会被工程师当场纠正。

**读法约定**：先读开头的现场问题，再顺着正文读到表中指定的终点。多数节只需开头几段；零位、频率、部署位置等内容靠后，不能一律停在第一条“一句话听懂”。“必读终点”链接定位到所需段落的末尾，读完该段即可进入下一节。正文的跳读提示只略过指定中段，跳过去后还要接着读；“到这里即可”的退出提示则按它注明的目标使用。

时长按每节从开头到指定终点的汉字数、每分钟约 {{stat:reading.baseline}} 字估算，不扣除可跳读段落，也不包含操作交互演示与查资料的时间。最长必读段是 {{stat:routes.product.maxReadSection}} 节，约 {{stat:routes.product.maxReadHan}} 汉字、{{stat:routes.product.maxReadMinutes}} 分钟；平均每节 {{stat:routes.product.perSectionText}}。遇到不懂的词，用页面顶部的搜索框。

开头的场景用于提出工程问题；没有注明实测来源的叙述按教学设例阅读，不当作某次 G1 测试的记录。

全书 {{stat:sections.total}} 节中有 {{stat:routes.product.sections}} 节进了这条路线，合计{{stat:routes.product.timeText}}。顺序与正文章节一致，可以顺着左侧边栏一路往下点；没进这条路线的小节不是不重要，只是对产品 / PR 岗位的单位收益更低，需要时再单独查。

## 第一步：建立整机概念（{{stat:routes.product.step1.sections}} 节，{{stat:routes.product.step1.timeText}}）

*这一步解决“别人提起一个概念，你接不上话”的问题。*

| 小节 | 必读终点（读完这一段） | 你将听懂 |
| --- | --- | --- |
| [1.1 我们到底在研究什么：具身智能与人形机器人](../01-system-overview/01-what-is-embodied-ai.mdx) | [「什么是具身智能」的一句话听懂](../01-system-overview/01-what-is-embodied-ai.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 遥控、脚本与自主的差别；具身智能要求身体与自主运行的闭环。 |
| [1.2 一台人形机器人里面有什么：以 G1 为例](../01-system-overview/02-humanoid-robot-anatomy.mdx) | [「本体与关节」的第一条一句话听懂](../01-system-overview/02-humanoid-robot-anatomy.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 连杆、关节与自由度；人形机器人身体的四个区域。 |
| [1.3 从任务到电机：一台现代人形机器人如何运行](../01-system-overview/03-humanoid-robot-system-architecture.mdx) | [「各层共用的基础设施」末段](../01-system-overview/03-humanoid-robot-system-architecture.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 六层功能链、各层频率与典型部署位置；高频控制不会等低频推理。 |

## 第二步：机械与电气（{{stat:routes.product.step2.sections}} 节，{{stat:routes.product.step2.timeText}}）

*这一步解决“硬件参数听不懂、转述时容易说错”的问题。*

| 小节 | 必读终点（读完这一段） | 你将听懂 |
| --- | --- | --- |
| [2.1 机构、关节与自由度](../02-mechanics/01-mechanisms-and-dof.mdx) | [「零位与限位」的一句话听懂](../02-mechanics/01-mechanisms-and-dof.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 零位、限位与关节轴线为什么必须和实物对齐；同一组指令为何可能变成两个动作。 |
| [2.3 传动与关节模组](../02-mechanics/03-transmission-and-joint-modules.mdx) | [「传动比」的一句话听懂](../02-mechanics/03-transmission-and-joint-modules.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 关节模组包括什么；电机侧与关节侧力矩的区别，减速怎样交换速度与力矩。 |
| [2.4 接触与稳定性](../02-mechanics/04-foot-contact-and-stability.mdx) | [「支撑多边形」的一句话听懂](../02-mechanics/04-foot-contact-and-stability.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 接触力、摩擦锥与支撑多边形；脚碰到地面不等于不会滑，重心在圈内也不保证动态稳定。 |
| [3.1 电源系统](../03-electrical-embedded/01-power-system.mdx) | [「峰值功率与持续功率」的一句话听懂](../03-electrical-embedded/01-power-system.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 电压、电流、容量、能量与功率的区别；剩余电量不等于动作瞬间供得上电。 |
| [3.2 电机、驱动器与伺服控制](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | [「电机把电流变成力矩」末尾](../03-electrical-embedded/02-motors-drivers-servo-control.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 电机、驱动器与伺服系统各做什么；电流怎样产生轴转矩，伺服与舵机各指什么。 |
| [3.4 实时通信与总线](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | [「带宽够，为什么还会迟到？」的一句话听懂](../03-electrical-embedded/04-real-time-communication-and-buses.mdx#product-read-end) <!-- product-read-end: product-read-end --> | CAN、EtherCAT 与 DDS 各管哪一层；带宽、延迟、抖动与消息约定为什么要分开看。 |
| [3.6 电气安全与系统保护](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | [「急停」的一句话听懂](../03-electrical-embedded/06-electrical-safety-and-protection.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 保护为什么要分层；急停要求进入预先定义的安全状态，具体动作不能只靠“急停”这个名称推断。 |

## 第三步：小脑与大脑（{{stat:routes.product.step3.sections}} 节，{{stat:routes.product.step3.timeText}}）

*这一步解决“‘大模型’‘端到端’‘它学会了’这些说法真假难辨”的问题。*

| 小节 | 必读终点（读完这一段） | 你将听懂 |
| --- | --- | --- |
| [4.5 基础控制](../04-cerebellum-realtime-control/05-basic-control.mdx) | [「饱和与延迟」的一句话听懂](../04-cerebellum-realtime-control/05-basic-control.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 反馈控制、开环与闭环；增益受输出上限、带宽、延迟和噪声约束，不能只求响应更快。 |
| [4.6 双足平衡与全身控制](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | [「零力矩点」的一句话听懂](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx#product-read-end) <!-- product-read-end: product-read-end --> | ZMP 与支撑域的关系及适用假设；关节各自跟踪好，不代表整机一定站得住。 |
| [5.1 机器人学习与 AI 词汇](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.mdx) | [「神经网络的最小词汇」的一句话听懂](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 规则、示范与试错三条路；训练是改参数，推理是用参数算输出，两者不能混着说。 |
| [5.2 感知系统](../05-brain-perception-planning-vla-wam/02-perception-system.mdx) | [「标定」的一句话听懂](../05-brain-perception-planning-vla-wam/02-perception-system.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 状态估计与感知的分工；相机种类、内参与外参，以及坐标和时间为什么要对齐。 |
| [5.4 双臂操作与灵巧手](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | [开头关于操作与接触的一句话听懂](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 行走时接触用来支撑自己，操作时接触用来改变世界；手部操作仍受脚底支撑约束。 |
| [5.5 学习控制](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | [「行为克隆」的一句话听懂](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 模型驱动与数据驱动怎样配合；示范没有覆盖的状态为什么会让策略越走越偏。 |
| [5.6 VLA](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | [「边界：这类 VLA 通常不进毫秒级闭环」的一句话听懂](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 动作可以是技能调用、末端目标或关节目标；动作粒度、推理频率与执行频率是不同问题，平衡与安全还需明确责任。 |
| [5.7 WAM：世界动作模型](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx) | [开头关于动作与后果的一句话听懂](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 世界模型预测世界如何变化，WAM 把动作与后果一起建模；它仍是形成中的研究方向。 |

## 第四步：软件、仿真与可复现（{{stat:routes.product.step4.sections}} 节，{{stat:routes.product.step4.timeText}}）

*这一步解决“哪句话能写进对外材料、哪句话只是内部说法”的问题。*

| 小节 | 必读终点（读完这一段） | 你将听懂 |
| --- | --- | --- |
| [6.1 ROS 2 与机器人软件架构](../06-software-tools-simulation/01-ros2-software-architecture.mdx) | [「ROS 2 是什么」的一句话听懂](../06-software-tools-simulation/01-ros2-software-architecture.mdx#product-read-end) <!-- product-read-end: product-read-end --> | ROS 2 提供组件与消息约定；节点不一定等于进程，普通回调不保证毫秒级硬实时控制。 |
| [6.3 Isaac Sim 与 Isaac Lab](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | [「两个东西、两种角色」末段](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx#product-read-end) <!-- product-read-end: product-read-end --> | Isaac Sim 是仿真平台，Isaac Lab 是其上的机器人学习框架；并行训练与部署验证各有职责。 |
| [6.6 软件工程与版本管理](../06-software-tools-simulation/06-software-engineering-and-versioning.mdx) | [开头关于五样东西的一句话听懂](../06-software-tools-simulation/06-software-engineering-and-versioning.mdx#product-read-end) <!-- product-read-end: product-read-end --> | 一次结果由代码、模型、参数、固件、数据共同决定；只管理代码版本，不能说明整机是否变了。 |

## 写文案时的三个提醒

- 涉及具体本体的参数（自由度、控制频率、关节数）以本书引用的小节为准，并核对对应来源与适用条件；
- “反应更灵敏”“站得更稳”这类描述背后都有具体机制（kp、kd、ZMP、温升降额），写之前回对应小节确认因果方向，别把效果写反；
- “能完成”和“能稳定完成”不是一回事：演示的成功率、地面条件、有没有人扶，以及“仿真里练会了”和“真机上能用”之间的差距，都不适合在文案里省略。需要写能力结论时，再读 [5.5「评测与泛化」](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx#评测与泛化演示成功不等于能力达标)与 [6.3「什么时候用 Isaac、什么时候不用」](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx#什么时候用-isaac什么时候不用)。
