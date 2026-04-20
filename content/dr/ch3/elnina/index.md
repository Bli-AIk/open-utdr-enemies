+++
title = "Elnina (厄尔尼娜)"
description = "DELTARUNE enemy animation analysis - Elnina"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Elnina 使用 `obj_elnina_enemy` 对象，由 **7 个身体部件**组成，拥有 **4 种姿势状态**：

- **发丝**
- **腰部**
- **右臂 + 右手**
- **头部**
- **左臂 + 左手**
- **裙摆**

另有 Rouxls 版本 `obj_elnina_enemy_rouxls`（姿势 -1，面朝右）。

## 公式

### 身体弹跳与发丝摆动

```javascript
animsiner += 1;

// 发丝水平摆动
hair_x = sin(animsiner / 12) * 2;

// 身体弹跳（绝对值正弦——只向下弹）
boby = abs(sin(animsiner / 6) * -2) * -1;

// 各部件的弹跳倍率不同：
// 发丝：boby * 1.5
// 裙摆：boby * 1（基准）
// 左臂：boby * 4（最大幅度）
// 头部：boby * 1
```

### 4 种姿势系统

```javascript
// pose 0: 完整待机——绘制全部 7 个部件
// pose 1-2: "酷" 姿势——使用 spr_elnina_cool2
//   poseindex 在 0-2 间以 0.25/帧递增
// pose 3: 替代待机（减弱弹跳）
```

### 对话嘴型

```javascript
// 对话时头部精灵帧以 0.16666.../帧递增
if (talking == 1)
    headframe += 0.16666666666666666;
```

### 闪烁效果

```javascript
// 所有 7 个部件逐一绘制闪烁覆盖层
flash_alpha = (-cos(fsiner / 5) * 0.4) + 0.6;
// 使用 draw_sprite_ext_flash 而非 d3d_set_fog
```
