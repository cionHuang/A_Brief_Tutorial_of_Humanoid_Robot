# 附录 C G1 关节索引

本表按 Unitree SDK2 的 `enum G1JointIndex` 顺序列出 G1 29 DoF 机体的 29 个驱动关节；关节名、关节轴与限位取自本手册使用的 URDF。两套顺序经脚本逐项比对**完全一致**（索引来自 SDK，几何与限位来自模型文件）。

## 机体 29 个驱动关节

| 索引 | 关节名（URDF） | 部位 | 关节轴 | 限位（rad） | 限位（°） | 锁腰变体 | 带手变体 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | `left_hip_pitch_joint` | 左腿 | `0 1 0` | -2.5307 ~ 2.8798 | -145.0 ~ 165.0 | 活动 | 存在 |
| 1 | `left_hip_roll_joint` | 左腿 | `1 0 0` | -0.5236 ~ 2.9671 | -30.0 ~ 170.0 | 活动 | 存在 |
| 2 | `left_hip_yaw_joint` | 左腿 | `0 0 1` | -2.7576 ~ 2.7576 | -158.0 ~ 158.0 | 活动 | 存在 |
| 3 | `left_knee_joint` | 左腿 | `0 1 0` | -0.0873 ~ 2.8798 | -5.0 ~ 165.0 | 活动 | 存在 |
| 4 | `left_ankle_pitch_joint` | 左腿 | `0 1 0` | -0.8727 ~ 0.5236 | -50.0 ~ 30.0 | 活动 | 存在 |
| 5 | `left_ankle_roll_joint` | 左腿 | `1 0 0` | -0.2618 ~ 0.2618 | -15.0 ~ 15.0 | 活动 | 存在 |
| 6 | `right_hip_pitch_joint` | 右腿 | `0 1 0` | -2.5307 ~ 2.8798 | -145.0 ~ 165.0 | 活动 | 存在 |
| 7 | `right_hip_roll_joint` | 右腿 | `1 0 0` | -2.9671 ~ 0.5236 | -170.0 ~ 30.0 | 活动 | 存在 |
| 8 | `right_hip_yaw_joint` | 右腿 | `0 0 1` | -2.7576 ~ 2.7576 | -158.0 ~ 158.0 | 活动 | 存在 |
| 9 | `right_knee_joint` | 右腿 | `0 1 0` | -0.0873 ~ 2.8798 | -5.0 ~ 165.0 | 活动 | 存在 |
| 10 | `right_ankle_pitch_joint` | 右腿 | `0 1 0` | -0.8727 ~ 0.5236 | -50.0 ~ 30.0 | 活动 | 存在 |
| 11 | `right_ankle_roll_joint` | 右腿 | `1 0 0` | -0.2618 ~ 0.2618 | -15.0 ~ 15.0 | 活动 | 存在 |
| 12 | `waist_yaw_joint` | 腰部 | `0 0 1` | -2.6180 ~ 2.6180 | -150.0 ~ 150.0 | 活动 | 存在 |
| 13 | `waist_roll_joint` | 腰部 | `1 0 0` | -0.5200 ~ 0.5200 | -29.8 ~ 29.8 | **固定** | 存在 |
| 14 | `waist_pitch_joint` | 腰部 | `0 1 0` | -0.5200 ~ 0.5200 | -29.8 ~ 29.8 | **固定** | 存在 |
| 15 | `left_shoulder_pitch_joint` | 左臂 | `0 1 0` | -3.0892 ~ 2.6704 | -177.0 ~ 153.0 | 活动 | 存在 |
| 16 | `left_shoulder_roll_joint` | 左臂 | `1 0 0` | -1.5882 ~ 2.2515 | -91.0 ~ 129.0 | 活动 | 存在 |
| 17 | `left_shoulder_yaw_joint` | 左臂 | `0 0 1` | -2.6180 ~ 2.6180 | -150.0 ~ 150.0 | 活动 | 存在 |
| 18 | `left_elbow_joint` | 左臂 | `0 1 0` | -1.0472 ~ 2.0944 | -60.0 ~ 120.0 | 活动 | 存在 |
| 19 | `left_wrist_roll_joint` | 左臂 | `1 0 0` | -1.9722 ~ 1.9722 | -113.0 ~ 113.0 | 活动 | 存在 |
| 20 | `left_wrist_pitch_joint` | 左臂 | `0 1 0` | -1.6144 ~ 1.6144 | -92.5 ~ 92.5 | 活动 | 存在 |
| 21 | `left_wrist_yaw_joint` | 左臂 | `0 0 1` | -1.6144 ~ 1.6144 | -92.5 ~ 92.5 | 活动 | 存在 |
| 22 | `right_shoulder_pitch_joint` | 右臂 | `0 1 0` | -3.0892 ~ 2.6704 | -177.0 ~ 153.0 | 活动 | 存在 |
| 23 | `right_shoulder_roll_joint` | 右臂 | `1 0 0` | -2.2515 ~ 1.5882 | -129.0 ~ 91.0 | 活动 | 存在 |
| 24 | `right_shoulder_yaw_joint` | 右臂 | `0 0 1` | -2.6180 ~ 2.6180 | -150.0 ~ 150.0 | 活动 | 存在 |
| 25 | `right_elbow_joint` | 右臂 | `0 1 0` | -1.0472 ~ 2.0944 | -60.0 ~ 120.0 | 活动 | 存在 |
| 26 | `right_wrist_roll_joint` | 右臂 | `1 0 0` | -1.9722 ~ 1.9722 | -113.0 ~ 113.0 | 活动 | 存在 |
| 27 | `right_wrist_pitch_joint` | 右臂 | `0 1 0` | -1.6144 ~ 1.6144 | -92.5 ~ 92.5 | 活动 | 存在 |
| 28 | `right_wrist_yaw_joint` | 右臂 | `0 0 1` | -1.6144 ~ 1.6144 | -92.5 ~ 92.5 | 活动 | 存在 |

