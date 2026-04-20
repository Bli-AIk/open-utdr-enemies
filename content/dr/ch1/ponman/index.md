+++
title = "Ponman (棋子人)"
description = "DELTARUNE enemy animation analysis - Ponman"
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

Ponman 使用 `obj_ponman_enemy` 对象，由**身体 + 眼球**两部分组成：

- **身体：** `spr_ponman_idle`（静态单帧）
- **眼球：** `spr_ponman_eye`（独立绘制，可移动）
- **出现精灵：** `spr_ponman_appear`（催眠状态使用）

## 公式

### 待机绘制

```javascript
// Ponman 的身体是静态的（image_speed = 0）
// 重点在于眼球的独立运动
thissprite = spr_ponman_idle;
draw_sprite_ext(thissprite, image_index, x, y, 2, 2, 0, image_blend, 1);

// 眼球以偏移量绘制在身体上方
// eyex, eyey 由 eye_angle 和 eye_radius 驱动
if (sleeping == 0)
    draw_sprite_ext(spr_ponman_eye, 0,
        x + 28 + eyex, y + 32 + eyey, 2, 2, 0, c_white, 1);
```

### 催眠状态

```javascript
// 催眠时使用 spr_ponman_appear 并逆序播放帧
if (sleeping == 1) {
    thissprite = spr_ponman_appear;
    this_index = sleep_index;

    // sleep_index 从 5 开始逐渐减小到 0.5
    if (sleep_index > 0.5)
        sleep_index -= 0.25;
}

// 醒来时饶恕值减少 100
if (sleeping == 1 && state == 3) {
    scr_mercyadd(myself, -100);
    sleeping = 0;
}
```

### 受伤抖动

```javascript
// 标准抖动 + 眼球保持可见
draw_sprite_ext(spr_ponman_idle, 0, x + shakex, y, 2, 2, 0, image_blend, 1);
if (sleeping == 0)
    draw_sprite_ext(spr_ponman_eye, 0,
        x + 28 + eyex, y + 32 + eyey, 2, 2, 0, c_white, 1);

// HP ≤ 最大HP的 1/3 时标记为 "(Weak)"
```
