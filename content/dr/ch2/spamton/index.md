+++
title = "Spamton"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 16
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Spamton 使用 `obj_spamton_enemy` 对象，由**身体 + 可分离头部**组成，拥有复杂的**身体变形序列**：

- **待机精灵：** `spr_spamton_idle`
- **暗黑精灵：** `spr_spamton_dark`
- **大笑（左）：** `spr_spamton_laugh_left`
- **大笑（右）：** `spr_spamton_laugh_right`
- **大笑（大）：** `spr_spamton_laugh_large`
- **分离后身体：** `spr_spamton_laugh_bottom`、`spr_spamton_laugh_middle`
- **头部生长：** `spr_spamton_head_grow`（16 帧过渡）
- **头部件：** `headpiece`（独立深度 -10 的头部对象）
- **受伤精灵：** `spr_spamton_hurt`
- **饶恕精灵：** `spr_spamton_spared`

## 公式

### 状态驱动精灵选择

```javascript
// global.flag[20] 控制当前显示状态
switch (global.flag[20]) {
    case 0: thissprite = spr_spamton_idle; shakeamt = 0; break;
    case 1: thissprite = spr_spamton_dark; shakeamt = 0; break;
    case 2: thissprite = spr_spamton_laugh_left; shakeamt = 2; break;
    case 3: thissprite = spr_spamton_laugh_right; shakeamt = 2; break;
    case 4: // 双手举起姿势
        shakeamt = 0; break;
    case 5: thissprite = spr_spamton_laugh_large; shakeamt = 2; break;
    case 6: thissprite = spr_spamton_laugh_left; shakeamt = 2; break;
}
```

### 随机抖动

```javascript
// 非标准抖动——使用随机范围
x = remx + random_range(-shakeamt, shakeamt);
y = remy + random_range(-shakeamt, shakeamt);
// shakeamt = 2 时产生持续的颤抖效果
```

### 身体变形序列（bodycon 状态机）

```javascript
// bodycon 0: 未激活
// bodycon 1: 头部生长（16 帧）
if (bodycon == 1) {
    bodytimer += 1;
    draw_sprite_ext(spr_spamton_head_grow, bodytimer / 3,
        x, y, 2, 2, 0, image_blend, 1);
    if (bodytimer >= 48) bodycon = 2;
}

// bodycon 2: 身体分离——头部独立浮动
if (bodycon == 2) {
    bodysiner += 0.1;
    // 下半身
    draw_sprite_ext(spr_spamton_laugh_bottom, 0, x, y, 2, 2, 0, image_blend, 1);
    // 中间部分
    draw_sprite_ext(spr_spamton_laugh_middle, 0, x, y - 54, 2, 2, 0, image_blend, 1);
    // 头部：正弦浮动
    head_y = y - 104 - (sin(bodysiner) * 4);
    draw_sprite_ext(headsprite, 0, x, head_y, 2, 2, 0, image_blend, 1);
}

// bodycon 3: 反向缩回（头部缩小归位）
```

### 闪烁效果

```javascript
// 基于帧的闪烁——fsiner 累积
// 标准公式：(-cos(fsiner / 5) * 0.4) + 0.6
```
