+++
title = "Clover (三叶草)"
description = "DELTARUNE enemy animation analysis - Clover"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 8
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Clover 使用 `obj_clubsenemy` 对象，由**身体 + 三个头（子对象）**组成，是 Ch1 中构造最独特的敌人之一：

- **主体精灵：** `spr_clubsenemy_idle`（身体，帧动画）
- **受伤精灵：** `spr_clubsenemy_hurt`
- **头部对象：** `obj_clubsenemy_head`（3 个独立实例）
  - 每个头有独立的 `headhp`、`headtimer`
  - 精灵：`spr_clubsenemy_head_idle`, `spr_clubsenemy_head_talk`, `spr_clubsenemy_head_hurt`

## 公式

### 身体待机

```javascript
// 身体帧速率：siner / 5（标准速度）
siner += 1;
thissprite = spr_clubsenemy_idle;

if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_clubsenemy_spared;

draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 头部绘制

```javascript
// 三个头的位置由 head_x[i], head_y[i] 定义
// 每个头独立摆动：
head_siner[i] += 1;
head_y[i] = y - 48 + sin(head_siner[i] / 8) * 4;

// 头部有自己的 hp，被打时独立抖动
if (head_hurt[i] > 0) {
    head_shakex[i] = (head_hurt[i] % 2 == 0) ? -2 : 2;
    head_hurt[i] -= 1;
}
```

### 对话状态

```javascript
// 三个头独立对话——每次只有一个头在说话
// 对话时用 spr_clubsenemy_head_talk 替换当前头

// headtimer 倒计时控制对话嘴型动画
if (headtimer[talkinghead] > 0) {
    headtimer[talkinghead] -= 1;
    headsprite[talkinghead] = spr_clubsenemy_head_talk;
} else {
    headsprite[talkinghead] = spr_clubsenemy_head_idle;
}
```

### 受伤抖动

```javascript
// 身体使用标准 scr_enemy_drawhurt_generic
// 每个头独立计算抖动
```
