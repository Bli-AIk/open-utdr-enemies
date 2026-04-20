+++
title = "Rudinn (方块人)"
description = "DELTARUNE enemy animation analysis - Rudinn"
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

Rudinn 是 DELTARUNE 第一章最常见的敌人，使用 `obj_diamondenemy` / `obj_baseenemy` 对象。

默认情况下（使用通用绘制），Rudinn 由**单个精灵**构成，没有多部件组合：

- **待机精灵：** `spr_diamondm_idle`（动画帧）
- **受伤精灵：** `spr_diamondm_hurt`
- **饶恕精灵：** `spr_diamondm_spared`

当 `custom_draw_example = 1` 时，使用自定义双部件绘制模式：

- **上半身：** `spr_diamondm_custom_body_example`（帧索引 1）
- **下半身：** `spr_diamondm_custom_body_example`（帧索引 0）

## 公式

### 通用待机动画

```javascript
// obj_baseenemy / obj_diamondenemy 通用绘制
// 帧速率：siner 每帧 +1，显示帧 = siner / 6
// 即每 6 帧切换一次动画帧
siner += 1;
thissprite = spr_diamondm_idle;

// 若饶恕值已满，切换为饶恕精灵
if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_diamondm_spared;

draw_sprite_ext(thissprite, siner / 6, x, y, 2, 2, 0, image_blend, 1);
```

### 自定义双部件绘制

```javascript
// custom_draw_example = 1 时的特殊绘制
// 两个身体部件以 sin/cos 做反向水平摇摆
siner += 0.16666666666666666; // 每帧约 1/6

// 上半身：x 方向 sin 摇摆，振幅 2px
draw_monster_body_part(spr_diamondm_custom_body_example, 1,
    x + (sin(siner) * 2), y);

// 下半身：x 方向反向 sin 摇摆，y 方向 cos 浮动
draw_monster_body_part(spr_diamondm_custom_body_example, 0,
    x - (sin(siner) * 2), y + cos(siner));
```

### 闪烁效果

```javascript
// 受到攻击选中时的白色闪烁
// alpha 值在 0.2 ~ 1.0 之间以 cos 波形振荡
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 6, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```

### 受伤抖动

```javascript
// 通用受伤抖动公式（所有 DR 敌人共用）
hurtshake += 1;
if (hurtshake > 1) {
    if (shakex > 0) shakex -= 1;
    if (shakex < 0) shakex += 1;
    shakex = -shakex;
    hurtshake = 0;
}
draw_sprite_ext(spr_diamondm_hurt, 0,
    x + shakex, y, 2, 2, 0, image_blend, 1);

// HP ≤ 最大HP的 1/3 时进入疲劳状态
// 击败时 global.flag[523] 和 global.flag[520] 递增
```
