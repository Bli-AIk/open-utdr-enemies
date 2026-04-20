+++
title = "Hathy (红心怪)"
description = "DELTARUNE enemy animation analysis - Hathy"
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

Hathy 使用 `obj_heartenemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_heartenemy_idle`（动画帧）
- **受伤精灵：** `spr_heartenemy_hurt`
- **饶恕精灵：** `spr_heartenemy_spared`

## 公式

### 待机动画

```javascript
// 帧速率：siner 每帧 +1，显示帧 = siner / 5
// 即每 5 帧切换一次动画帧（比 Rudinn 略快）
siner += 1;
thissprite = spr_heartenemy_idle;

if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_heartenemy_spared;

draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 与 Rudinn 相同的白色闪烁公式
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```

### 特殊行为

```javascript
// HP ≤ 最大HP的 1/3 时进入疲劳状态
if (global.monsterhp[myself] <= (global.monstermaxhp[myself] / 3))
    global.monsterstatus[myself] = 1;

// 击败时递增 flag[524] 和 flag[521]
// 初始化时记录玩家 HP: checkhp1, checkhp2
```
