+++
title = "Shadowguy"
description = "DELTARUNE enemy animation analysis"
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

Shadowguy 使用 `obj_shadowman_enemy` 对象，拥有**阶段相关精灵**和**暗化效果**：

### 阶段精灵系统
- **默认：** `spr_shadowman_idle_b`
- **阶段 1（兔子）：** `spr_shadowman_idle_bunny`
- **阶段 2（猫）：** `spr_shadowman_idle_cat`
- **射击精灵：** `spr_shadowman_firing`
- **枪械精灵：** `spr_shadowman_gun`
- **饶恕精灵：** 随阶段变化

## 公式

### 待机动画

```javascript
// 帧率 0.16666.../帧
siner += 0.16666666666666666;
// 使用 draw_monster_body_part 进行骨骼动画绘制
draw_monster_body_part(idlesprite, siner, x, y);
```

### 枪械计时器

```javascript
// guntimer 每帧递增
guntimer += 1;

// 第 29 帧时切换枪械精灵索引
if (guntimer == 29)
    gun_sprite_index = 1;  // 从待机切换到射击姿态
```

### 暗化效果

```javascript
// 使用 d3d_set_fog 实现黑色覆盖
d3d_set_fog(true, c_black, 0, 1);
draw_sprite_ext(thissprite, siner, x, y, 2, 2, 0, image_blend, darkenalpha);
d3d_set_fog(false, c_black, 0, 0);

// darkenalpha 在 0 ~ 0.45 之间，每帧 ±0.05
```

### 狙击 UI

```javascript
// 射击时显示狙击准心覆盖
// 使用 sharpshoot UI overlay
```
