+++
title = "Pipis"
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

Pipis 使用 `obj_pipis_enemy` 对象，由**双体振荡**结构组成，拥有独特的**双身体同步摆动**：

- **待机精灵：** `spr_pipis_idle`（两个 Pipis 一组）
- **受伤精灵：** `spr_pipis_hurt`
- **饶恕精灵：** `spr_pipis_spared`

## 公式

### 双体振荡

```javascript
// 两个 Pipis 体以相反相位摆动
siner += 1;

// 左体
body1_x = x - 20 + sin(siner / 6) * 8;
body1_y = y + cos(siner / 6) * 4;

// 右体（反相）
body2_x = x + 20 - sin(siner / 6) * 8;
body2_y = y - cos(siner / 6) * 4;

draw_sprite_ext(spr_pipis_idle, siner / 5, body1_x, body1_y, 2, 2, 0, image_blend, 1);
draw_sprite_ext(spr_pipis_idle, siner / 5, body2_x, body2_y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 两个身体同时闪烁
d3d_set_fog(true, c_white, 0, 1);
// 对两个身体分别绘制闪烁层
d3d_set_fog(false, c_black, 0, 0);
```

### 受伤抖动

```javascript
// 两个身体同步抖动
// 标准 shakex 交替偏移
```