说明：

- “锁腰变体”列取自 `g1_29dof_lock_waist.urdf`：只有 `waist_roll_joint`、`waist_pitch_joint` 的关节类型由 `revolute` 变为 `fixed`（本表标 **固定**），其余 27 个仍为 `revolute`；被固定的关节不再贡献自由度。
- “带手变体”列取自 `g1_29dof_with_hand.urdf`：29 个机体关节全部存在，因此该列取值均为“存在”；真正的差异是额外增加的 14 个手指关节（见下一张表）。
- 关节轴写在模型坐标系里：`0 1 0` = 绕 y 轴（pitch）、`1 0 0` = 绕 x 轴（roll）、`0 0 1` = 绕 z 轴（yaw）；正方向按右手定则，零位以模型文件为准。角度换算按 1 rad = 57.2958°。
- 表中的限位是**模型 `limit` 字段**的取值，不代表真机实测能力上限（见 2.1、2.5 节）。

## SDK 索引别名（同一索引、两套名字）

| SDK 名字 | 别名 | 索引 | 部位 | 对应 URDF 关节 |
| --- | --- | --- | --- | --- |
| `LeftAnkleB` | `LeftAnklePitch` | 4 | 左腿 | `left_ankle_pitch_joint` |
| `LeftAnkleA` | `LeftAnkleRoll` | 5 | 左腿 | `left_ankle_roll_joint` |
| `RightAnkleB` | `RightAnklePitch` | 10 | 右腿 | `right_ankle_pitch_joint` |
| `RightAnkleA` | `RightAnkleRoll` | 11 | 右腿 | `right_ankle_roll_joint` |
| `WaistA` | `WaistRoll` | 13 | 腰部 | `waist_roll_joint` |
| `WaistB` | `WaistPitch` | 14 | 腰部 | `waist_pitch_joint` |

