+++
title = "Jigsawry"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 11
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Jigsawry 使用 `obj_jigsawryenemy` 对象，继承自 `obj_baseenemy`，由**单个精灵**构成：

- **待机精灵：** `spr_jigsawry_idle`
- **受伤精灵：** `spr_jigsawry_wounded`
- **击溃精灵：** `spr_jigsawry_clobbered`

> **注意：** "Jigsawry" 是普通遭遇的名称，"Jigsaw Joe" 是在 Ch3 中出现的个体名（遭遇 ID 不同）。两者使用相同的对象 `obj_jigsawryenemy`。

## 公式

### 待机动画

```javascript
// 使用 obj_baseenemy 的通用绘制
// 默认帧率：siner / 6（继承自 baseenemy）
scr_enemy_drawidle_generic(0.16666666666666666);
// 即 image_speed = 1/6
```

### 闪烁效果

```javascript
// obj_baseenemy 标准白色闪烁
// (-cos(fsiner / 5) * 0.4) + 0.6
```

### 受伤抖动

```javascript
// obj_baseenemy 标准抖动：scr_enemy_drawhurt_generic
```
