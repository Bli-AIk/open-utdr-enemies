+++
title = "饮水机 (Watercooler)"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 10
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Watercooler 使用 `obj_watercooler_enemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_watercooler_idle`
- **受伤精灵：** `spr_watercooler_hurt`
- **饶恕精灵：** `spr_watercooler_spared`

## 公式

### 待机动画

```javascript
// 标准通用绘制
scr_enemy_drawidle_generic(0.16666666666666666);

siner += 1;
draw_sprite_ext(spr_watercooler_idle, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
```
