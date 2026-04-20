+++
title = "Tasque"
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

Tasque 使用 `obj_tasque_enemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_tasque_idle`
- **受伤精灵：** `spr_tasque_hurt`
- **饶恕精灵：** `spr_tasque_spared`

## 公式

### 待机动画

```javascript
// 标准通用绘制
scr_enemy_drawidle_generic(5);

siner += 1;
draw_sprite_ext(spr_tasque_idle, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
// 当 Tasque Manager 在场时行为可能变化
```
