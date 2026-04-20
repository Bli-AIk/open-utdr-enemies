+++
title = "Swatchling (色板侍卫)"
description = "DELTARUNE enemy animation analysis - Swatchling"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 7
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Swatchling 使用 `obj_swatchling_enemy` 对象，由**多部件**组成，拥有**5 色调色板系统**：

- **身体精灵：** `spr_swatchling_idle`（多色版本）
- **受伤精灵：** `spr_swatchling_hurt`
- **手部精灵：** `spr_swatchling_hand`
- **围巾精灵：** `spr_swatchling_scarf`
- **5 种颜色变体：** 红、蓝、绿、黄、紫

## 公式

### 待机动画

```javascript
// 身体帧率 siner / 5
siner += 1;

// 根据颜色变量选择调色板
// colorindex 决定 image_blend 的色调
var colors = [c_red, c_blue, c_green, c_yellow, c_purple];
var mycolor = colors[colorindex];

draw_sprite_ext(spr_swatchling_idle, siner / 5, x, y, 2, 2, 0, mycolor, 1);
```

### 多部件绘制

```javascript
// 手部独立绘制（略微偏移摆动）
draw_sprite_ext(spr_swatchling_hand, handframe,
    x + hand_offsetx, y + hand_offsety, 2, 2, 0, mycolor, 1);

// 围巾随身体摆动
draw_sprite_ext(spr_swatchling_scarf, siner / 5,
    x + sin(siner / 8) * 2, y, 2, 2, 0, mycolor, 1);
```

### 调色板选择

```javascript
// 初始化时随机或由遭遇脚本指定颜色
// colorindex = irandom(4);
// 不同颜色的 Swatchling 在 Queen 的城堡不同区域出现
```

### 受伤抖动

```javascript
// 标准抖动，所有部件同步偏移 shakex
```
