+++
title = "C.Round (C回合)"
description = "DELTARUNE enemy animation analysis - C.Round"
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

C.Round 使用 `obj_smallcheckers_enemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_smallchecker_idle`（动画帧）
- **受伤精灵：** `spr_smallchecker_hurt`
- **奔跑精灵：** `spr_smallchecker_run`（饶恕后使用）

## 公式

### 待机动画

```javascript
// 帧速率：siner / 3 —— 每 3 帧切换一次（Ch1 敌人中最快）
siner += 1;
thissprite = spr_smallchecker_idle;

// 饶恕后切换为奔跑精灵
if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_smallchecker_run;

draw_sprite_ext(thissprite, siner / 3, x, y, 2, 2, 0, image_blend, 1);
```

### 击败动画

```javascript
// 击败时向右上方飞出
if (global.monster[myself] == 0) {
    hspeed = 12;  // 水平速度 12
    vspeed = -4;  // 垂直速度 -4（向上）
}
```

### 闪烁效果

```javascript
// 通用白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 3, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);

// HP ≤ 最大HP的 1/3 时进入疲劳状态
```
