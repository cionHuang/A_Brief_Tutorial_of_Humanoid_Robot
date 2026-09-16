# 6.3 Isaac Sim 与 Isaac Lab

## 先看一个现场问题

用单机 MuJoCo 训 G1 行走策略，一晚上只跑了几千万步，收敛遥遥无期；换到 Isaac Lab 开了 4096 个并行环境，训练吞吐上来了，但训出的策略回 MuJoCo 做 Sim2Sim 验证时直接摔倒。想加相机做视觉在环训练，一开 RTX 渲染，环境吞吐掉了一半以上。还有人把 URDF 直接导入 Isaac Sim，机器人加载出来了，关节方向和惯量却和官方 MJCF 对不上。

现场通常会这样问：

> “并行几千个环境到底图什么？同一个 G1，为什么换个仿真器策略就失效？开相机为什么会让训练变慢这么多？”

Isaac Sim 是 NVIDIA 基于 Omniverse 构建的 GPU 高保真仿真器，Isaac Lab 是建立在其上的机器人学习框架。[4][5] 它和 6.2 节 MuJoCo 的分工可以一句话说清：MuJoCo 擅长单机精确的接触仿真与部署验证，Isaac 系列擅长数千环境并行的强化学习训练和视觉在环（Vision-in-the-Loop）训练。

## USD 与资产

### USD 场景描述

Isaac Sim 的场景格式是 USD（Universal Scene Description）：一种支持分层、引用和组合的场景描述系统，场景中的元素称为 Prim，整个场景称为 Stage。[1] 对机器人工程师而言，USD 最实际的特性是组合（Composition）：机器人、环境、传感器可以各自是独立资产，按层叠加成最终场景，改一层不动其他层。

### 从 URDF/MJCF 到 USD

G1 进入 Isaac Sim 走导入器：URDF Importer 或 MJCF Importer 把模型转换成 USD 资产。转换不是无损的，导入后必须逐项核对：关节轴线与正负方向、限位、惯量参数、碰撞网格、执行器增益。开头"关节方向和惯量对不上"，多数发生在这一步——不同导入器版本对 URDF 关节约定和网格缩放的处理有差异。核对的标准答案永远是从官方源文件（2.5 节、6.2 节）重新计算，而不是在两个转换结果之间互相对照。[6]

### 传感器与渲染

Isaac Sim 的相机走 RTX 光线追踪渲染，能输出 RGB、深度、分割和光流，画质足以做 Sim2Real 的视觉训练；接触传感器和 IMU 也由 GPU 并行计算。代价正是开头观察到的吞吐下降：渲染是 GPU 上最贵的环节，视觉在环训练常用平铺渲染（Tiled Rendering）等技术把多个环境的相机画面合并成一次渲染调用，换取吞吐。[4]

## Isaac Lab 的强化学习环境

### 把 MDP 拆成 Manager

Isaac Lab 把 5.5 节的 MDP 要素工程化为一组管理器（Manager）：观测管理器（Observation Manager）拼装观测向量，动作管理器（Action Manager）把策略输出映射到关节目标或力矩，奖励管理器（Reward Manager）把奖励拆成带权重的独立项，终止管理器（Termination Manager）判定 episode 结束，事件管理器（Event Manager）负责域随机化和外部扰动。[3][4] 这套拆分的价值在于可组合：换一个奖励项、加一种随机化，只改配置不改框架。

### 并行训练

Isaac 的核心优势是把物理仿真、渲染和策略前向都放在 GPU 上，数千个环境并行 rollout，省掉 CPU-GPU 之间的数据往返。[2] 开头"一晚上几千万步 vs 4096 环境"的差距就来自这里。工程权衡也随之而来：显存限制环境数和相机分辨率；物理并行度受接触复杂度影响；并行训练用的物理参数（如接触求解迭代数）常为了吞吐而放松，这本身就是 Sim2Sim 差异的一个来源。

## 与 MuJoCo 和 ROS 2 工具链的分工

| 需求 | 首选工具 | 理由 |
| --- | --- | --- |
| 单机精确接触仿真、部署前验证 | MuJoCo（6.2 节） | 接触模型成熟，API 轻量，与部署代码同源 |
| 大规模 RL 训练 | Isaac Lab | GPU 并行数千环境 |
| 视觉在环训练 | Isaac Sim/Lab | RTX 渲染与分割标注 |
| ROS 2 集成、传感器插件生态 | Gazebo/RViz 2（6.4 节） | 与 ROS 2 消息和 TF 原生衔接 |
| 运动学/动力学算法计算 | Pinocchio/Drake（6.5 节） | 库而非仿真器，嵌入自己的代码 |

工具选择经常比算法选择更影响进度。一个常见误区是用并行训练环境做最终验证：吞吐优化的物理参数让训练环境本身成为最"宽松"的仿真器，验证应始终在与训练不同的环境里进行。

## 参考资料

[1] Pixar Animation Studios. *Universal Scene Description Documentation*. USD 的 Prim、Stage 与组合机制官方文档。<https://openusd.org/release/index.html>

[2] Makoviychuk, V., et al. “Isaac Gym: High Performance GPU-Based Physics Simulation for Robot Learning.” *NeurIPS Datasets and Benchmarks*, 2021. GPU 端到端并行仿真的奠基工作。<https://arxiv.org/abs/2108.10470>

[3] Mittal, M., et al. “Orbit: A Unified Simulation Framework for Interactive Robot Learning Environments.” *IEEE Robotics and Automation Letters*, 2023. Isaac Lab 前身 Orbit 的 Manager 化环境框架。<https://doi.org/10.1109/LRA.2023.3270034>

[4] NVIDIA. *Isaac Lab Documentation*. 环境管理器、并行训练、G1 任务与平铺渲染的官方文档；IsaacLab 在本书 third_party 索引中暂未固定版本，使用时以所安装版本为准。<https://isaac-sim.github.io/IsaacLab/>

[5] NVIDIA. *Isaac Sim Documentation*. USD 资产管线、URDF/MJCF 导入器与 RTX 传感器官方文档。<https://docs.isaacsim.omniverse.nvidia.com/>

[6] Unitree Robotics. *unitree_rl_gym: G1 robot description*. 官方 G1 URDF/MJCF 模型；本文使用提交 `276801e46c5d433564f24658bac64f254b7d2d4b`，作为 Isaac 侧 USD 资产转换的核对基准。<https://github.com/unitreerobotics/unitree_rl_gym/tree/276801e46c5d433564f24658bac64f254b7d2d4b/resources/robots/g1_description>
