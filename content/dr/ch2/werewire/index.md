+++
title = "Werewire (人线人)"
description = "DELTARUNE enemy animation analysis - Werewire"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Werewire 使用 `obj_werewire_enemy` 对象，由**身体 + 弯曲线缆 + 32 段垂直线缆**构成，拥有**正弦波线缆动画系统**：

- **身体精灵：** `spr_werewire_idle`（通过 `draw_monster_body_part` 绘制）
- **受伤精灵：** `spr_werewire_hurt`
- **弯曲线缆：** `spr_werewire_wire_curve`（身体连接处）
- **垂直线缆：** `spr_werewire_wire_vertical`（32 段动态排列）
- **悬挂精灵：** `spr_werewire_hang`（悬挂状态）

## 公式

### 帧计时系统

```javascript
// 非标准帧率——使用 siner_timer 累积
siner_timer += image_speed;  // image_speed = 0.16666...

if (siner_timer >= 1) {
    siner_timer -= 1;
    siner += 8;  // 每次累积满后 siner 跳 8
}

// 动画帧使用复合正弦计算
// m = 2（速度乘数）
anim_timer_2 += sin(siner / (34 / m)) / (4 / m);
// 34/2 = 17 帧周期，振幅 = 1/(4/2) = 0.5
// 产生平滑的摆动效果
```

### 32 段垂直线缆波浪

```javascript
// 32 段线缆从身体向上延伸，每段独立正弦偏移
for (i = 0; i < 32; i++) {
    cable_x = (x - 16) + ((sin((i / 4) + (siner / 16)) * i) / 4) + (i * 2);
    cable_y = y - 20 - (i * 8);

    draw_sprite_ext(spr_werewire_wire_vertical, 0,
        cable_x, cable_y,
        image_xscale, image_yscale, image_angle,
        image_blend, image_alpha);
}

// 正弦参数解析：
// (i / 4)：相位随段号递增——产生波浪传播效果
// (siner / 16)：全局时间相位——驱动波浪运动
// (* i) / 4：振幅随段号线性增大——顶部摆幅最大
// + (i * 2)：基础水平偏移——线缆整体倾斜
```

### 弯曲线缆（身体连接处）

```javascript
// 固定偏移绘制
draw_sprite_ext(spr_werewire_wire_curve, 0,
    x - 16, y - 12, image_xscale, image_yscale,
    image_angle, image_blend, image_alpha);
```

### 悬挂状态

```javascript
// 悬挂时使用不同精灵和减半的波浪振幅
if (sprite_index == spr_werewire_hang) {
    draw_sprite_ext(spr_werewire_hang, siner / 16,
        x + hangx, y + hangy, ...);

    // 悬挂线缆：振幅减半（/8 而非 /4）
    for (i = 0; i < 32; i++) {
        cable_x = x + ((sin((i / 4) + (siner / 16)) * i) / 8) + hangx;
        cable_y = ((y + 14) - (i * 8)) + hangy;
        draw_sprite_ext(spr_werewire_wire_vertical, 0, cable_x, cable_y, ...);
    }
}
```

### 闪烁效果

```javascript
// 身体和弯曲线缆都有独立闪烁
// 32 段垂直线缆也逐段闪烁
fsiner += 1;
flash_alpha = (-cos(fsiner / 5) * 0.4) + 0.6;

// 使用 draw_sprite_ext_flash 而非 d3d_set_fog
draw_sprite_ext_flash(spr_werewire_wire_vertical, 0,
    cable_x, cable_y, ..., flash_alpha);
```
