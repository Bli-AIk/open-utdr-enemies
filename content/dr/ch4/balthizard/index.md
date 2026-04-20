+++
title = "Balthizard (焚香龟)"
description = "DELTARUNE enemy animation analysis - Balthizard"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Balthizard 使用 `obj_balthizard_enemy` 对象，由 **5 个身体部件 + 头部物理系统 + 颈部绳索**组成，是 Ch4 中构造最复杂的敌人之一：

- **尾巴：** `spr_incense_turtle_tail`
- **前腿：** `spr_incense_turtle_leg1`
- **身体：** `spr_incense_turtle_body`
- **后腿 1：** `spr_incense_turtle_leg2`
- **后腿 2：** `spr_incense_turtle_leg3`
- **头部（带火焰）：** `spr_incense_turtle_head_fire`
- **颈部绳索：** `spr_turtle_string_head` + `spr_turtle_string`（3 段）
- **变形精灵：** 各部件的 `_transition` 变体

## 公式

### 身体摆动

```javascript
animsiner += 1;

// 尾巴：较大幅度垂直摆动
tail_y = y + (sin(animsiner / 8) * 4);

// 身体：较小幅度
body_y = y + (sin(animsiner / 8) * 2);
```

### 头部钟摆物理

```javascript
// 头部拥有独立的物理系统
headspeed += headgravity;   // headgravity = 2.5
headspeed *= (1 - headfriction);  // headfriction 导致衰减

headoffsety += headspeed;

// 边界弹跳：±65 像素，±15 速度限制
if (abs(headoffsety) > 65) headspeed = -headspeed * 0.5;
if (abs(headspeed) > 15) headspeed = sign(headspeed) * 15;

// 浮动振幅插值
headamplitude = lerp(headamplitude, target_amplitude, 0.25);
// target_amplitude 在 0 和 5 之间切换
```

### 头部待机浮动

```javascript
// 眼部 siner 驱动头部帧
eyesiner += 1;
head_frame = 7 + (sin(eyesiner / 12) * 5);  // 帧 2~12 间浮动
```

### 颈部绳索

```javascript
// 使用 spr_smallbullet 在头部和身体之间绘制 3 段绳索
for (var i = 0; i < 3; i++) {
    segment_x = lerp(body_x, head_x, i / 3);
    segment_y = lerp(body_y, head_y, i / 3);
    draw_sprite_ext(spr_smallbullet, 0, segment_x, segment_y, ...);
}
```

### 烟雾粒子

```javascript
// 头部/鼻孔处定期生成烟雾粒子
if (timer % smoke_interval == 0) {
    smoke = instance_create(head_x, head_y, obj_smoke_particle);
}
```

### 变形动画（transitioncon 0-6）

```javascript
// 7 阶段变形——每个身体部件依次切换为 _transition 精灵
// 使用 d3d_set_fog 黑色雾化效果
// 变形过程中头部和身体的缩放/位置渐变
```
