# 6.5 运动学与动力学工具库：什么时候该调用哪个

## 先看一个现场问题

团队手写了一个 G1 腿部正运动学，结果和仿真器里的脚端位置差了几度——后来发现是两边对四元数的**分量顺序（wxyz 还是 xyzw）**与坐标系约定不一致。改用现成的库之后，重力补偿力矩算出来了，机器人手臂却仍然下垂——调用逆动力学时忘了浮动基座在速度向量里占 **6 个速度维度**，关节力矩的索引整体错位。再换一处：算雅可比时选了“以本连杆（该 Frame）为参考”（LOCAL）的**表达坐标系**，下游代码却按“以世界为参考”（WORLD）去解释同一个矩阵，力矩映射的方向整个反掉。三个现象都不涉及算法本身，而是**调用方与库对“量”的约定没对齐**。

现场通常会这样问：

> “这些运动学动力学算法为什么还要自己算？仿真器不是已经算了吗？库和仿真器的边界到底在哪？”

这三个现象在本节各有回收点：

- 四元数分量顺序与坐标系约定不一致：对应“模型与数据”与 [4.1 节](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx)“数值之外还要写清什么”的坐标纪律；
- $\tau$ 索引整体错位：对应同一节 `model.nq ≠ model.nv` 的维度关系；
- 雅可比把 LOCAL 用成 WORLD：对应“正运动学与雅可比”的参考系约定。

最后一节的交叉验证，就是为同时抓住这三类问题设计的。

> **一句话听懂**：这三个现象的根源都不在算法，而在调用方与库对“量”的约定没对齐：顺序、维度、参考系各错一处。

## 库与仿真器的边界

仿真器（6.2–[6.4 节](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md)）回答“给定控制输入，世界如何演化”；运动学与动力学库回答另一类问题——“给定当前状态，正逆运动学、雅可比、质量矩阵、逆动力学分别是多少”。库是嵌进你自己代码里的算法库（Library），输出的是量（位姿、矩阵、向量、力矩），不是世界，也不负责推进仿真时间。控制器、规划器、估计器里需要的矩阵和向量，就来自这类库。

**边界一句话：仿真器负责“时间往前走”，库负责“某一时刻把几个量算清楚”。** 库不拥有状态，也不进仿真循环；它被你的控制循环、规划器或估计器当作函数调用。

库与仿真器的交叉验证必须用同一份模型，否则分不清差异来自算法还是模型。本书统一用 unitree_rl_gym 的 G1 描述文件（2.5、[6.2 节](../06-software-tools-simulation/02-mujoco.mdx)）。[5]

> **一句话听懂**：库输出“量”、仿真器演化“世界”；二者不是替代关系，而是“同一份模型的两套算法”，所以交叉验证要先把模型对齐。

本节讲三个库，它们不在同一层，而是三种角色：

- **Pinocchio：动力学内核。** 快、轻、可以嵌进实时控制循环，输出的是 $M(q)$、$g(q)$、雅可比这类“量”；
- **Drake：动力学 + 优化 + 控制设计的研究框架。** 除了动力学，还把约束、代价与轨迹优化放进同一个模型；
- **MoveIt 2：ROS 2 里的规划框架。** 面向手臂的自由空间规划，内部同样要解 IK、做碰撞检查——它消费前两者那类量，对外暴露的是“规划结果”。

> **一句话听懂**：Pinocchio 是嵌进实时循环的动力学内核，Drake 是带优化与控制设计的研究框架，MoveIt 2 是 ROS 2 里管规划的框架；三者分属三个层次，不是互相替代的三个选项。

## 先看全局：什么时候该调用哪个库

把本节后面所有内容放进一张映射表：先问“我现在缺哪个量”，再决定找谁。

```text
控制器 / 估计器         ── 要 M(q)、g(q)、雅可比 ──► Pinocchio（动力学内核）
轨迹优化与约束/代价建模  ── 要动力学 + 约束 + 优化 ──► Drake（动力学与优化框架）
手臂自由空间规划与碰撞   ── 要路径（内部解 IK、查碰撞） ──► MoveIt 2（ROS 2 规划框架）
                                └── 三者都用同一份 G1 与仿真器互验（见“用同一个 G1 交叉验证”一节）
```

