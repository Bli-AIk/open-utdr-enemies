+++
title = "正义之锤 (Hammer of Justice)"
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

Hammer of Justice 使用 `obj_hammer_enemy` 对象，是格尔森（Gerson）的战斗形态：

- **主体精灵：** `spr_hammer_idle`
- **受伤精灵：** `spr_hammer_hurt`
- **旋转精灵：** `spr_hammer_spin`

## 公式

### 待机动画

```javascript
// 标准帧率
siner += 1;
draw_sprite_ext(spr_hammer_idle, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
flash_alpha = (-cos(fsiner / 5) * 0.4) + 0.6;
```
