# 附录 A 术语速查表

本表收录正文第 1–6 章出现频率最高、最容易卡住跨专业读者的专业术语（行业里也叫“黑话”，含缩写与专有名词）。每个术语都可以点击，跳到本书中解释它的那一节章节文件，适合当作阅读时的随身索引。

每条术语给两层解释：**专业解释**用本书口径给出准确、可核查的定义，带英文全称或缩写；**一句话听懂**用大白话讲它干什么、为什么值得关心。分类内大致按术语在正文中出现的先后排列。

## 分类总览

| 分类 | 条目数 | 快速跳转 |
| --- | --- | --- |
| 数学与坐标 | 11 | [见下](#数学与坐标) |
| 机构结构与传动 | 25 | [见下](#机构结构与传动) |
| 运动学与动力学 | 14 | [见下](#运动学与动力学) |
| 控制与执行 | 14 | [见下](#控制与执行) |
| 状态估计与传感 | 14 | [见下](#状态估计与传感) |
| 感知与视觉 | 10 | [见下](#感知与视觉) |
| 规划步态与稳定性 | 17 | [见下](#规划步态与稳定性) |
| 操作与抓取 | 7 | [见下](#操作与抓取) |
| 学习与训练 | 16 | [见下](#学习与训练) |
| 具身大模型 | 14 | [见下](#具身大模型) |
| 仿真与工具链 | 21 | [见下](#仿真与工具链) |
| 电气与总线 | 18 | [见下](#电气与总线) |
| ROS 2 与软件工程 | 5 | [见下](#ros-2-与软件工程) |

## 数学与坐标

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [叉乘（Cross Product）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 三维向量运算，结果垂直于两向量，方向由右手定则决定 | 从两个方向量出一个垂直方向，力矩就这么来 |
| [左乘与右乘（Left / Right Multiplication）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 变换写在乘号左侧（ΔT）表示在世界坐标系里生效，写在右侧（TΔ）表示在自身坐标系里生效 | 左乘绕世界、右乘绕自己 |
| [旋转矩阵（Rotation Matrix）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 3×3 正交矩阵，行列式为 +1，用于坐标系间旋转和向量变换 | 用 9 个数表示朝向，没有欧拉角那种死角 |
| [欧拉角（Euler Angles）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 依次绕三个轴旋转的姿态表示，如 roll、pitch、yaw，须声明轴序 | 依次绕三个轴转多少度，直观但轴序必须说清 |
| [万向节锁（Gimbal Lock）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 中间角为 ±90° 时两旋转轴重合、姿态参数化退化的现象 | 三个角度描述不了某些姿态，反算数值会乱跳 |
| [轴角与旋转向量（Axis-Angle / Rotation Vector）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 用单位轴和旋转角表示姿态，适合描述小姿态误差与优化变量 | 绕哪根轴、转多少度，表示小偏差很方便 |
| [四元数（Quaternion）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 单位四元数用四个数表示旋转，无万向节锁，须统一分量顺序 | 四个数表示朝向，坑在 wxyz 还是 xyzw |
| [齐次变换（Homogeneous Transform）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 把旋转矩阵和平移向量放进 4×4 矩阵，可连乘组合运动链 | 旋转和平移打包成一个矩阵，一次乘法搬坐标系 |
| [位姿（Pose）](../04-cerebellum-realtime-control/01-robot-mathematics-foundations.mdx) | 位置与姿态的合称，描述坐标系原点和朝向 | 既说在哪、又说朝哪边 |
| [坐标系（Frame）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 带原点和轴向的参考系，世界、基座、关节、末端、传感器各有一套 | 说清一个量是站在哪个参考系上量的 |
| [右手坐标系（Right-handed Coordinate System）](../02-mechanics/01-mechanisms-and-dof.mdx) | 食指 x、中指 y、拇指 z 的坐标约定，决定旋转与力矩正负 | 一只手就能定下三根轴和转动的正负号 |
| [广义坐标（Generalized Coordinates）](../02-mechanics/01-mechanisms-and-dof.mdx) | 描述机器人构型的独立变量向量 q，人形还含浮动基座位姿 | 把机器人所有能自己动的地方排成一组数 |

## 机构结构与传动

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [机构（Mechanism）](../02-mechanics/01-mechanisms-and-dof.mdx) | 由连杆和关节组成、用来传递运动和力的结构 | 一堆硬零件用关节连起来传运动和力 |
| [刚体（Rigid Body）](../02-mechanics/01-mechanisms-and-dof.mdx) | 内部任意两点距离不变的理想模型，连杆建模的基础假设 | 怎么受力都不变形的理想零件 |
| [连杆（Link）](../02-mechanics/01-mechanisms-and-dof.mdx) | 近似刚体的结构件，如骨盆、大腿、小腿和足部 | 像大腿小腿那样实打实的硬零件 |
| [关节（Joint）](../02-mechanics/01-mechanisms-and-dof.mdx) | 描述两个连杆之间允许的相对运动，如转动或移动 | 两块零件之间能怎么动的关系 |
| [运动链（Kinematic Chain）](../02-mechanics/01-mechanisms-and-dof.mdx) | 从基座到末端按关节连接的一串连杆，可以包含闭环 | 零件和关节一根根串起来的一条链 |
| [运动树（Kinematic Tree）](../02-mechanics/01-mechanisms-and-dof.mdx) | 无闭环、每个节点只有一个父节点的运动链，URDF 的基本结构 | 不打圈、每个零件只接一个上家的链 |
| [转动关节（Revolute Joint）](../02-mechanics/01-mechanisms-and-dof.mdx) | 绕固定轴线旋转的单自由度关节，如膝关节 | 只能绕一根轴转的关节 |
| [自由度（Degree of Freedom, DoF）](../02-mechanics/01-mechanisms-and-dof.mdx) | 描述构型所需的最少独立变量数，转动关节各贡献一个 | 要几个数字才能把机器人的姿势说清楚 |
| [四连杆机构（Four-bar Linkage）](../02-mechanics/01-mechanisms-and-dof.mdx) | 四根杆首尾铰接的闭合平面机构，理想平面模型下只剩一个自由度 | 四根杆连成一圈，实际只有一个独立自由度 |
| [死点（Dead Center）](../02-mechanics/01-mechanisms-and-dof.mdx) | 曲柄与连杆共线的构型，输出速度为零、机构雅可比接近奇异 | 某个姿势下输入还在转、输出却几乎不动 |
| [空间并联机构（Parallel Mechanism）](../02-mechanics/01-mechanisms-and-dof.mdx) | 多条支链共同驱动同一末端的闭环机构，刚度高、承载大 | 多个电机从不同方向一起推同一个部件 |
| [关节轴线（Joint Axis）](../02-mechanics/01-mechanisms-and-dof.mdx) | 关节允许运动的方向，写在 URDF 的 axis 字段，决定正方向 | 这根关节绕哪根轴转，反了就朝反方向动 |
| [零位（Zero Position）](../02-mechanics/01-mechanisms-and-dof.mdx) | 关节角算作零时的姿态基准，需对齐编码器、模型和装配零位 | 关节角为 0 时这条腿摆成什么样 |
| [关节限位（Joint Limits）](../02-mechanics/01-mechanisms-and-dof.mdx) | 位置、速度和力矩约束，取机械、驱动器和软件中最严的一层 | 关节最多转到哪、最多使多大劲 |
| [工作空间（Workspace）](../02-mechanics/01-mechanisms-and-dof.mdx) | 末端在关节范围和几何约束下能够到达的位置集合 | 手能伸到哪些地方 |
| [质心（Center of Mass, CoM）](../02-mechanics/02-links-structure-and-materials.mdx) | 各连杆质量加权的平均位置，决定重力作用点和姿态耦合 | 机器的重心在哪，平衡就围着它算 |
| [转动惯量（Moment of Inertia）](../02-mechanics/02-links-structure-and-materials.mdx) | 衡量绕各轴改变角速度所需力矩的惯性量，真实连杆是三维张量 | 转起来有多费劲，质量越靠末端越费劲 |
| [关节模组（Joint Module）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 电机、减速器、编码器、驱动器和输出轴封装成的可独立安装执行单元 | 机器人的关节总成，打包好能单独拆装 |
| [减速器（Reducer / Gearbox）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 在速度、力矩和惯量之间进行变换的传动部件 | 关节里的挡位箱，降速增力 |
| [传动比（Gear Ratio）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 电机转速与输出轴转速之比，理想情况下力矩提高同倍数 | 电机转几圈、输出才转一圈 |
| [谐波减速器（Harmonic Drive）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 靠柔轮与波发生器工作的减速器，体积紧凑、减速比高、回差小 | 小巧又准，常装在手腕这类怕重的地方 |
| [回差（Backlash）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 输入方向反转时输出端重新建立啮合前的相对空行程 | 换方向时先空转一点点才咬上 |
| [扭转刚度（Torsional Stiffness）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 输出轴受力矩后抵抗角变形的能力，由传动链各环节串联决定 | 使劲拧一下，关节会扭过去多少 |
| [力矩—速度包络（Torque-speed Envelope）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 描述可用输出随速度、电压和温度变化的边界 | 电机的出力边界，越快越使不上劲 |
| [热降额（Thermal Derating）](../02-mechanics/03-transmission-and-joint-modules.mdx) | 温度或供电触限时主动降低允许输出以保护部件的行为 | 太热了自己收着点劲，免得烧坏 |

## 运动学与动力学

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [正运动学（Forward Kinematics, FK）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 由关节变量 q 经局部变换连乘求末端位姿 | 从关节角推出手脚在哪、朝哪 |
| [逆运动学（Inverse Kinematics, IK）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 由期望末端位姿反求关节变量，通常带限位、碰撞等约束 | 告诉机器人手要伸到哪，反推关节转多少 |
| [冗余（Redundant）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 关节变量多于任务维度，同一末端目标对应多组关节解 | 关节比任务多，够得到目标的姿势不止一种 |
| [雅可比（Jacobian）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 关节速度到末端速度的线性映射矩阵，转置把末端力映射回关节力矩 | 关节动一点末端动多少，力怎么反推回关节 |
| [奇异位形（Singular Configuration）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 雅可比降秩的构型，某些方向末端速度为零或关节速度爆炸 | 某些姿势下某个方向推不动，想动关节飞转 |
| [条件数（Condition Number）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 雅可比最大与最小奇异值之比，越大越接近奇异 | 数字越大说明这个姿势越接近推不动 |
| [阻尼最小二乘（Damped Least Squares, DLS）](../04-cerebellum-realtime-control/02-kinematics.mdx) | 在速度逆解中加阻尼项抑制奇异附近的关节速度爆炸 | 给速度踩刹车，用一点误差换不爆速度 |
| [动力学（Dynamics）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 研究运动与质量、惯量、重力、接触力和执行器力矩的关系 | 要产生这个动作，各关节得出多大劲 |
| [正动力学（Forward Dynamics）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 给定状态、执行器力矩和外力求加速度，仿真器的核心步骤 | 给你用力，算它怎么动 |
| [逆动力学（Inverse Dynamics）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 给定期望 q、速度、加速度和外力反算所需关节力矩 | 我想让它这样动，每个关节得出多大力 |
| [质量矩阵（Mass Matrix）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 描述平动、转动惯性以及关节间动力学耦合的矩阵 M(q) | 哪些方向好加速、哪些方向特别费劲 |
| [重力补偿（Gravity Compensation）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 用重力项 g(q) 作为前馈抵消自重，减少静态偏差和持续电流 | 先把重力这份负担替电机扛掉 |
| [接触雅可比（Contact Jacobian）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 把接触点速度与接触力映射到关节速度和关节力矩的矩阵 | 把地面给的力折算成每个关节要出多大力 |
| [欠驱动（Underactuated）](../04-cerebellum-realtime-control/03-dynamics.mdx) | 浮动基座 6 个自由度没有直接电机驱动，靠接触和外力决定 | 整机那 6 个自由度没有电机直接推 |

## 控制与执行

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [反馈控制（Feedback Control）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 用测量结果与目标的误差修正后续控制动作形成闭环 | 看偏差出手，错多少补多少 |
| [稳定性（Stability）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 扰动后系统回到目标附近而不是振荡发散的性质 | 被推一下，是稳回来还是越振越大 |
| [带宽（Bandwidth）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 闭环能跟上多快目标变化的频率指标 | 跟目标跟得多快，太快就跟不上 |
| [PID 控制（Proportional–Integral–Derivative Control）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 比例、积分、微分三项误差的线性组合控制律 | 三种反应叠一起：现在、历史、变化快慢 |
| [PD 控制（Proportional–Derivative Control）](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 只含比例和微分两项、由位置误差直接给出力矩的控制律 | 只按现在的偏差和变化快慢给力 |
| [积分饱和（Integral Windup）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 执行器已饱和而误差仍累积，积分项攒过头造成严重超调 | 补不上还一直攒劲，一松就猛冲 |
| [抗积分饱和（Anti-Windup）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 检测饱和时停止或回退积分、对积分量限幅的措施 | 给积分项设个上限，别让它攒过头 |
| [前馈（Feedforward）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 按模型提前给出主要力矩，反馈只修正残余误差 | 按模型先出力，不等出错再补 |
| [阻抗控制（Impedance Control）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 让关节对外表现为可调弹簧—阻尼行为，由 kp、kd 决定 | 管碰到东西时有多硬，而不是只看到没到 |
| [导纳控制（Admittance Control）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 先测量外力再反算位置修正，与阻抗控制是对偶关系 | 先测到力，再改成位置让一点 |
| [轨迹（Trajectory）](../04-cerebellum-realtime-control/05-basic-control.mdx) | 带时间的位置、速度、加速度序列，要求彼此连续自洽 | 不光说经过哪，还说几点到哪 |
| [电流环（Current Loop）](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 最内层控制环，让实测相电流或 id、iq 跟随给定值 | 管给电机通多大电流，三个环里最快 |
| [场定向控制（Field-oriented Control, FOC）](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 把三相电流变换到随转子旋转的 dq 坐标系后分别控制的方法 | 把交流量变成两个直流量，像拧两个旋钮 |
| [伺服电机（Servo Motor）](../03-electrical-embedded/02-motors-drivers-servo-control.mdx) | 电机加位置速度反馈、驱动器和闭环控制构成的执行器 | 会自己盯着自己转的电机 |

## 状态估计与传感

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [状态估计（State Estimation）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 用带噪声、带延迟的传感器数据推断机器人当前最可能的状态 | 把不完整的传感器拼成机器人现在的样子 |
| [互补滤波（Complementary Filter）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 用高频陀螺仪跟踪快变、低频重力方向抑制长期漂移的融合方法 | 陀螺管快、加速度计管慢，按权重加起来 |
| [卡尔曼滤波（Kalman Filter, KF）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 按预测和观测各自不确定度加权平均的递推估计方法 | 先用模型猜、再用传感器改 |
| [EKF（扩展卡尔曼滤波，Extended Kalman Filter）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 在当前估计附近线性化非线性模型的卡尔曼滤波 | 非线性系统的卡尔曼滤波，边猜边线性化 |
| [可观测性（Observability）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 当前传感器和动作里是否包含某个状态的信息 | 靠现有传感器到底猜不猜得出来 |
| [零偏（Bias）](../04-cerebellum-realtime-control/04-state-estimation.mdx) | 传感器静止时输出不为零的固定偏置，积分后造成漂移 | 静止时也不归零的小偏移，一积分就飘 |
| [编码器（Encoder）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 测量电机或关节位置与速度的传感器，分绝对式和增量式 | 关节上的角度尺 |
| [绝对式编码器（Absolute Encoder）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 上电即可直接给出当前位置、无需先找零点的编码器 | 一上电就知道自己在哪儿 |
| [惯性测量单元（Inertial Measurement Unit, IMU）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 通常含陀螺仪和加速度计、测量角速度与比力的传感器 | 机器人的内耳，感觉身体转多快、歪没歪 |
| [六维力/力矩传感器（Force/Torque Sensor, F/T Sensor）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 测量三轴力和三轴力矩的传感器，常用于脚踝、腕部 | 给手腕脚踝装上的触觉 |
| [压力中心（Center of Pressure, CoP）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 足底压力分布等效的合力作用点 | 脚底受力的合力压在哪个点 |
| [内参（Intrinsics）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 传感器自身特性，如相机焦距主点畸变、IMU 零偏标度因数 | 传感器自己准不准 |
| [外参（Extrinsics）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 传感器相对机身的安装位姿，含位置、轴向和固定旋转 | 传感器装得对不对 |
| [时间戳（Timestamp）](../03-electrical-embedded/03-sensors-and-data-acquisition.md) | 数据采集时刻的标记，用于跨传感器对齐和 TF 查询 | 这个数是哪个时刻测到的 |

## 感知与视觉

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [感知系统（Perception System）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 把相机、深度等原始数据转换成带坐标、时间和置信度的环境判断 | 回答周围有什么、它们在哪 |
| [深度相机（Depth Camera）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 用结构光、ToF 或主动双目直接输出每像素距离的相机 | 直接告诉你每个像素多远 |
| [双目相机（Stereo Camera）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 用两个相机的视差被动计算深度的相机，依赖表面纹理 | 靠两只眼睛的视差算距离 |
| [目标检测（Object Detection）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 输出目标类别、置信度和包围框的视觉任务 | 在图上框出这里有个杯子 |
| [实例分割（Instance Segmentation）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 进一步给出每个像素归属掩码的视觉任务 | 不只框出来，还逐像素标出哪块是它 |
| [点云（Point Cloud）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 一组带三维坐标的点，由深度图反投影或激光雷达生成 | 一堆三维点，拼出周围形状 |
| [SLAM（Simultaneous Localization and Mapping）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 在建图的同时定位、用回环检测拉回漂移的方法 | 一边画地图一边找自己在地图哪里 |
| [视觉惯性里程计（Visual Inertial Odometry, VIO）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 视觉里程计与 IMU 融合、估计自身相对运动的里程计 | 眼睛加内耳一起算自己走了多远 |
| [回环检测（Loop Closure）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 识别回到曾经到过的位置、消除累积漂移的步骤 | 认出这地方我来过，把漂移拉回来 |
| [标定（Calibration）](../05-brain-perception-planning-vla-wam/02-perception-system.md) | 确定传感器内参和外参的过程 | 把传感器自己准不准、装得对不对量清楚 |

## 规划步态与稳定性

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [运动规划（Motion Planning）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 生成满足运动学、动力学、碰撞和时间约束的运动序列 | 规划出一条能走的路和它什么时候走 |
| [时间参数化（Time Parameterization）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 给几何路径配上满足速度和加速度约束的速度剖面 | 给路径配一条速度曲线 |
| [自碰撞（Self-Collision）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 机器人自己的连杆相撞，只依赖自身几何、可离线预计算 | 自己撞自己 |
| [足步规划（Footstep Planning）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 在离散落脚点集合上选择下一步踩点与时序 | 决定下一步踩哪块地 |
| [模型预测控制（Model Predictive Control, MPC）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 每周期以当前状态为起点在有限时域内求解、只执行第一步 | 滚动优化，每拍重新算、只执行第一步 |
| [轨迹刷新（Replanning）](../05-brain-perception-planning-vla-wam/03-motion-planning.mdx) | 新目标或新障碍出现时更新轨迹、须从当前执行点平滑衔接 | 计划变了要从现在接上，别硬切 |
| [零力矩点（Zero-Moment Point, ZMP）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 地面上惯性力、重力和接触力绕水平轴合力矩为零的点 | 动态版的脚下重心投影 |
| [线性倒立摆（Linear Inverted Pendulum Model, LIPM）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 质心高度近似不变、角动量可忽略时的简化双足模型 | 把机器人简化成一根会倒的杆 |
| [捕获点（Capture Point, CP）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 由质心位置和速度组成、落脚其上可停稳的点 | 往哪迈一步能停住 |
| [步态周期（Gait Cycle）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 双支撑相与单支撑相交替构成的行走循环 | 换脚撑住的一个循环 |
| [摆动腿与支撑腿（Swing / Stance Leg）](../02-mechanics/04-foot-contact-and-stability.mdx) | 行走中腾空迈步的腿与承担主要地面反力的腿 | 一条腿抬起来走，另一条撑住 |
| [地面反力（Ground Reaction Force, GRF）](../02-mechanics/04-foot-contact-and-stability.mdx) | 地面作用在支撑脚上的反作用力 | 地面对脚的回推力 |
| [支撑多边形（Support Polygon）](../02-mechanics/04-foot-contact-and-stability.mdx) | 所有承载接触点在地面平面上的凸包 | 脚底吃力点圈出来的范围（[4.6 节](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx)也叫支撑域） |
| [稳定裕量（Stability Margin）](../02-mechanics/04-foot-contact-and-stability.mdx) | 重心投影到支撑多边形边界的最小距离等衡量指标 | 重心离支撑范围边缘还剩多少余量 |
| [摩擦锥（Friction Cone）](../02-mechanics/04-foot-contact-and-stability.mdx) | 库仑摩擦下切向力不超过 μFn 所构成的可行力集合 | 地面最多能给多大横向力 |
| [全身控制（Whole-Body Control, WBC）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 把所有关节当作整体、同时满足多任务和接触限位约束的控制 | 腿腰手一起算，别各管各的 |
| [分层二次规划（Hierarchical Quadratic Programming, HQP）](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx) | 按优先级分层求解任务的二次规划实现方式 | 上层先满足，下层在剩余空间找解 |

## 操作与抓取

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [操作（Manipulation）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 通过接触改变物体状态的能力，如抓、放、推、拉、搬运 | 用接触去改变世界 |
| [末端执行器（End Effector）](../01-system-overview/02-humanoid-robot-anatomy.mdx) | 运动链末端、直接与环境交互的部件，如夹爪、灵巧手、足部 | 真正和世界打交道的那个部件 |
| [灵巧手（Dexterous Hand）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 多指多自由度、能捏握转的末端执行器 | 像人手一样能捏能转 |
| [抓取（Grasping）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 选择接触点并施加接触力以抵抗预期扰动 | 把东西稳稳拿住 |
| [力封闭（Force Closure）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 接触点布局与摩擦能封住物体所有可能运动方向的判据 | 接触力能不能封住物体怎么跑 |
| [动作空间（Action Space）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 算法下发的动作形态，如关节、末端增量、手指原语或轨迹 | 算法眼里的手有哪几种给法 |
| [双臂协同（Bimanual Coordination）](../05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands.mdx) | 双臂搬运时维护两手相对位姿约束的协同方式 | 两只手一起搬，相对位置不能变 |

## 学习与训练

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [模仿学习（Imitation Learning）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 从人的示范轨迹学习观测到动作映射的学习范式 | 看人怎么做，跟着学 |
| [行为克隆（Behavior Cloning, BC）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 把示范数据当作监督学习、直接学习状态到动作的映射 | 把示范当标准答案，一步步抄 |
| [分布偏移（Distribution Shift）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 策略误差把它带进示范未覆盖状态、误差被进一步放大的现象 | 一离开示范就崩，还越走越偏 |
| [强化学习（Reinforcement Learning, RL）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 智能体靠奖励试错、最大化长期累计回报的学习范式 | 试错拿分，分数高的做法留下 |
| [马尔可夫决策过程（Markov Decision Process, MDP）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 用状态、动作、奖励和转移描述序贯决策问题的框架 | 把控制问题写成试、给分、更新的循环 |
| [策略（Policy）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 从状态到动作的映射 π(s)，学习控制输出的就是它 | 看到什么情况就做什么动作 |
| [价值函数（Value Function）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 估计当前状态或状态-动作对预期回报的函数 | 猜现在这个局面以后能拿多少分 |
| [PPO（Proximal Policy Optimization）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 限制每次策略更新幅度的 on-policy 强化学习算法 | 每次只改一点点，别把学到的弄丢 |
| [奖励黑客（Reward Hacking）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 策略钻奖励函数字面漏洞而非完成任务的现象 | 奖励写歪了，它就找省力空子 |
| [域随机化（Domain Randomization, DR）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 训练时随机改变仿真参数，迫使策略不依赖具体参数 | 训练时参数乱变，逼它学会抗变化 |
| [Sim2Real](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 把仿真中训练的策略迁移到真机并弥合差距的过程 | 仿真里学会的搬到真机上用 |
| [Sim2Sim](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 在另一个仿真器里验证策略、暴露过拟合训练环境的步骤 | 换个仿真器先验一遍，便宜 |
| [泛化（Generalization）](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 换新物体、新位置、新光照或新指令后策略仍然有效的性质 | 换个场景还能不能用，才是真本事 |
| [RoboDojo](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 仿真加真机统一的操作策略评测基准，含公开榜单与隐藏校验布局 | 第三方摆的考场，成绩公开可查 |
| [系统辨识（System Identification）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 用真实数据估计质量、摩擦和执行器特性的方法 | 把真机的参数测回来补进模型 |
| [遥操作（Teleoperation）](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 人通过输入设备实时驱动机器人并把过程录成示范 | 人远程带着机器人做，顺手录下来 |

## 具身大模型

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [具身智能（Embodied Intelligence）](../01-system-overview/01-what-is-embodied-ai.mdx) | 智能体依靠物理身体与环境实时交互、在感知决策行动闭环中积累经验 | 有身体、能闭环、能越做越会的智能 |
| [物理 AI（Physical AI）](../01-system-overview/01-what-is-embodied-ai.mdx) | 产业界用语，指理解物理规律并驱动机器人、自动驾驶等真实设备 | 厂商对具身智能的另一种叫法 |
| [莫拉维克悖论（Moravec's Paradox）](../01-system-overview/01-what-is-embodied-ai.mdx) | 下棋等人类觉得难的事对机器容易，行走抓握反而极难 | 机器会写诗，却学不会抓杯子 |
| [VLA（Vision-Language-Action）](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 输入图像、语言和机器人状态、直接输出动作的多模态大模型 | 看图、听指令、出动作合成一个模型 |
| [WAM（World Action Model）](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | 同时建模世界如何变化和机器人应采取什么动作的学习模型 | 多学一件事：这样做世界会变成什么样 |
| [世界模型（World Model）](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | 泛指预测世界如何变化的模型，WAM 是其中联合建模动作的一类 | 会预测未来的模型 |
| [token（词元）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 序列模型处理的最小单位，图像、语言、状态和动作都可切成词元 | 模型一口一口吃的那一小块 |
| [蒸馏（Distillation）](../05-brain-perception-planning-vla-wam/07-wam-world-action-model.md) | 用大模型（教师）的输出或中间表征训练小模型（学生）的压缩方法 | 大模型教小模型，部署时只跑小的 |
| [动作块（Action Chunk）](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 一次推理给出的未来若干步动作序列，用以掩盖推理延迟 | 一次算出一串动作，别一步一算 |
| [视觉定位（Grounding）](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx) | 把语言里的名词绑定到图像具体区域的过程 | 在画面里找到语言说的那个东西 |
| [注意力（Attention）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 序列中每个元素按相关度加权聚合其他元素信息的机制 | 让序列里每个元素互相看一圈 |
| [Transformer](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 以注意力为核心、可统一处理图像语言状态动作的模型架构 | 把各种输入切成序列一起处理的大模型骨架 |
| [扩散（Diffusion）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 训练时逐步加噪、采样时从噪声迭代去噪生成动作的生成式方法 | 从噪声一步步去噪，生成一整段动作 |
| [流匹配（Flow Matching）](../05-brain-perception-planning-vla-wam/01-robot-learning-and-ai-terms.md) | 学习速度场并从噪声沿流线积分生成动作的生成式方法 | 学一张速度场，从噪声顺着流走到动作 |

## 仿真与工具链

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [机器人描述文件（Robot Description File）](../02-mechanics/05-robot-description-files.mdx) | 机读的机器人结构、坐标、质量和仿真接口契约 | 机械算法仿真共用的一份文本 |
| [URDF（Unified Robot Description Format）](../02-mechanics/05-robot-description-files.mdx) | 用 link 和 joint 组织运动树、偏结构描述的机器人模型格式 | 把零件和关节串成一棵家谱树 |
| [MJCF（MuJoCo XML Format）](../02-mechanics/05-robot-description-files.mdx) | 嵌套 body 组织刚体，并把场景、执行器、传感器和接触写进同一份 XML | 不只管长什么样，还带上世界和驱动 |
| [浮动基座（Floating Base）](../02-mechanics/05-robot-description-files.mdx) | 在模型中用 free joint 表示的整机平移旋转自由度 | 机器人没被钉住，能整体平移翻转 |
| [MuJoCo（Multi-Joint dynamics with Contact）](../06-software-tools-simulation/02-mujoco.mdx) | 面向接触富集任务、用软接触模型的 CPU 物理仿真器 | 接触算得准的仿真器，用来验策略 |
| [SDF（Simulation Description Format）](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | Gazebo 用来描述世界和模型、并用插件扩展功能的格式 | Gazebo 里的场景和物体描述文件 |
| [Gazebo](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | 与 ROS 2 集成良好、擅长场景搭建和传感器链路的物理仿真器 | 和 ROS 2 搭得最好的仿真器 |
| [RViz 2](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | 把 TF、点云、图像等消息画成三维空间关系的可视化工具 | 只看空间关系，不算物理 |
| [Foxglove](../06-software-tools-simulation/04-gazebo-rviz2-foxglove.md) | 面向时间序列和日志回放的数据可视化工具 | 把多个信号按时间轴摆一起看 |
| [Isaac Sim](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | 英伟达基于 Omniverse 的 GPU 高保真仿真平台 | 英伟达的 GPU 仿真平台 |
| [Isaac Lab](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | 在 Isaac Sim 上把强化学习任务 Manager 化并行训练的框架 | 在 GPU 上开几千个环境一起训 |
| [USD（Universal Scene Description）](../06-software-tools-simulation/03-isaac-sim-isaac-lab.mdx) | 支持分层、引用和组合的场景描述系统，元素称 Prim | 分层叠加的场景描述格式 |
| [Pinocchio](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 轻量可嵌入实时循环的刚体动力学算法库 | 实时算质量矩阵和雅可比的库 |
| [RNEA（Recursive Newton-Euler Algorithm）](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 递归牛顿—欧拉逆动力学算法，令加速度为零可得重力项 | 逆动力学的算法，也能直接出重力项 |
| [CRBA（Composite Rigid Body Algorithm）](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 计算质量矩阵的刚体动力学递归算法 | 专门算质量矩阵的算法 |
| [ABA（Articulated Body Algorithm）](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 计算正动力学加速度的铰接体递归算法 | 给力矩算加速度的算法 |
| [Drake](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 把多体动力学、接触约束和数学优化放进同一框架的研究工具 | 动力学加优化一体的框架 |
| [MoveIt 2](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | ROS 2 里的手臂运动规划框架，含规划场景、IK 与碰撞检查 | ROS 2 里管手臂规划的框架 |
| [OMPL（Open Motion Planning Library）](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 以采样类算法为主的运动规划库，作为 MoveIt 2 的规划器插件 | 随机采样找路径的规划库 |
| [FCL（Flexible Collision Library）](../06-software-tools-simulation/05-kinematics-dynamics-libraries.md) | 开源碰撞检测库，MoveIt 2 用它做路径碰撞与自碰撞检查 | 专门算“这两块几何体撞没撞”的库 |
| [LeRobot](../05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning.mdx) | 开源机器人学习工具链：数据采集、数据集格式、训练与策略部署 | 采集与训练一条龙的现成工具链 |

## 电气与总线

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [电源系统（Power System）](../03-electrical-embedded/01-power-system.mdx) | 从电芯、BMS、配电、DC-DC 到驱动器的整条能量链 | 电池的电一路送到各个负载的全套 |
| [电池管理系统（Battery Management System, BMS）](../03-electrical-embedded/01-power-system.mdx) | 监测电压电流温度、估计 SoC/SoH 并做均衡与保护的模块 | 盯着电池的电压温度，顺带做均衡和保护 |
| [荷电状态（State of Charge, SoC）](../03-electrical-embedded/01-power-system.mdx) | 电池剩余电量的估计量，需结合电流积分和开路电压校正 | 电池还剩百分之多少，是估出来的 |
| [电源树（Power Tree）](../03-electrical-embedded/01-power-system.mdx) | 描述电池能量如何分配到关节、计算平台和传感器各支路的结构 | 电池的电都分给谁了的路线图 |
| [预充（Pre-charge）](../03-electrical-embedded/01-power-system.mdx) | 先经限流电阻给母线电容充电、再闭合主接触器的上电时序 | 先串个电阻慢慢充电，再合总闸 |
| [CAN（Controller Area Network）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 带优先级仲裁的多主广播总线，适合分布式电机和传感器节点 | 谁急谁先说的共享广播线 |
| [CAN-FD（CAN with Flexible Data-rate）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 扩展数据段长度与速率的 CAN，单帧最多 64 字节 | 加强版 CAN，一次能带更多数据 |
| [EtherCAT（Ethernet for Control Automation Technology）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 用主从帧处理组织多伺服节点、周期确定的多轴实时以太网 | 传阅接力册，一圈跑完所有关节同步 |
| [分布式时钟（Distributed Clocks）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | EtherCAT 让所有从站共用同一时间基准的机制 | 让所有从站对表，多轴才能同时动作 |
| [DDS（Data Distribution Service）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 按 Topic 发布订阅、支持 QoS 的软件消息中间件 | 机器人内部的广播电台，按主题收发 |
| [踝关节 PR/AB 模式（Ankle PR/AB Mode）](../02-mechanics/01-mechanisms-and-dof.mdx) | G1 低层接口区分踝部驱动方式的模式位（`LowCmd_.mode_pr`）：PR 按 pitch/roll 两个串联关节下发，AB 直接下发 A/B 两个并联电机；它与每个关节自己的使能位 `MotorCmd_.mode` 不是同一个字段 | 脚踝有两种说法：当两个关节，还是当两个电机 |
| [QoS（Quality of Service）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 可靠性、持久性、历史深度、截止时间等消息投递策略 | 给每类消息定投递规矩 |
| [抖动（Jitter）](../03-electrical-embedded/04-real-time-communication-and-buses.mdx) | 周期或消息到达时间相对理想值的变化量 | 数据到得有早有晚 |
| [微控制器（Microcontroller Unit, MCU）](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 把 CPU、存储、定时器、PWM、ADC 和通信外设集成在一颗芯片上 | 控制板上那颗集成了 CPU 和外设的芯片 |
| [实时操作系统（Real-time Operating System, RTOS）](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 提供任务、优先级、队列和定时器、保证截止时间的操作系统 | 给控制板派专人，谁急谁优先 |
| [看门狗（Watchdog）](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 监督任务按时喂狗、超时触发复位或安全状态的硬件机制 | 盯着程序干活的闹钟，卡死就重启 |
| [直接存储器访问（Direct Memory Access, DMA）](../03-electrical-embedded/05-mcu-realtime-embedded-software.mdx) | 在外设和内存之间搬运数据、无需 CPU 逐字节处理的机制 | MCU 的搬运工，数据自己搬进内存 |
| [急停（Emergency Stop, E-stop）](../03-electrical-embedded/06-electrical-safety-and-protection.mdx) | 由人或独立安全回路触发、尽快进入预定义安全状态的功能 | 人人都能拍下去的红按钮 |
## ROS 2 与软件工程

| 术语 | 专业解释 | 一句话听懂 |
| --- | --- | --- |
| [ROS 2（Robot Operating System 2）](../06-software-tools-simulation/01-ros2-software-architecture.md) | 机器人领域主流中间件，提供节点通信、TF、控制和工具生态 | 让各个模块按约定说话的一套东西 |
| [TF2（Transform Library 2）](../06-software-tools-simulation/01-ros2-software-architecture.md) | 维护随时间变化坐标变换树、提供查询的库 | 坐标变换的唯一事实来源 |
| [ros2_control](../06-software-tools-simulation/01-ros2-software-architecture.md) | 把硬件读写和控制算法用显式接口分开的 ROS 2 框架 | 硬件和控制算法中间那层标准接口 |
| [rosbag2](../06-software-tools-simulation/01-ros2-software-architecture.md) | 按 Topic 记录和回放 ROS 2 消息的工具 | 把消息录下来，事后能复盘 |
| [可复现性（Reproducibility）](../06-software-tools-simulation/06-software-engineering-and-versioning.md) | 换机器换时间仍能重跑实验并得到一致结果的性质 | 半年后还能把实验重跑出来 |
