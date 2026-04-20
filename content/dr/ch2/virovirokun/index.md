+++
title = "Virovirokun"
description = "DELTARUNE enemy animation analysis"
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

Virovirokun 使用 `obj_virovirokun_enemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_virovirokun_idle`（多帧动画）
- **受伤精灵：** `spr_virovirokun_hurt`
- **饶恕精灵：** `spr_virovirokun_spared`

## 公式

### 待机动画

```javascript
// 标准通用绘制
siner += 1;
thissprite = spr_virovirokun_idle;

if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_virovirokun_spared;

draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 标准白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```

### 受伤抖动

```javascript
// 通用受伤抖动 scr_enemy_drawhurt_generic
// HP ≤ 最大HP的 1/3 时进入疲劳状态
```
