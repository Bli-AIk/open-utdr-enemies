+++
title = "Rabbick"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 6
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Rabbick 使用 `obj_rabbick_enemy` 对象，由**单个精灵**构成，但拥有独特的**吹飞压缩变形**机制：

- **待机精灵：** `spr_rabbick_enemy`（2 帧动画）
- **受伤精灵：** `spr_rabbick_enemy_hurt`
- **饶恕精灵：** `spr_rabbick_enemy_spared`

## 公式

### 待机动画

```javascript
// 帧速率：animsiner / 5
animsiner += 1;
draw_sprite_ext(spr_rabbick_enemy, animsiner / 5,
    x + xoff + ashake, y, 2, 2, 0, image_blend, 1);
```

### 吹飞压缩变形

```javascript
// 被吹飞时，x 缩放逐渐减小（身体被压扁）
image_xscale = 2 - (blowamt / 100);

// 居中补偿偏移
xoff = (originalwidth - sprite_width) / 2;

// 当缩放 ≤ 1.5 时切换到第 1 帧（更压扁的样子）
// 并额外偏移 -8px
if (image_xscale <= 1.5)
    draw_sprite_ext(spr_rabbick_enemy, 1, x + xoff - 8, y, ...);
```

### 吹飞抖动

```javascript
// 多阶段递减抖动
// onoff 在 0 → 0.5 → 1 → 1.5 → 2 → 0 间循环
if (onoff == 0) ashake = -shakeamt;
if (onoff == 1) {
    ashake = shakeamt;
    if (shakeamt > 0)
        shakeamt -= 1;  // 振幅逐渐衰减
}

// blown = 1 时完全吹走，blowtimer = 180（3 秒倒计时）
```

### 受伤状态

```javascript
// HP ≤ 最大HP的 1/3 时进入疲劳状态
if (global.monsterhp[myself] <= (global.monstermaxhp[myself] / 3))
    global.monsterstatus[myself] = 1;
```
