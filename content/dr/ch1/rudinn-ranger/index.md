+++
title = "Rudinn Ranger"
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

Rudinn Ranger 使用 `obj_rudinnranger` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_rudinnranger_idle`
- **受伤精灵：** `spr_rudinnranger_hurt`
- **饶恕精灵：** `spr_rudinnranger_spared`

## 公式

### 待机动画

```javascript
// 帧速率：siner / 6（与 Rudinn 相同，最慢一档）
siner += 1;
thissprite = spr_rudinnranger_idle;

if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_rudinnranger_spared;

draw_sprite_ext(thissprite, siner / 6, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 标准白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 6, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```

### 受伤抖动

```javascript
// 使用 scr_enemy_drawhurt_generic 通用抖动
// 受伤时固定显示第 0 帧
draw_sprite_ext(spr_rudinnranger_hurt, 0, x + shakex, y, 2, 2, 0, image_blend, 1);
```
