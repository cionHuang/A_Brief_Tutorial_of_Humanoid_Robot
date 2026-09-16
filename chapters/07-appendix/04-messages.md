# 附录 C G1 消息接口

本附录列出 G1 低层接口的 7 个 IDL 类型，字段名与类型逐行取自 unitree_sdk2 固定提交 `9754cd153af3da471b0fe5f3aa535e426fb11db3` 的 `include/unitree/idl/hg/` 头文件（`unitree_hg` 系列）。"在 g1_ankle_swing_example.cpp 中"一列只代表**官方 G1 低层踝摆示例**是否访问过该字段；它不代表字段是否有效，也不代表官方所有示例的用法。单位、坐标系、分量顺序与有效标志都以目标固件版本为准（3.2、3.3、3.4 节）。

## LowCmd_

下发一帧低层命令。头文件：`include/unitree/idl/hg/LowCmd_.hpp`。Topic `rt/lowcmd`（例程实测）

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `mode_pr` | uint8_t | PR/AB 模式位（PR=0、AB=1） | 出现 |
| `mode_machine` | uint8_t | 机型编号（例程把状态里的值回填进来） | 出现 |
| `motor_cmd` | MotorCmd[35] | 35 条关节命令（G1 使用前 29 条） | 出现 |
| `reserve` | uint32_t[4] | 预留字段 | 未出现 |
| `crc` | uint32_t | 整帧 CRC32 校验 | 出现 |

## LowState_

回报整机低层状态。头文件：`include/unitree/idl/hg/LowState_.hpp`。Topic `rt/lowstate`（例程实测）

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `version` | uint32_t[2] | 版本号（2 个 32 位） | 未出现 |
| `mode_pr` | uint8_t | 模式字段（与 LowCmd_ 的 mode_pr 同名） | 未出现 |
| `mode_machine` | uint8_t | 机型编号 | 出现 |
| `tick` | uint32_t | 控制周期计数 | 未出现 |
| `imu_state` | IMUState | IMU 状态（IMUState_） | 出现 |
| `motor_state` | MotorState[35] | 35 条关节状态（G1 使用前 29 条） | 出现 |
| `wireless_remote` | uint8_t[40] | 遥控器数据 | 出现 |
| `reserve` | uint32_t[4] | 预留字段 | 未出现 |
| `crc` | uint32_t | 整帧 CRC32 校验 | 出现 |

## MotorCmd_

单个关节的命令，装在 `LowCmd_` 的 `motor_cmd` 数组里。头文件：`include/unitree/idl/hg/MotorCmd_.hpp`。——

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `mode` | uint8_t | 使能位：1=Enable、0=Disable（官方例程注释原文） | 出现 |
| `q` | float | 目标位置 | 出现 |
| `dq` | float | 目标速度 | 出现 |
| `tau` | float | 前馈力矩 | 出现 |
| `kp` | float | 位置增益（刚度） | 出现 |
| `kd` | float | 速度增益（阻尼） | 出现 |
| `reserve` | uint32_t | 预留字段 | 未出现 |

## MotorState_

单个关节的状态，装在 `LowState_` 的 `motor_state` 数组里。头文件：`include/unitree/idl/hg/MotorState_.hpp`。——

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `mode` | uint8_t | 电机模式 / 状态位（语义以固件为准） | 出现 |
| `q` | float | 关节位置 | 出现 |
| `dq` | float | 关节速度 | 出现 |
| `ddq` | float | 关节加速度 | 未出现 |
| `tau_est` | float | 估计力矩（**非实测值**） | 出现 |
| `temperature` | int16_t[2] | 温度（2 路） | 出现 |
| `vol` | float | 电压 | 出现 |
| `sensor` | uint32_t[2] | 传感器状态位（语义以固件为准） | 出现 |
| `motorstate` | uint32_t | 电机状态字（语义以固件为准） | 出现 |
| `reserve` | uint32_t[4] | 预留字段 | 出现 |

## IMUState_

