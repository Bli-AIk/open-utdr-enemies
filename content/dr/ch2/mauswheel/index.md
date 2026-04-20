+++
title = "Mauswheel"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 9
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Mauswheel 使用 `obj_mauswheel_enemy` 对象，是 Maus 的**高速旋转变体**：

- **待机精灵：** `spr_mauswheel_idle`
- **受伤精灵：** `spr_mauswheel_hurt`
- **饶恕精灵：** `spr_mauswheel_spared`
- **旋转精灵：** `spr_mauswheel_spin`

## 公式

### 待机动画

```javascript
// 快速帧率：siner / 3（与 C.Round 相当）
siner += 1;
draw_sprite_ext(spr_mauswheel_idle, siner / 3, x, y, 2, 2, 0, image_blend, 1);
```

### 旋转攻击

```javascript
// 旋转时使用专用精灵和更快的帧率
if (spinning == 1) {
    thissprite = spr_mauswheel_spin;
    // 旋转帧率极快：siner / 1
    draw_sprite_ext(thissprite, siner, x, y, 2, 2, 0, image_blend, 1);
}
```

### 闪烁与受伤

```javascript
// 标准白色闪烁 + 通用抖动
```
