+++
title = "Guei"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 4
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Guei 使用 `obj_guei_enemy` 对象，由 **4 个身体部件 + 2 个鬼火**组成：

- **后臂：** `spr_guei_arm_back`
- **身体：** `spr_guei_body`
- **头部：** `spr_guei_head`
- **前臂：** `spr_guei_arm_front`
- **鬼火 1：** `spr_guei_wisp1`
- **鬼火 2：** `spr_guei_wisp2`

绘制顺序：后臂 → 身体 → 头部 → 前臂 → 鬼火

## 公式

### 身体部件相位偏移动画

```javascript
animsiner += 1;

// 后臂：+2 相位偏移
draw_sprite_ext(spr_guei_arm_back, (animsiner + 2) / 6, x, y, 2, 2, 0, image_blend, 1);

// 身体和头部：基准相位
draw_sprite_ext(spr_guei_body, animsiner / 6, x, y, 2, 2, 0, image_blend, 1);
draw_sprite_ext(spr_guei_head, animsiner / 6, x, y, 2, 2, 0, image_blend, 1);

// 前臂：+4 相位偏移
draw_sprite_ext(spr_guei_arm_front, (animsiner + 4) / 6, x, y, 2, 2, 0, image_blend, 1);
```

### 鬼火环绕 + 透明度脉冲

```javascript
// 鬼火 1：正向环绕
wisp1_x = x + (sin(animsiner / 6) * 2);
wisp1_y = y + (cos(animsiner / 6) * 2);
wisp1_alpha = sin(animsiner / 14) * 0.5;  // 0 ~ 0.5 脉冲

// 鬼火 2：反向环绕
wisp2_x = x - (sin(animsiner / 6) * 2);
wisp2_y = y - (cos(animsiner / 6) * 2);
wisp2_alpha = sin((animsiner + 7) / 14) * 0.5;  // 相位偏移 7

draw_sprite_ext(spr_guei_wisp1, 0, wisp1_x, wisp1_y, 2, 2, 0, c_white, wisp1_alpha);
draw_sprite_ext(spr_guei_wisp2, 0, wisp2_x, wisp2_y, 2, 2, 0, c_white, wisp2_alpha);
```

### 闪烁与受伤

```javascript
// 所有 4 个身体部件 + 2 个鬼火共 6 层闪烁
// floatsiner 初始值随机化以避免多只 Guei 同步
```
