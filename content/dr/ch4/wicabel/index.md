+++
title = "Wicabel"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Wicabel 使用 `obj_bell_enemy` 对象，由 **6 层部件**组成（使用单个精灵表的不同帧）：

- **精灵表：** `spr_bell_enemy`（帧 1-6，每帧一个层次）
- **饶恕精灵：** `spr_bell_spare`
- **旋转姿势：** `spr_bell_enemy_spin_pose`

## 公式

### 6 层摆动动画

```javascript
animsiner += 1;

// 从外到内绘制（帧 6 → 帧 1）
// 帧 6（最外层）：最快水平摆动
draw_x = x - (sin(animsiner / 3) * 2);

// 帧 5：较慢摆动
draw_x = x - (sin(animsiner / 6) * 2);

// 帧 4：垂直浮动
draw_y = y + (sin(animsiner / 6) * 2);

// 帧 3：反相垂直浮动
draw_y = y - (sin(animsiner / 6) * 2);

// 帧 2：无偏移
// 帧 1（最内层）：水平摆动
draw_x = x + (sin(animsiner / 6) * 2);
```

### 旋转攻击过渡（state 10）

```javascript
// 11 帧过渡序列，Y 轴抖动
// 帧 1: y - 4
// 帧 2: y + 3
// 帧 3: y - 2
// 帧 4: y + 1
// ...

// 第 11 帧时生成旋转攻击对象
if (transitionframe == 11) {
    attack = instance_create(x + 41, y + 45, obj_bell_spin_attack);
}
```

### 闪烁与受伤

```javascript
// 标准闪烁 + 抖动
// tuningactsuccess 追踪调音行为成功次数
```