IMU 状态；嵌在 `LowState_` 的 `imu_state` 里。头文件：`include/unitree/idl/hg/IMUState_.hpp`。另有 Topic `rt/secondary_imu`（例程实测，躯干 IMU）

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `quaternion` | float[4] | 姿态四元数（**分量顺序以固件为准**） | 未出现 |
| `gyroscope` | float[3] | 角速度 | 出现 |
| `accelerometer` | float[3] | 加速度（比力，含重力影响） | 未出现 |
| `rpy` | float[3] | 欧拉角 | 出现 |
| `temperature` | int16_t | 温度 | 未出现 |

## BmsState_

电池管理系统状态。头文件：`include/unitree/idl/hg/BmsState_.hpp`。IDL 类型；例程未涉及，Topic 名本书未核实

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `version_high` | uint8_t | 版本号高位 | 未出现 |
| `version_low` | uint8_t | 版本号低位 | 未出现 |
| `fn` | uint8_t | 功能/型号字段（语义以电池包固件为准） | 未出现 |
| `cell_vol` | uint16_t[40] | 40 节电芯的单体电压 | 未出现 |
| `bmsvoltage` | uint32_t[3] | 3 路 BMS 电压 | 未出现 |
| `current` | int32_t | 总电流 | 未出现 |
| `soc` | uint8_t | 剩余电量估计（State of Charge） | 未出现 |
| `soh` | uint8_t | 健康度估计（State of Health） | 未出现 |
| `temperature` | int16_t[12] | 12 路温度 | 未出现 |
| `cycle` | uint16_t | 循环次数 | 未出现 |
| `manufacturer_date` | uint16_t | 生产日期 | 未出现 |
| `bmsstate` | uint32_t[5] | 5 个 32 位状态字（位定义以电池包固件为准） | 未出现 |
| `reserve` | uint32_t[3] | 预留字段 | 未出现 |

## PressSensorState_

足底压力与温度。头文件：`include/unitree/idl/hg/PressSensorState_.hpp`。IDL 类型；例程未涉及，Topic 名本书未核实

| 字段 | 类型 | 含义 | 在 g1_ankle_swing_example.cpp 中 |
| --- | --- | --- | --- |
| `pressure` | float[12] | 12 路压力 | 未出现 |
| `temperature` | float[12] | 12 路温度 | 未出现 |
| `lost` | uint32_t | 丢包 / 失效计数 | 未出现 |
| `reserve` | uint32_t | 预留字段 | 未出现 |

## 使用这些字段时的四条纪律

- **模式位与使能位不是一回事**：PR/AB 在 `LowCmd_.mode_pr`，逐关节的 `MotorCmd_.mode` 是使能位（1=Enable、0=Disable）。
- **数组容量 ≠ 实际关节数**：`motor_cmd` / `motor_state` 长度 35，G1 使用前 29 条；照抄"G1_NUM_MOTOR"这类常量前先确认机型。
- **估计值不是实测值**：`tau_est` 是估计力矩；`IMUState_.quaternion` 的分量顺序、`rpy` 的轴序都要与固件核对。
- **写了 CRC 才不会被丢弃**：`LowCmd_.crc` 是整帧校验，写错会静默丢弃（3.6 节）。

## 参考资料

[1] Unitree Robotics. *unitree_sdk2: Unitree robot SDK version 2*. 固定提交 `9754cd153af3da471b0fe5f3aa535e426fb11db3`；7 个类型的字段名与类型取自 `include/unitree/idl/hg/` 下的 `LowCmd_.hpp`、`LowState_.hpp`、`MotorCmd_.hpp`、`MotorState_.hpp`、`IMUState_.hpp`、`BmsState_.hpp`、`PressSensorState_.hpp`；"是否出现"一列与 Topic 名取自 `example/g1/low_level/g1_ankle_swing_example.cpp`。<https://github.com/unitreerobotics/unitree_sdk2/tree/9754cd153af3da471b0fe5f3aa535e426fb11db3/include/unitree/idl/hg>
