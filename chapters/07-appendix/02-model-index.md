# 附录 B G1 模型文件索引

本表列出本手册随仓库保留的 G1 描述文件。全部文件来自 unitree_rl_gym 固定提交 `276801e46c5d433564f24658bac64f254b7d2d4b` 的 `resources/robots/g1_description/`，在本仓库的副本位于 `robot_descriptions/g1/`（下载分支、日期与许可见该目录的 `SOURCE.md`）。

## 保留的模型文件

| 文件 | 格式 | 用途 | 驱动关节（DoF） | 腰部配置 | 手部配置 | 引用的网格 |
| --- | --- | --- | --- | --- | --- | --- |
| `g1_29dof.urdf` | URDF | 系统总览、机械、电气、算法各章的默认模型 | **29**（另有 10 个 fixed joint） | `waist_yaw` / `waist_roll` / `waist_pitch` 三轴均可动 | 无（末端为固定橡胶手） | 36 个 STL |
| `g1_29dof_lock_waist.urdf` | URDF | 锁腰对比（[4.6 节](../04-cerebellum-realtime-control/06-balance-and-whole-body-control.mdx)） | **27** | 仅 `waist_yaw` 可动；`waist_roll`/`waist_pitch` 为 fixed | 无 | 36 个 STL |
| `g1_29dof_with_hand.urdf` | URDF | 双臂操作、灵巧手与 VLA（5.4、[5.6 节](../05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai.mdx)） | **43** = 29 + 14 | 三轴均可动 | 每手 7（拇指 3 + 食指 2 + 中指 2），双手 14 | 50 个 STL |
| `g1_29dof.xml` | MJCF | MuJoCo 仿真默认模型（[6.2 节](../06-software-tools-simulation/02-mujoco.mdx)） | 29 个 `<motor>` 执行器 | 三轴均可动 | 无 | 36 个 STL |
| `g1_29dof_lock_waist.xml` | MJCF | 锁腰仿真对比 | 27 个 `<motor>` | 仅 `waist_yaw` | 无 | 36 个 STL |
| `g1_29dof_with_hand.xml` | MJCF | 带手仿真 | 43 个 `<motor>` | 三轴均可动 | 14 个手指关节 | 50 个 STL |
| `scene.xml` | MJCF 场景 | 地面、光照与视角入口，用 `include` 拼入机器人模型 | —— | —— | —— | —— |

说明：

- 三个 MJCF 都用 `<compiler angle="radian" meshdir="meshes"/>`，即角度单位为弧度、网格相对当前文件解析；移动文件时必须保持 `meshes/` 的相对位置（[6.2 节](../06-software-tools-simulation/02-mujoco.mdx)）。
- 三个 MJCF 都含自由基座 `floating_base_joint`（类型 `free`）与 4 个 IMU 仿真传感器（`imu_in_pelvis`、`imu_in_torso` 两个 site 各 1 个 gyro + 1 个 accelerometer）。按“自由基座位置 7、速度 6，加驱动关节数”推算：`g1_29dof` 为 nq 36 / nv 35 / nu 29，`g1_29dof_lock_waist` 为 34 / 33 / 27，`g1_29dof_with_hand` 为 50 / 49 / 43。
- **`scene.xml` 的 include 写的是 `g1_12dof.xml`，该文件不在本仓库**——使用前必须改成目标模型文件名（[6.2 节](../06-software-tools-simulation/02-mujoco.mdx)的加载检查清单专门讲了这一点）。
- 关节索引、轴向与限位见[附录 C](./03-joint-index.md)；每条消息的字段见[附录 D](./04-messages.md)。
- 本仓库 `meshes/` 目录共 53 个 STL，上表“引用的网格”是各描述文件实际用到的子集；`images/` 目录提供 `g1_29dof.png` 与 `g1_29dof_with_hand.png` 两张示意图（供上游 README 引用）。
- 网站侧由 `site/scripts/sync-robot-assets.mjs` 把 `g1_29dof.urdf`、`g1_29dof_lock_waist.urdf` 及其引用的网格同步到 `site/public/models/g1/`，供 [1.2 节](../01-system-overview/02-humanoid-robot-anatomy.mdx)的 G1 URDF 查看器在浏览器里加载。

## 未纳入本教学版本的变体（取自上游 README 的变体表）

上表之外的变体本仓库没有保留，只在上游仓库中提供。下表逐行摘自 `robot_descriptions/g1/README.md`（同一固定提交），供读者按机型核对：

| MJCF/URDF file name           | `mode_machine` | Hip roll reduction ratio | Update status | dof#leg | dof#waist | dof#arm | dof#hand |
| ----------------------------- | :------------: | :----------------------: | ------------- | :-----: | :-------: | :-----: | :------: |
| `g1_23dof`                    |       1        |           14.5           | Beta          |   6*2   |     1     |   5*2   |    0     |
| `g1_29dof`                    |       2        |           14.5           | Beta          |   6*2   |     3     |   7*2   |    0     |
| `g1_29dof_with_hand`          |       2        |           14.5           | Beta          |   6*2   |     3     |   7*2   |   7*2    |
| `g1_29dof_lock_waist`         |       3        |           14.5           | Beta          |   6*2   |     1     |   7*2   |    0     |
| `g1_23dof_rev_1_0`            |       4        |           22.5           | Up-to-date    |   6*2   |     1     |   5*2   |    0     |
| `g1_29dof_rev_1_0`            |       5        |           22.5           | Up-to-date    |   6*2   |     3     |   7*2   |    0     |
| `g1_29dof_with_hand_rev_1_0`  |       5        |           22.5           | Up-to-date    |   6*2   |     3     |   7*2   |   7*2    |
| `g1_29dof_lock_waist_rev_1_0` |       6        |           22.5           | Up-to-date    |   6*2   |     1     |   7*2   |    0     |
| `g1_dual_arm`                 |       9        |           null           | Up-to-date    |    0    |     0     |   7*2   |    0     |

说明：`mode_machine` 是固件用来区分机型的编号；`rev_1_0` 系列使用 22.5 的髋 roll 减速比，其余为 14.5。本手册统一使用 `g1_29dof` 系列三个变体（见 [1.2 节](../01-system-overview/02-humanoid-robot-anatomy.mdx)的变体对照表），其余变体**未纳入本教学版本**。

## 参考资料

[1] Unitree Robotics. *unitree_rl_gym: G1 robot description*. 固定提交 `276801e46c5d433564f24658bac64f254b7d2d4b`；本附录的文件清单、关节数、网格引用与 `scene.xml` 内容均取自该提交的 `resources/robots/g1_description/`（本仓库副本：`robot_descriptions/g1/`）。<https://github.com/unitreerobotics/unitree_rl_gym/tree/276801e46c5d433564f24658bac64f254b7d2d4b/resources/robots/g1_description>

[2] 本仓库 `robot_descriptions/g1/SOURCE.md`：下载分支 `main`、下载日期 2026-09-01、上游许可 BSD 3-Clause；本仓库 `third_party/README.md` 记录同一固定提交的 SHA 与许可证。
