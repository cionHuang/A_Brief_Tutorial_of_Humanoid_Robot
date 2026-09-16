# 外部源码索引

本文件记录手册写作期间用于核对接口、模型和代码片段的上游开源仓库。仓库源码不随本项目发布；正文直接链接到固定提交的 GitHub 文件或目录，并标注仓库、相对路径和许可证。

## 外部资料

| 仓库 | 当前提交 | 许可证 | 主要用途 |
| --- | --- | --- | --- |
| [unitree_sdk2](https://github.com/unitreerobotics/unitree_sdk2) | `9754cd153af3da471b0fe5f3aa535e426fb11db3` | BSD 3-Clause | G1 DDS 消息、`LowCmd_`/`LowState_`、低层控制示例、`rt/lowcmd` 与 `rt/lowstate` |
| [unitree_rl_gym](https://github.com/unitreerobotics/unitree_rl_gym) | `276801e46c5d433564f24658bac64f254b7d2d4b` | BSD 3-Clause（仓库内含 legged_gym 许可） | G1 URDF/MJCF、网格、关节命名和强化学习环境 |
| [ros2_control](https://github.com/ros-controls/ros2_control) | `f1a73f3550c6598ac0691c4ad27211501fcd54e1` | Apache 2.0 | 硬件接口、状态/命令接口、控制器生命周期和资源管理 |
| [pinocchio](https://github.com/stack-of-tasks/pinocchio) | `e2b0d97ab714f8727bf176e2585c679b5be2a125` | BSD 2-Clause | 正逆运动学、Jacobian、RNEA/CRBA/ABA、浮动基座和质心动力学 |
| [moveit2](https://github.com/moveit/moveit2) | `92f23839cc2efe00490bb5bb9f6df7dde96df35e` | BSD 3-Clause | Manipulation、碰撞检测、运动规划、规划组和灵巧手章节 |
| [rclcpp](https://github.com/ros2/rclcpp) | `05de6c894ec33a36e7837aab3b703353deee0adb` | Apache 2.0 | ROS 2 C++ 节点、Publisher/Subscription、参数和执行器 |
| [geometry2](https://github.com/ros2/geometry2) | `2eccfcd2cc118c7fb92ef553022331f8749c0237` | BSD 3-Clause | TF2 坐标变换、Buffer、Listener 和广播器 |
| [mujoco](https://github.com/google-deepmind/mujoco) | `44c118d712db5ca5d8c6264e4a21e3086e2ac952` | Apache 2.0 | MJCF、执行器、接触、传感器和仿真循环 |
| [IsaacLab](https://github.com/isaac-sim/IsaacLab) | `b0542fe2d45bf91c4e1d9ef6952b9c709c80b4e8` | BSD 3-Clause | Manager 化环境（观测/动作/奖励/终止/事件）、G1 速度任务配置、PPO 配置和并行训练 |
| [openvla](https://github.com/openvla/openvla) | `c8f03f48af692657d3060c19588038c7220e9af9` | MIT | VLA 推理、视觉语言输入、动作 token 化和策略调用 |
| [lerobot](https://github.com/huggingface/lerobot) | `fbb811fca92504439792b97d216f0d00c2268382` | Apache 2.0 | 机器人数据集、遥操作、模仿学习和策略部署 |
| [Parallel_Ankle_Joint](https://github.com/feidedao/Parallel_Ankle_Joint) | `1305e884a0ddfde147272985b477952cb1cc4dc6` | MIT | G1 并联踝简化模型的运动学参数、IK 解析解与踝部网格（2.1 节演示；作者声明为个人装配，非官方结构） |

版本记录日期：2026-09-02。表中的提交 SHA 用于生成稳定链接；后续更新资料时应重新核对接口和许可证。

## 代码定位（上游仓库内）

- G1 消息定义：`unitree_sdk2/include/unitree/idl/hg/`
- G1 低层示例：`unitree_sdk2/example/g1/low_level/`
- G1 描述文件：`unitree_rl_gym/resources/robots/g1_description/`
- ROS 2 硬件接口：`ros2_control/hardware_interface/`
- ROS 2 C++ 节点：`rclcpp/rclcpp/`
- TF2：`geometry2/tf2/`、`geometry2/tf2_ros/`
- Pinocchio 算法：`pinocchio/include/pinocchio/algorithm/`
- MoveIt 核心与规划接口：`moveit2/moveit_core/`、`moveit2/moveit_ros/`
- MuJoCo 核心 API：`mujoco/include/mujoco/`、`mujoco/src/`
- Isaac Lab Manager 化环境：`IsaacLab/source/isaaclab_tasks/isaaclab_tasks/manager_based/locomotion/velocity/`
- Isaac Lab G1 任务与 PPO：`.../velocity/config/g1/`、`.../velocity/config/g1/agents/`

## 后续资料

以下仓库与后续章节相关，暂未固定版本：

- [ros2/rclpy](https://github.com/ros2/rclpy)：ROS 2 Python 节点和 Topic 代码片段。

## 更新规则

更新第三方源码前先记录新的提交 SHA，并检查上游许可证是否变化。章节不复制整个仓库，也不把尚未核实的接口字段写成 G1 的确定事实；若示例参数来自某个具体文件，应注明“官方示例配置”，不要泛化为所有硬件的固定规格。