| 你现在要做的 | 需要的量 | 找谁 | 本节位置 |
| --- | --- | --- | --- |
| 控制器、估计器在实时循环里反复求解 | `M(q)`、`g(q)`、雅可比 | Pinocchio | “Pinocchio”一节 |
| 把动力学、约束、代价写成一个优化问题 | 动力学 + 约束 + 优化 | Drake | “Drake”一节 |
| 手臂自由空间规划、自碰撞检查、规划组组织 | 路径（内部用 IK 与碰撞检查） | MoveIt 2 | “MoveIt 2”一节 |
| 确认库与仿真器对同一个 G1 算得是否一致 | 四项量：FK 位姿、$g(q)$、雅可比、逆动力学力矩 | 库 + 仿真器 | “用同一个 G1 交叉验证”一节 |
| 已经会算这些量，决定工程上到底用哪个 | —— | 可操作判别 | “什么时候用哪个库”一节 |

后面几节就挂在这张映射上：“Pinocchio”一节对应第一格，“Drake”一节对应第二格，“MoveIt 2”一节对应第三格；交叉验证一节把前两格的结果与仿真器对齐，最后一节把这张表变成选型判别。

> **一句话听懂**：先看缺哪个量——实时算 $M(q)$、$g(q)$、雅可比找 Pinocchio，做优化找 Drake，做手臂规划与碰撞检查找 MoveIt 2；后面各节分别挂在这三格上。

## Pinocchio：刚体动力学算法库

Pinocchio 是 C++ 的刚体动力学算法库，把 4.2、[4.3 节](../04-cerebellum-realtime-control/03-dynamics.mdx)的公式做成可调用的接口。[1][2]

### 模型与数据

Pinocchio 从 URDF 加载模型，构建 `Model`（结构：关节、惯量、几何）和 `Data`（一次计算的缓存与结果）。[1][2] **Frame**（坐标系）是模型里一个带名字的参考坐标系，可以固定在某个连杆、关节或一个固定位姿上；足端、末端、IMU 都挂在某个 Frame 上，Frame 级接口让“算脚尖位姿”不必先知道它挂在哪个连杆。

对带浮动基座的 G1，`model.nq` 与 `model.nv` 不相等：四元数让位置多出一个数，这就是开头 $\tau$ 索引错位的来源——任何拼接状态向量的代码都要分清这两个维度（回扣 [4.3 节](../04-cerebellum-realtime-control/03-dynamics.mdx)“浮动基座形式”）。

> **一句话听懂**：`Model` 是结构、`Data` 是缓存；浮动基座下 `nq ≠ nv`——位置比速度多一个四元数分量，把两个维度混用就是开头那类 $\tau$ 索引整体错位。

### 正运动学与雅可比

正运动学（`forwardKinematics`）更新所有连杆和坐标系（Frame）的位姿；雅可比用 `computeJointJacobian` 或 Frame 级接口计算。最大的使用陷阱是参考系约定：同一个雅可比可以表达在 LOCAL、WORLD 或 LOCAL_WORLD_ALIGNED 系下。三者的区别在于原点和方向各跟谁：**LOCAL** 的原点与方向都跟着目标 Frame，**WORLD** 的原点取世界坐标系原点、方向取世界系，**LOCAL_WORLD_ALIGNED** 的原点跟目标 Frame、方向却与世界系对齐（混合参考系）。选错约定，结果在数值上“看起来差不多”，用到力矩映射（[4.2 节](../04-cerebellum-realtime-control/02-kinematics.mdx)“力矩映射”）上方向就错了。调用方和被调用方必须显式约定参考系，这是 [4.1 节](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx)坐标纪律在 API 层的延续。

> **一句话听懂**：FK 更新位姿，雅可比还多问一句“表达在哪个系”——LOCAL 跟着 Frame 转、WORLD 用世界系、LOCAL_WORLD_ALIGNED 原点跟 Frame 方向跟世界，选错就是开头那个力矩方向反掉。

