# 6.4 Gazebo、RViz 2 与 Foxglove：仿真、看空间、看时间

## 先看一个现场问题

把 G1 的 URDF 加载进 RViz 2，模型站得笔直、关节拖动都正常；同一个模型放进 Gazebo，一取消暂停就瘫在地上——RViz 里根本没有物理。换过来，Gazebo 里控制器终于加载成功，机器人能站了，但行走时偶尔抽一下；想查原因，rosbag 里只录了关节状态，没录接触力和控制器内部误差，只能看着现象猜。

现场通常会这样问：

> “RViz 里明明是对的，为什么到 Gazebo 里就不行？排查一个步态抖动，到底该看哪个工具？”

这三个现象在本节各有回收点：

- “RViz 里对、Gazebo 里瘫”：对应 RViz 2 一节——RViz 2 只渲染消息、不计算物理；
- “Gazebo 里能站、行走偶尔抽一下”：对应“ROS 2 集成与控制器”里仿真时序那一句（物理步长、接触求解、实时率与控制器更新节奏不匹配）；
- “rosbag 只录了关节状态、没录接触力只能猜”：对应 Foxglove 一节的记录清单纪律。

> **一句话听懂**：这三个现象分别指向三件工具各自的边界——RViz 2 不算物理、Gazebo 有自己的仿真时序、Foxglove 依赖你事先录了什么。

## 三个工具、三种角色

这三件工具在 ROS 2 工具链里各管一件事：Gazebo 是物理仿真器，负责“世界怎么演化”；RViz 2 是空间可视化工具，负责“机器人认为自己在哪”；Foxglove 是时间序列与回放工具，负责“信号随时间怎么变”。**三者都不产生控制逻辑**，混用它们的前提是先把分工想清楚：数据由 Gazebo 一侧产生（世界状态与传感器读数），RViz 2 与 Foxglove 只消费数据，真正参与控制回路、决定机器人怎么动的是控制器，而它不在三件工具之中。

| 工具 | 角色 | 数据类型 | 在回路里的位置 |
| --- | --- | --- | --- |
| Gazebo | 物理仿真器，产生仿真世界与传感器数据 | 世界状态、相机 / IMU / 激光雷达 / 接触传感器读数 | 回路的物理端：接收控制命令、演化世界、向总线回吐数据 |
| RViz 2 | 空间可视化，消费数据 | TF、`JointState`、点云、图像、轨迹、规划路径 | 回路之外：只订阅消息，不写命令 |
| Foxglove | 时间序列与回放，消费数据 | 关节跟踪误差、`tau_est`、IMU、接触力、ZMP 裕量、控制器残差 | 回路之外：订阅或读 rosbag2，按时间轴复盘 |

> **一句话听懂**：Gazebo 产生数据、RViz 2 与 Foxglove 消费数据，控制逻辑在控制器里；三件工具没有一件负责决定机器人怎么动。

## 先看全局：一次仿真的数据流

把本节后面所有内容放进一条数据流，一次 ROS 2 侧仿真的路径是：

```text
Gazebo 世界（SDF 描述 World 与 Model，插件提供传感器）
   │ 传感器数据
   ▼
ros_gz 桥 ──► ROS 2 消息总线 ──┬──► 控制器：gz_ros2_control（实现 ros2_control 的 Hardware Interface）
   ▲                           ├──► RViz 2：看空间
   │                           └──► Foxglove + rosbag2：看时间
   └──── 控制命令（控制器经总线、ros_gz 桥回到 Gazebo 的关节）────┘
```

后面几节就挂在这条流上：“Gazebo”一节讲左端那个世界怎么描述（SDF、插件）以及它如何接进 ROS 2（ros_gz 桥、gz_ros2_control）；RViz 2 一节讲总线右侧的空间观察者；Foxglove 一节讲总线右侧的时间观察者与 rosbag2 回放；最后一节把这条流与 MuJoCo、Isaac 放在一起比较。

> **一句话听懂**：一次仿真的数据流只有一条——Gazebo 世界出数据、ros_gz 桥把它送进 ROS 2 总线、控制器经总线把命令送回世界，RViz 2 和 Foxglove 在总线旁边各看一个维度。

## Gazebo：ROS 2 生态的物理仿真

### SDF 与插件

Gazebo 使用 SDF（Simulation Description Format，仿真描述格式）描述世界（World，场景本身：地面、光照与物理设置）和模型（Model，放进世界的机器人或物体），通过插件（Plugin，挂在世界或模型上、为它增加运行时行为的扩展）扩展功能：传感器插件提供相机、IMU、激光雷达和接触传感器，世界插件控制物理和渲染行为。[1][2] SDF 的表达力覆盖闭环机构和传感器挂载，URDF 模型进入 Gazebo 时需要转换，转换后的检查项与 6.3 节的 USD 导入相同：关节方向、限位、惯量、碰撞几何。

> **一句话听懂**：SDF 是 Gazebo 的世界与模型描述格式，World 是场景、Model 是场景里的对象，Plugin 负责给它们加上传感器和物理行为；URDF 进来要先转换，转换后按关节方向、限位、惯量、碰撞几何逐项核对。

### ROS 2 集成与控制器（ros_gz 与 gz_ros2_control）

Gazebo 与 ROS 2 的集成有两层。消息层由 `ros_gz`（Gazebo 与 ROS 2 之间的消息桥）桥接：Gazebo 内部的传感器数据被转成 ROS 2 Topic，ROS 2 侧的控制命令也经它送回 Gazebo。控制层由 `gz_ros2_control`（在 Gazebo 里实现 ros2_control 硬件接口的插件）承担：它在 Gazebo 里实现 6.1 节 ros2_control 的 Hardware Interface，让同一套控制器配置既能跑仿真又能跑实机；资源仲裁也沿用 6.1 节 ros2_control 的规则，同一时刻一个命令接口只能被一个激活的控制器占用。[5] 开头的“加载就瘫”有一类典型原因：模型里的惯量过小或为默认值，或控制器插件未加载，机器人处于无阻尼状态。

