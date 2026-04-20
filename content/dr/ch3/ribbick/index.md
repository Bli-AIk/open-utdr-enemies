+++
title = "Ribbick"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 5
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Ribbick 使用 `obj_ribbick_enemy` 对象，是 Rabbick 的 Ch3 变体：

- **待机精灵：** `spr_ribbick_Idle`
- **受伤精灵：** `spr_ribbick_hurt2`
- **饶恕精灵：** `spr_ribbick_spare`
- **缩小精灵：** `spr_ribbick_small`（被吹飞后的缩小状态）
- **Rabbick 替代：** `spr_rabbick_enemy_spared`（`amirabbick` 标记时使用）

## 公式

### 吹飞变形

```javascript
// 与 Rabbick 类似的 blown 机制
// 但 Ribbick 有多帧变形（blowanimtimer > 6 时不同逻辑）
if (blowanimtimer > 6)
    // 使用 spr_ribbick_small
else
    // 根据缩放程度选择帧
```

### 抖动系统

```javascript
// 多阶段递减抖动（与 Rabbick 相同）
// shakeamt 每帧递减
// 每 0.5 步交替 ashake 正负
if (onoff == 0) ashake = -shakeamt;
if (onoff == 1) {
    ashake = shakeamt;
    if (shakeamt > 0) shakeamt -= 1;
}
```

### 特殊状态

```javascript
revealed = 0;    // 是否被揭示
beenblown = 0;   // 是否被吹过
amirabbick = 0;  // 替代为 Rabbick 精灵集
```
