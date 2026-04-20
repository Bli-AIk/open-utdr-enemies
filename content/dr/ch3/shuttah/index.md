+++
title = "Shuttah"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 8
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Shuttah 使用 `obj_shutta_enemy` 对象，拥有**姿势系统**（类似 El Niña）：

- **待机精灵：** `spr_shutta_idle`
- **受伤精灵：** `spr_shutta_hurt`
- **姿势精灵组：** 多种预设姿势

## 公式

### 姿势系统

```javascript
// pose 变量控制当前显示的姿势帧
// 每个姿势是精灵表中的不同帧组合

switch (pose) {
    case 0: thissprite = spr_shutta_idle; break;
    case 1: thissprite = spr_shutta_pose1; break;
    case 2: thissprite = spr_shutta_pose2; break;
    // 更多姿势...
}

draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 待机摆动

```javascript
// 标准帧率 + 轻微上下浮动
siner += 1;
bob_y = sin(siner / 8) * 2;
draw_sprite_ext(thissprite, siner / 5, x, y + bob_y, 2, 2, 0, image_blend, 1);
```

### 闪烁与受伤

```javascript
// 标准闪烁 + 抖动
```
