+++
title = "Bibliox"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 3
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Bibliox 使用 `obj_bibliox_enemy` 对象，由**底座 + 头部**两部分组成，拥有**抚摸胡须**互动：

- **底座：** `spr_bibliox_base`
- **头部：** `spr_bibliox_head`
- **胡须抚摸：** `spr_bibliox_head_beard_stroke`（32 帧动画）
- **受伤精灵：** `spr_bibliox_hurt`
- **饶恕精灵：** `spr_bibliox_spare`

## 公式

### 头部摆动

```javascript
animsiner += 1;

// 头部水平摆动
head_x = x + headoffsetx + (sin(animsiner / 10) * 2);
head_y = y + headoffsety;

// 头部帧率：animsiner / 5
draw_sprite_ext(spr_bibliox_head, animsiner / 5, head_x, head_y, 2, 2, 0, image_blend, 1);
```

### 胡须抚摸动画

```javascript
// beardcon 状态机
// beardcon 0: 待机
// beardcon 1: 抚摸——32 帧渐进动画
if (beardcon == 1) {
    beardtimer += 1;
    draw_sprite_ext(spr_bibliox_head_beard_stroke,
        beardtimer / 3,  // 约 10.6 秒完整循环
        head_x, head_y, 2, 2, 0, image_blend, 1);
}
```

### 校对计时器显示

```javascript
// 校对（proofread）行为时显示 UI
if (acting == 20) {
    // 沙漏精灵 + 倒计时条
    bar_width = 220 - (timer * 2);  // 或 200 - timer
    draw_rectangle(bar_x, bar_y, bar_x + bar_width, bar_y + bar_h, false);
}
```
