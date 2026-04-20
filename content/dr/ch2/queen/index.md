+++
title = "Queen (女王)"
description = "DELTARUNE enemy animation analysis - Queen"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 14
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Queen 使用 `obj_queen_enemy` 对象，拥有**7 阶段战斗系统**和**护盾机制**：

- **待机精灵：** `spr_queen_chair_1_old`（坐在椅子上）
- **醉酒精灵：** `spr_queen_drunk`
- **投掷精灵：** `spr_queen_throw_wineglass`
- **受伤精灵：** `spr_queen_hurt`
- **酒杯精灵：** `spr_queen_wine_box1`
- **缓冲精灵：** `spr_queen_buffering`（8 帧加载动画）
- **关联对象：** `obj_berdlyplug_enemy`（Berdly 插头，独立对象）

## 公式

### 待机动画

```javascript
// 帧动画速率：每帧递增 0.16666666666666666
image_index += 0.16666666666666666;

draw_sprite_ext(thissprite, image_index, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 标准白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, image_index, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```

### 酒杯投掷

```javascript
// 投掷时绘制酒杯在偏移位置
// 酒杯缩放较小：0.4x, 0.6y
draw_sprite_ext(spr_queen_wine_box1, 0,
    x + 29, y + 10, 0.4, 0.6, 0, c_white, 1);

// throwX 追踪投掷位置
```

### 缓冲动画

```javascript
// "缓冲中" 状态——Queen 加载时的 8 帧动画
if (buffercheck == 1)
    thissprite = spr_queen_buffering;
// 使用标准帧递增
```

### 7 阶段战斗系统

```javascript
// phase 1-7，phaseturn 追踪当前阶段的回合
phase = 1;
phaseturn = 0;

// 护盾系统
shieldhp = shieldmaxhp;          // 护盾 HP
shieldacthp = shieldactmaxhp;    // ACT 消耗的护盾值
shieldjustbroke = 0;             // 护盾刚被击破

// 最终攻击追踪
usefinalattack = 0;
haveusedfinalattack = 0;
wirescut = 0;    // 已剪断的电线数

// 酸性攻击
whiteAcid = 0;   // 白色酸液切换
```