### 动力学三件套

Pinocchio 实现了刚体动力学的三类经典递归算法，名字对应 [4.3 节](../04-cerebellum-realtime-control/03-dynamics.mdx)的三类计算：[4]

- **RNEA**（Recursive Newton-Euler Algorithm，递归牛顿—欧拉算法）：逆动力学，给定 $q, v, a$ 算所需力矩；令 $a = 0$ 并只保留重力，即得重力项 $g(q)$——重力补偿（[4.5 节](../04-cerebellum-realtime-control/05-basic-control.mdx)“重力补偿”）的标准取法；
- **CRBA**（Composite Rigid Body Algorithm，复合刚体算法）：计算质量矩阵 $M(q)$；
- **ABA**（Articulated Body Algorithm，铰接体算法）：正动力学，给定力矩算加速度。

> **一句话听懂**：选哪个算法只看你要什么——要力矩用 RNEA、要质量矩阵用 CRBA、要从力矩推加速度用 ABA，RNEA 令加速度为零就顺带得到重力项；实时控制里通常只跑其中一个。

### 碰撞与几何

Pinocchio 可加载 URDF 的 collision 几何并计算连杆对距离和碰撞状态，供规划器（[5.3 节](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx)）做自碰撞检查。这些 collision 几何通常是简化形状而不是渲染网格，计算的是几何体之间的距离，因而适合放进规划内层循环。

> **一句话听懂**：collision 几何只算简化形状之间的距离，不管好不好看——它偷懒，规划器就会“看不见”干涉；visual 网格做得再细也补不回来。

## Drake：动力学、优化与控制一体

Drake 的定位比 Pinocchio 更宽：多体动力学、接触与约束、系统框图，以及数学优化都在同一个框架里。[3]

- **MultibodyPlant**（多体系统）：Drake 里描述机器人及其动力学的那棵树，从 URDF/SDF 建模，提供位姿、雅可比、质量矩阵、接触力这些量；
- **接触与约束**：接触不是事后挂上去的插件，而是动力学系统的一部分，约束与接触力可以进入优化；
- **Diagram**（系统框图）：把控制器、估计器、被控对象和环境连成一张有向信号流图，每个方块有输入输出端口，整张图可以被当作一个系统来仿真或分析；
- **MathematicalProgram**（数学规划）：把优化问题写成“决策变量 + 约束 + 代价”，由求解器在背后选方法；
- **Direct Collocation**（直接配点法）：轨迹优化的一种常见建模方式——把轨迹在时间上离散成若干节点，让动力学在节点之间成立，代价与约束直接写在这些节点上。

[5.3 节](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx)“任务目标 + 约束 + 代价”的轨迹优化，在 Drake 里可以直接落成代码：目标写成代价、动力学与限位写成约束、轨迹节点写成决策变量。Pinocchio 与 Drake 的分工先记在这里，完整的选型判别在最后一节。二者都以 URDF/SDF 建模，模型的核对纪律与仿真器导入相同。

> **一句话听懂**：Drake 把多体动力学（MultibodyPlant）、接触与约束、系统框图（Diagram）和数学优化（MathematicalProgram、Direct Collocation）放进同一个框架——[5.3 节](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx)的“目标 + 约束 + 代价”能直接落成代码。

## MoveIt 2：ROS 2 里的运动规划框架

MoveIt 2 把 [5.3 节](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx)的规划问题做成了 ROS 2 生态中的现成框架。[6] 它的核心件是：

- **Planning Scene**（规划场景）：机器人模型与环境障碍物的世界表示，规划器在它上面做检查，而不必直接读 TF 和点云；
- **规划器插件**：真正求解路径的算法，以 OMPL（Open Motion Planning Library，一个采样类运动规划库）等采样规划器为主；
- **运动学插件**：负责解 IK（[4.2 节](../04-cerebellum-realtime-control/02-kinematics.mdx)），给定末端目标位姿求关节角；
- **碰撞检查**：基于 FCL（Flexible Collision Library，一个碰撞检测库）判断路径上是否碰障碍或发生自碰撞；
- **执行端**：规划出的轨迹通过 ros2_control 的轨迹接口下发（[6.1 节](../06-software-tools-simulation/01-ros2-software-architecture.md)），而不是自己拼关节命令。

