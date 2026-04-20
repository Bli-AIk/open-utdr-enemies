+++
title = "Berdly (伯德利)"
description = "DELTARUNE enemy animation analysis - Berdly"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 13
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Berdly 第二阶段使用 `obj_berdlyb2_enemy` 对象，由**单个精灵**构成，但拥有**路线分支**系统：

- **正常路线待机：** `spr_berdlyb_idle`
- **SideB 路线待机：** `spr_berdlyb_idle_serious`（更严肃的表情）
- **受伤精灵：** `spr_berdly_hurt_kneel_battle`
- **震惊表情：** `spr_berdly_shocked_left_battle`

## 公式

### 路线条件精灵选择

```javascript
// 根据 SideB 路线阶段选择待机精灵
if (scr_sideb_get_phase() > 0)
    thissprite = spr_berdlyb_idle_serious;  // Snowgrave 路线
else
    thissprite = spr_berdlyb_idle;          // 正常路线

draw_sprite_ext(thissprite, image_index, x, y, 2, 2, 0, image_blend, 1);
```

### 受伤抖动

```javascript
// 标准递减抖动
hurtshake += 1;
if (hurtshake > 1) {
    if (shakex > 0) shakex -= 1;
    if (shakex < 0) shakex += 1;
    shakex = -shakex;
    hurtshake = 0;
}

draw_sprite_ext(hurtsprite, 0,
    x + shakex + hurtspriteoffx, y + hurtspriteoffy,
    2, 2, 0, image_blend, 1);
```

### 特殊状态

```javascript
// Snowgrave 路线特殊变量
snowgrave_con = 0;     // Snowgrave 状态
snowgrave_counter = 0; // 计数器
summoning = 0;         // 召唤状态
summontimer = 0;       // 召唤计时

// 击败状态追踪
kris_defeat_con = 0;
hurt_noelle = 0;       // 是否伤害了 Noelle
freezable = 0;         // 不可冻结（初始）
```