说明：别名同样出自 `enum G1JointIndex`。踝部的 A/B 与 PR/AB 驱动模式的关系见 [2.1 节](../02-mechanics/01-mechanisms-and-dof.mdx#两种驱动模式怎么下发pr-与-ab)；照抄例程前先确认当前模式用的是哪套名字。

## SDK 索引注释（哪些编号在别的变体上无效）

| 索引 | SDK 名字 | 注释（原文） |
| --- | --- | --- |
| 13 | `WaistRoll` | NOTE INVALID for g1 23dof/29dof with waist locked |
| 13 | `WaistA` | NOTE INVALID for g1 23dof/29dof with waist locked |
| 14 | `WaistPitch` | NOTE INVALID for g1 23dof/29dof with waist locked |
| 14 | `WaistB` | NOTE INVALID for g1 23dof/29dof with waist locked |
| 20 | `LeftWristPitch` | NOTE INVALID for g1 23dof |
| 21 | `LeftWristYaw` | NOTE INVALID for g1 23dof |
| 27 | `RightWristPitch` | NOTE INVALID for g1 23dof |

## 手指关节（`g1_29dof_with_hand.urdf`，共 14 个）

| # | 关节名 | 手 | 手指 | 关节轴 | 限位（rad） | 限位（°） | effort（N·m） | velocity（rad/s） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `left_hand_thumb_0_joint` | 左手 | 拇指 | `0 1 0` | -1.04720 ~ 1.04720 | -60.0 ~ 60.0 | 2.45 | 6.857 |
| 2 | `left_hand_thumb_1_joint` | 左手 | 拇指 | `0 0 1` | -0.72431 ~ 1.04720 | -41.5 ~ 60.0 | 1.4 | 12 |
| 3 | `left_hand_thumb_2_joint` | 左手 | 拇指 | `0 0 1` | 0.00000 ~ 1.74533 | 0.0 ~ 100.0 | 1.4 | 12 |
| 4 | `left_hand_middle_0_joint` | 左手 | 中指 | `0 0 1` | -1.57080 ~ 0.00000 | -90.0 ~ 0.0 | 1.4 | 12 |
| 5 | `left_hand_middle_1_joint` | 左手 | 中指 | `0 0 1` | -1.74533 ~ 0.00000 | -100.0 ~ 0.0 | 1.4 | 12 |
| 6 | `left_hand_index_0_joint` | 左手 | 食指 | `0 0 1` | -1.57080 ~ 0.00000 | -90.0 ~ 0.0 | 1.4 | 12 |
| 7 | `left_hand_index_1_joint` | 左手 | 食指 | `0 0 1` | -1.74533 ~ 0.00000 | -100.0 ~ 0.0 | 1.4 | 12 |
| 8 | `right_hand_thumb_0_joint` | 右手 | 拇指 | `0 1 0` | -1.04720 ~ 1.04720 | -60.0 ~ 60.0 | 2.45 | 6.857 |
| 9 | `right_hand_thumb_1_joint` | 右手 | 拇指 | `0 0 1` | -1.04720 ~ 0.72431 | -60.0 ~ 41.5 | 1.4 | 12 |
| 10 | `right_hand_thumb_2_joint` | 右手 | 拇指 | `0 0 1` | -1.74533 ~ 0.00000 | -100.0 ~ 0.0 | 1.4 | 12 |
| 11 | `right_hand_middle_0_joint` | 右手 | 中指 | `0 0 1` | 0.00000 ~ 1.57080 | 0.0 ~ 90.0 | 1.4 | 12 |
| 12 | `right_hand_middle_1_joint` | 右手 | 中指 | `0 0 1` | 0.00000 ~ 1.74533 | 0.0 ~ 100.0 | 1.4 | 12 |
| 13 | `right_hand_index_0_joint` | 右手 | 食指 | `0 0 1` | 0.00000 ~ 1.57080 | 0.0 ~ 90.0 | 1.4 | 12 |
| 14 | `right_hand_index_1_joint` | 右手 | 食指 | `0 0 1` | 0.00000 ~ 1.74533 | 0.0 ~ 100.0 | 1.4 | 12 |

说明：手指关节**不在**上面的 `G1JointIndex`（0–28）里；其索引与接口以 unitree_sdk2 的 `HandCmd_` / `HandState_` 定义为准，本手册不分发手指索引。每只手 7 个自由度（拇指 3 + 食指 2 + 中指 2），双手共 14 个，因此带手模型的整机动作维度是 29 + 14。

## 模型 limit 中的力矩与速度上限（按取值分组）

| effort / velocity | 关节数 | 包含关节（去掉 `_joint` 后缀） |
| --- | --- | --- |
| 88 N·m / 32 rad/s | 7 | left_hip_pitch、left_hip_roll、left_hip_yaw、right_hip_pitch、right_hip_roll、right_hip_yaw、waist_yaw |
| 139 N·m / 20 rad/s | 2 | left_knee、right_knee |
| 50 N·m / 37 rad/s | 6 | left_ankle_pitch、left_ankle_roll、right_ankle_pitch、right_ankle_roll、waist_roll、waist_pitch |
| 25 N·m / 37 rad/s | 10 | left_shoulder_pitch、left_shoulder_roll、left_shoulder_yaw、left_elbow、left_wrist_roll、right_shoulder_pitch、right_shoulder_roll、right_shoulder_yaw、right_elbow、right_wrist_roll |
| 5 N·m / 22 rad/s | 4 | left_wrist_pitch、left_wrist_yaw、right_wrist_pitch、right_wrist_yaw |

说明：这一组数字同样是**模型 `limit` 字段**的取值，属仿真/模型参数，**不等于真机的峰值或持续输出能力**——真机的持续输出还受温升、驱动器限流与传动效率约束（见 2.3 节与 6.2 节）。

## 参考资料

[1] Unitree Robotics. *unitree_sdk2: Unitree robot SDK version 2*. 固定提交 `9754cd153af3da471b0fe5f3aa535e426fb11db3`；索引顺序、别名与索引注释取自 `example/g1/low_level/g1_ankle_swing_example.cpp` 的 `enum G1JointIndex`。<https://github.com/unitreerobotics/unitree_sdk2/blob/9754cd153af3da471b0fe5f3aa535e426fb11db3/example/g1/low_level/g1_ankle_swing_example.cpp>

[2] Unitree Robotics. *unitree_rl_gym: G1 robot description*. 固定提交 `276801e46c5d433564f24658bac64f254b7d2d4b`；关节名、关节轴、限位与 effort/velocity 取自 `resources/robots/g1_description/` 下的 `g1_29dof.urdf`、`g1_29dof_lock_waist.urdf`、`g1_29dof_with_hand.urdf`，本仓库副本位于 `robot_descriptions/g1/`。<https://github.com/unitreerobotics/unitree_rl_gym/tree/276801e46c5d433564f24658bac64f254b7d2d4b/resources/robots/g1_description>
