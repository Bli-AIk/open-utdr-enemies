+++
title = "正义之声 (Sound of Justice)"
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

Sound of Justice 使用 `obj_sound_of_justice_enemy` 对象，是 Ch4 格尔森（Gerson）雕像的战斗形态。初始 `image_blend = c_black`（黑色剪影），拥有多状态系统和波纹特效：

- **雕像精灵：** `spr_statue_sound_of_justice`
- **碎裂精灵：** `spr_statue_sound_of_justice_crumble`
- **治愈光效：** `spr_statue_sound_of_justice_heal_lighting`
- **闪避精灵：** `spr_gerson_dodge`

## 公式

### 基本待机

```javascript
// state 0: 正常待机
if (state == 0)
    movesiner += (1/3);

// 使用通用绘制（非 lightup 时）
scr_enemy_drawhurt_generic();
scr_enemy_drawidle_generic(0);  // speed = 0 → 不自动递增 siner
```

注意 `drawidle_generic(0)` 的速度参数为 **0**——雕像通过其他状态控制帧变化，待机时静止不动。

### 治愈光效（lightupcon）

```javascript
if (lightupcon == 1) {
    draw_sprite_ext(spr_statue_sound_of_justice_heal_lighting,
        0, x, y, image_xscale, image_yscale,
        image_angle, c_white, lightalpha);
    lightalpha -= 0.01;  // 缓慢淡出（约 120 帧完全消失）

    if (lightalpha == 0)
        lightupcon = 0;
}
```

`lightalpha` 初始值 **1.2**（超过 1.0 = 过曝效果），以 0.01/帧 衰减。

### 黑色渐隐系统（state 14）

State 14 控制雕像的黑暗化和碎裂序列，包含 5 个子状态（`state14con` 0~4）：

```javascript
// con 0: 黑暗渐入（10帧）
state14timer++;
draw_sprite_ext(spr_statue_sound_of_justice, 0, x - 10, y - 50, 2, 2, 0, c_white, 1);
d3d_set_fog(true, c_black, 0, 1);
draw_sprite_ext(spr_statue_sound_of_justice, 0, x - 10, y - 50, 2, 2, 0, c_white,
    (10 - state14timer) / 10);  // alpha: 1.0 → 0.0
d3d_set_fog(false, c_black, 0, 0);

// con 1: 保持 60 帧
// con 2: 黑暗渐出（10帧）——alpha: 0.0 → 1.0

// con 3: 碎裂动画（11帧）
draw_sprite_ext(spr_statue_sound_of_justice_crumble,
    6 + state14timer,  // 从第 6 帧开始
    x - 10, y + 15, 2, 2, 0, c_white, 1);

// con 4: 碎裂定格——固定第 17 帧
draw_sprite_ext(spr_statue_sound_of_justice_crumble,
    17, x - 10, y + 15, 2, 2, 0, c_white, 1);
```

注意碎裂时雕像位置偏移：x-10, y+15（向左下方移动）。

### 快速动画（state 12）

```javascript
if (state == 12) {
    image_index += 0.23333333333333334;  // 比标准 0.1667 快 40%
    draw_self();

    if (global.turntimer < 0) {
        state = 0;
        image_speed = 0.16666666666666666;  // 恢复标准速度
    }
}
```

### 闪避动作（state 13）

```javascript
// 格尔森的闪避序列
if (state == 13) {
    draw_self();
    dodgetimer++;

    if (dodgetimer == 2) {
        image_alpha = 0;  // 瞬间消失
    }

    if (dodgetimer == 3) {
        sprite_index = spr_gerson_dodge;
        x -= 104;  // 向左闪避 104px
        y -= 30;
        speed = 16;      // 初始移动速度
        friction = 4;    // 高摩擦力快速减速
    }

    // 第 38 帧恢复雕像
    if (dodgetimer == 38) {
        sprite_index = spr_statue_sound_of_justice;
        x = xstart; y = ystart;
    }
}
```

闪避时雕像短暂消失，然后以 Gerson 形态向左快速滑动——`friction = 4` 使其在约 4 帧内停止。

### 波纹特效系统

```javascript
rippletimer++;

// 每 66 帧：红色波纹（雕像自身位置）
if ((rippletimer % 66) == 0 && ...)
    _ripple = instance_create(x + 56, y + 68, obj_church_old_man_ripple_effect);
    _ripple.color = merge_color(c_red, c_black, 0);  // 纯红

// 每 50 帧：品红波纹（phase 2 时）
if ((rippletimer % 50) == 0 && phase == 2 && ...)
    _ripple.color = merge_color(c_fuchsia, c_black, 0);  // 品红

// 每 50 帧：青色波纹（Kris 位置）
if ((rippletimer % 50) == 0 && i_ex(obj_herokris) && ...)
    _ripple = instance_create(obj_herokris.x + 30, obj_herokris.y + 48, ...);
    _ripple.color = merge_color(c_aqua, c_black, 0);  // 青色
```

三层波纹系统：红色从雕像散发，品红在 phase 2 出现，青色跟踪 Kris——营造"正义共鸣"的视觉效果。
