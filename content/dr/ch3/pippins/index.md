+++
title = "Pippins (皮平斯)"
description = "DELTARUNE enemy animation analysis - Pippins"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 4
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Pippins 使用 `obj_pippins_enemy` 对象，由**单个精灵**构成，拥有**攻击冲刺动画**：

- **待机精灵：** `spr_pippins_idle`
- **受伤精灵：** `spr_pippins_hurt`
- **饶恕精灵：** `spr_pippins_spare`
- **蓄力精灵：** `spr_pippins_prepare`
- **旋转精灵：** sprite 54

## 公式

### 待机动画

```javascript
// 变速帧率
// 正常：image_speed = 0.25
// 接近饶恕上限时：image_speed = 1/3
```

### 攻击动画序列（attackanimcon 状态机）

```javascript
// attackanim 开启后进入 3 阶段攻击
// attackanimindex 以 2/3 帧递增

// attackanimcon 0: 冲刺蓄力（speed = 10, friction = 1）
// attackanimcon 1: 旋转/弹射（speed = -10，反向冲刺）
// attackanimcon 2: 回归待机
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
```
