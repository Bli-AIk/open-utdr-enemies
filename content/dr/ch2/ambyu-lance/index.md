+++
title = "Ambyu-Lance"
description = "DELTARUNE enemy animation analysis"
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

Ambyu-Lance 使用 `obj_omawaroid_enemy` 对象，由**单个精灵**构成，是 Ch2 中最简单的敌人之一：

- **待机精灵：** `spr_omawaroid_idle`
- **受伤精灵：** `spr_omawaroid_hurt`
- **饶恕精灵：** `spr_omawaroid_spared`

## 公式

### 待机动画

```javascript
// 标准通用绘制函数
scr_enemy_drawidle_generic(5);
// siner / 5 帧率

siner += 1;
draw_sprite_ext(spr_omawaroid_idle, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
// HP ≤ 最大HP的 1/3 时进入疲劳状态
```