开头的“能站但行走偶尔抽一下”也要先往仿真时序上找：物理步长、接触求解和实时率决定了仿真世界推进的节奏，控制器与物理更新时间不匹配时，控制命令就作用在一个已经变了的世界状态上。

> **一句话听懂**：集成分两层——`ros_gz` 负责消息桥接（把 Gazebo 数据变成 ROS 2 Topic，也把命令送回去），`gz_ros2_control` 负责控制（在 Gazebo 里实现 ros2_control 的 Hardware Interface）；同一个硬件接口让仿真与实机共用一套控制器配置。

## RViz 2：看空间，不做仿真

RViz 2 把订阅到的消息画在三维空间里：RobotModel 面板（按 URDF 渲染机器人的显示项，驱动数据来自 `JointState`）画出机器人，TF 面板（显示坐标变换树的显示项）画出各坐标系之间的关系，此外还有点云、图像、轨迹和规划路径等显示类型。[3] 它渲染的是消息内容，不计算任何物理——RViz 2 里模型不散架，只说明 URDF 和 TF 是对的，不说明动力学可行。这也是开头“RViz 对、Gazebo 瘫”的全部原因。

RViz 2 的正确用法是当作“机器人内部状态的空间投影”：规划器认为脚在哪、TF 树是否成环、检测到的目标在机器人坐标系的什么位置。它挂在“先看全局”那条流的总线一侧，只订阅、不写命令。

> **一句话听懂**：RViz 2 把消息画成三维空间关系——RobotModel 面板看 URDF、TF 面板看坐标树；它只渲染订阅到的内容、不计算物理，所以“RViz 里对”不等于“动力学可行”。

## Foxglove：看时间，做回放

Foxglove 面向时间序列和日志回放：关节跟踪误差、`tau_est`（关节力矩估计）、IMU 原始数据、接触力、ZMP 裕量、控制器内部残差，按时间轴对齐到同一个界面上；配合 rosbag2 回放（把录制下来的 Topic 按时间戳重新播放），可以把一次故障的完整信号历史逐帧复盘。[4] 空间关系看 RViz 2，时间序列看 Foxglove，两者是同一条数据流上的两个观察者。

开头“没录接触力只能猜”的教训对应一条纪律：记录 Topic 的清单应按故障排查需求设计，而不是按“现在想看什么”设计。4.5–4.6 节与 5.3 节每节的排查清单，落到工程上就是 Foxglove 里的一组预设面板和 rosbag2 里的一组必录 Topic。

> **一句话听懂**：Foxglove 把多个信号按时间轴对齐——关节跟踪误差、`tau_est`、接触力、ZMP 裕量都能画在一起，配合 rosbag2 回放复现一次故障；但前提是你当时把该录的 Topic 录下来了。

## 什么时候用哪个工具

工具选择比工具使用更容易出错，判别顺序是：先问自己要看的量是什么，再决定用哪件工具。

1. 看空间关系（位姿、TF 树、规划路径、检测目标）→ RViz 2；
2. 看时间序列与回放（跟踪误差、力矩、接触力随时间怎么变）→ Foxglove + rosbag2；
3. 要 ROS 2 系统级仿真与传感器链路（TF、ros2_control、Nav2 在同一个系统里跑起来）→ Gazebo；
4. 要接触精度与部署前验证 → MuJoCo（6.2 节）；
5. 要大吞吐训练或视觉在环 → Isaac（6.3 节）。

Gazebo 居中：TF、ros2_control、Nav2 等组件开箱即用，适合验证软件架构和传感器链路，是“让算法在 ROS 2 系统里跑起来”的仿真环境。

判别之外，记录清单的纪律对三件工具都成立：RViz 2 里想看的、Foxglove 里要画的，必须先在 rosbag2 或仿真里录下来，否则事后只能靠猜。

> **一句话听懂**：看空间用 RViz 2、看时间用 Foxglove + rosbag2、要 ROS 2 系统级仿真用 Gazebo、要接触精度和部署验证用 MuJoCo、要大吞吐训练用 Isaac；而记录清单要按排查需求设计，不是按现在想看什么设计。

## 参考资料

[1] Open Robotics. *Gazebo Documentation*. Gazebo 的 SDF、世界/模型插件与传感器插件官方文档。<https://gazebosim.org/docs>

[2] Koenig, N., & Howard, A. “Design and Use Paradigms for Gazebo, an Open-Source Multi-Robot Simulator.” *IEEE/RSJ IROS*, 2004. Gazebo 的原始论文与架构设计。<https://doi.org/10.1109/IROS.2004.1389727>

[3] Kam, H. R., et al. “RViz: A Toolkit for Real Domain Data Visualization.” *Telecommunication Systems*, 2015. RViz 的设计与定位论文。<https://doi.org/10.1007/s11235-015-0034-5>

[4] Foxglove. *Foxglove Documentation*. 面板、时间序列与 rosbag 回放的官方文档。<https://docs.foxglove.dev/>

[5] ros-controls. *ros2_control: A framework for real-time control of robots using ROS 2*. 本文使用提交 `f1a73f3550c6598ac0691c4ad27211501fcd54e1`，用于核对 Hardware Interface 语义及 `gz_ros2_control` 的集成方式。<https://github.com/ros-controls/ros2_control/tree/f1a73f3550c6598ac0691c4ad27211501fcd54e1>
