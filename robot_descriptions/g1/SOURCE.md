# Unitree G1 描述文件

本目录提取自 Unitree 官方仓库 [`unitree_rl_gym`](https://github.com/unitreerobotics/unitree_rl_gym) 的 `resources/robots/g1_description`。

- 原始目录：https://github.com/unitreerobotics/unitree_rl_gym/tree/main/resources/robots/g1_description
- 下载分支：`main`
- 下载日期：2026-09-01
- 上游仓库许可证：BSD 3-Clause（模型和网格重新分发前请核对上游最新许可声明）

## 当前保留的模型

- `g1_29dof.urdf` / `g1_29dof.xml`：默认无灵巧手模型；
- `g1_29dof_lock_waist.urdf` / `g1_29dof_lock_waist.xml`：锁腰参考模型；
- `g1_29dof_with_hand.urdf` / `g1_29dof_with_hand.xml`：带手模型，用于 manipulation/VLA 章节；
- `scene.xml`：MuJoCo 场景入口。

URDF/MJCF 依赖 `meshes/` 下的 STL 文件，请保持目录结构不变。其他 DoF、rev_1_0 和双臂变体暂未纳入当前教学版本。

