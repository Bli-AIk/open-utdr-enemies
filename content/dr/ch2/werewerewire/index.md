+++
title = "Werewerewire"
description = "DELTARUNE enemy animation analysis"
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

Werewerewire 使用 `obj_wiremanwere_enemy` 对象，是 Werewire 的**进化形态**，拥有**阈值正弦振荡**系统：

- **待机精灵：** `spr_wiremanwere_idle`
- **受伤精灵：** `spr_wiremanwere_hurt`
- **饶恕精灵：** `spr_wiremanwere_spared`

## 公式

### 待机动画

```javascript
// 与 Werewire 类似但有阈值正弦波
siner += 1;
draw_sprite_ext(spr_wiremanwere_idle, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 阈值正弦波

```javascript
// 区别于 Werewire 的普通正弦波
// Werewerewire 的振荡在达到阈值时"卡住"
threshold_siner += speed;

if (sin(threshold_siner) > threshold)
    wave_output = threshold;
else if (sin(threshold_siner) < -threshold)
    wave_output = -threshold;
else
    wave_output = sin(threshold_siner);

// 产生类似方波的视觉效果
```

### 闪烁效果

```javascript
// 标准白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```