对 G1 而言，典型用法是按规划组（Planning Group，一组放在一起规划的关节，例如左臂、右臂）组织：左臂、右臂各一组，双臂一组，腰部可并入躯干组；末端规划和双臂协同（[5.4 节](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx)）都有对应入口。它的边界与选型判别统一放在最后一节。

> **一句话听懂**：MoveIt 2 是框架不是算法——规划好不好用，取决于你插了哪个规划器插件、场景里有没有放对碰撞体，以及轨迹能不能顺利交给 ros2_control 下发。

## 用同一个 G1 交叉验证：四项量与约定排查

开头三个现象指向同一件事：库与仿真器对不上时，先怀疑约定，再怀疑算法。这一节把算法库与仿真器之间的核对落到四项量和一个清单上。

统一模型是 unitree_rl_gym 的 G1 描述文件（提交 `276801e46c5d433564f24658bac64f254b7d2d4b`，2.5、[6.2 节](../06-software-tools-simulation/02-mujoco.mdx)）。[5] 用同一份模型，在库与仿真器之间互验下面四项量：

1. **正运动学（FK）位姿**：给定同一组 $q$，比较库算出的足端/末端位姿与仿真器里读出的对应 Frame 或 body 位姿。对不上先查“目标 Frame 到底是哪一个”，再查坐标系约定；
2. **重力项 $g(q)$**：对库调 RNEA 并令 $v = 0$、$a = 0$，得到的广义力就是 $g(q)$；与仿真器在速度、加速度为零时维持姿态所需的力矩对照。这正是 [4.5 节](../04-cerebellum-realtime-control/05-basic-control.mdx)重力补偿的核对方式；
3. **雅可比（含参考系）**：用速度映射或力矩映射做数值对照——给一个微小关节速度，看末端速度是否等于 $J\dot{q}$；或用 $J^{T}$ 把末端力映射回关节力矩，再与数值扰动结果比较。比较之前必须声明 $J$ 表达在 LOCAL、WORLD 还是 LOCAL_WORLD_ALIGNED；
4. **逆动力学关节力矩**：给定同一组 $q, v, a$，比较库的 RNEA 输出与仿真器在相同状态、相同外力下所需的关节力矩；差异常来自接触是否纳入、$a$ 的取值以及力矩信号的正负方向。

四项量都能对上，说明模型与约定一致；对不上，按清单逐项排查：

- **四元数分量顺序**：w 在前还是在后？URDF、仿真器、库和自写代码可能各用一套，这是位置差几度的典型原因（[4.1 节](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx)四元数）；
- **坐标系与单位**：角度是弧度还是度、长度是米还是毫米、力矩在关节侧还是末端侧，以及左手系 / 右手系、Z 轴朝上还是朝前；
- **`nq` 与 `nv`**：浮动基座占 6 个速度维度，四元数让位置多一个数；把 $\tau$ 按 `nq` 索引就会整体错位（回扣 [4.3 节](../04-cerebellum-realtime-control/03-dynamics.mdx)浮动基座形式）；
- **雅可比参考系**：LOCAL / WORLD / LOCAL_WORLD_ALIGNED 不能靠“数值看起来差不多”蒙混，必须在接口处显式声明；
- **关节索引顺序**：同一个 G1，URDF 的关节序、库内部的自由度序和仿真器 `qpos`/`qvel` 的顺序可能不同，跨库传向量前先对齐索引表。

一句话原则：**对不上时先查约定，再怀疑算法。** 开头三个现象——四元数顺序、$\tau$ 索引、雅可比参考系——全部属于约定层，而不是算法层。

> **一句话听懂**：交叉验证就是拿同一份 G1、在同一组状态上比 FK 位姿、重力项 $g(q)$、雅可比和逆动力学力矩四项；对不上先按四元数顺序、坐标系与单位、`nq/nv`、雅可比参考系、关节索引顺序查约定，再怀疑算法。

## 什么时候用哪个库

把前面内容压成可操作的判别。顺序是：先问缺哪个量，再问这个量要嵌进什么场景。

1. 控制器、估计器要在实时循环里反复算 $M(q)$、$g(q)$、雅可比 → **Pinocchio**：轻、可嵌入，接口贴合实时线程（4.5、[4.6 节](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx)）；
2. 要把动力学、约束、代价写成一个优化问题（轨迹优化、控制设计）→ **Drake**：MultibodyPlant、MathematicalProgram 与 Direct Collocation 在同一个框架里；
3. 要在 ROS 2 里做手臂自由空间规划、避障与规划组组织 → **MoveIt 2**：Planning Scene、规划器插件、IK、碰撞检查与 ros2_control 执行一体；
4. 只想确认“模型与约定对不对”，不打算做优化或规划 → 任选一个库加仿真器做交叉验证即可，不必引入整套框架；
5. 要动态步行、全身平衡或接触力分配 → 这三者都不是这三个库的活，属于 [4.6 节](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) WBC 的领域。

边界再强调一次：MoveIt 2 擅长手臂自由空间规划与碰撞规避，不做动态步行与全身平衡；把它的规划输出接入 G1 时，时间参数化（把一条几何路径变成带时间戳、满足速度与加速度限制的轨迹）、速度限幅和 [5.3 节](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx)的刷新纪律仍由调用方保证。Pinocchio 与 Drake 的选择也别忘记模型的核对纪律——二者都以 URDF/SDF 建模，导入后的检查项与仿真器相同（6.3、[6.4 节](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md)）。

> **一句话听懂**：实时算量选 Pinocchio、写优化选 Drake、ROS 2 里做手臂规划选 MoveIt 2、只做模型核对就两库加仿真器交叉验证、动态步行与全身平衡归 [4.6 节](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) WBC；规划输出的时间参数化、限幅与刷新纪律永远由调用方保证。

## 参考资料

[1] Carpentier, J., et al. “The Pinocchio C++ Library: A Fast and Flexible Implementation of Rigid Body Dynamics Algorithms and Their Analytical Derivatives.” *IEEE/SICE SII*, 2019. Pinocchio 的设计与算法实现。<https://doi.org/10.1109/SII.2019.8700380>
[2] stack-of-tasks. *pinocchio: A fast and flexible implementation of Rigid Body Dynamics algorithms*. 本文使用提交 `e2b0d97ab714f8727bf176e2585c679b5be2a125`，用于核对 Model/Data、FK、雅可比与 RNEA/CRBA/ABA 接口。<https://github.com/stack-of-tasks/pinocchio/tree/e2b0d97ab714f8727bf176e2585c679b5be2a125>
[3] Tedrake, R., & the Drake Development Team. *Drake: Model-Based Design and Verification for Robotics*. 多体动力学、系统框图与轨迹优化框架。<https://drake.mit.edu>
[4] Featherstone, R. *Rigid Body Dynamics Algorithms*. Springer, 2008. RNEA、CRBA、ABA 三类算法的标准教材。
[5] Unitree Robotics. *unitree_rl_gym: G1 robot description*. 官方 G1 URDF/MJCF 模型；本文使用提交 `276801e46c5d433564f24658bac64f254b7d2d4b`，作为库与仿真器交叉验证的统一模型来源。<https://github.com/unitreerobotics/unitree_rl_gym/tree/276801e46c5d433564f24658bac64f254b7d2d4b/resources/robots/g1_description>
[6] MoveIt 团队. *moveit2: MoveIt for ROS 2*. 本文使用提交 `92f23839cc2efe00490bb5bb9f6df7dde96df35e`，用于核对 Planning Scene、规划器插件、碰撞检查与规划组接口。<https://github.com/moveit/moveit2/tree/92f23839cc2efe00490bb5bb9f6df7dde96df35e>
