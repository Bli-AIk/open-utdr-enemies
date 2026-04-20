+++
title = "Jevil (杰维尔)"
description = "DELTARUNE enemy animation analysis - Jevil"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 15
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Jevil 使用 `obj_joker` 和 `obj_joker_body` 两个对象，是 Ch1 隐藏 BOSS，拥有**最复杂的多部件动画系统**：

- **头部（obj_joker）：** `spr_joker_idle`
- **身体（obj_joker_body）：** 多层部件
  - `spr_joker_body`：身体主体
  - `spr_joker_body_arm`：手臂
  - `spr_joker_body_tail`：尾巴
  - `spr_joker_body_hat`：帽子
- **变身精灵：** `spr_joker_devilsknife`（变身为恶魔之刀时使用）
- **旋转木马精灵：** `spr_joker_carousel`（旋转木马攻击时使用）
- **最终形态：** `spr_joker_final`

## 公式

### 身体摆动（obj_joker_body Draw_0）

```javascript
// 使用 sin 驱动多层身体部件摆动
ss = sin(siner / 4);
ssb = cos(siner / 4);

// 帽子（最上层）：与头同步
draw_sprite_ext(spr_joker_body_hat, 0,
    x + ss * 3, y - 40, 2, 2, 0, c_white, 1);

// 手臂：反相摆动
draw_sprite_ext(spr_joker_body_arm, armframe,
    x - ss * 4, y + 12, 2, 2, 0, c_white, 1);

// 尾巴：延迟摆动
draw_sprite_ext(spr_joker_body_tail, 0,
    x + ss * 6, y + 44, 2, 2, 0, c_white, 1);

// 身体主体
draw_sprite_ext(spr_joker_body, bodyframe,
    x + ss * 2, y, 2, 2, 0, c_white, 1);
```

### 舞蹈等级系统

```javascript
// dancelevel 控制动画复杂度
// 随战斗推进，dancelevel 增加

// dancelevel 0: 基础摆动
// dancelevel 1: 手臂开始摆动
// dancelevel 2: 全身摆动加速
// dancelevel 3: 疯狂摆动 + 尾巴旋转

if (dancelevel >= 2) {
    // 摆动速度加倍
    siner += 2;
}

if (dancelevel >= 3) {
    // 尾巴独立旋转
    tailrot += 5;
}
```

### 变身动画

```javascript
// 变身为恶魔之刀 (Devil's Knife)
// transform_timer 控制变身过渡
if (transforming == 1) {
    // 缩放动画：先缩小再展开
    image_xscale = 2 * (1 - transform_progress);
    image_yscale = 2 * (1 + transform_progress * 0.5);

    // 完成后切换精灵
    if (transform_progress >= 1)
        thissprite = spr_joker_devilsknife;
}
```

### 旋转木马状态

```javascript
// 骑旋转木马时的动画
thissprite = spr_joker_carousel;
// 旋转中使用 carousel_angle 控制位置
x = carousel_cx + cos(carousel_angle) * carousel_radius;
y = carousel_cy + sin(carousel_angle) * carousel_radius;
carousel_angle += carousel_speed;
```

### 最终形态

```javascript
// 疲劳后切换到 spr_joker_final
// 大幅简化的动画——仅身体慢速摆动
if (tired == 1) {
    thissprite = spr_joker_final;
    // 摆动速度降至 1/4
    siner += 0.25;
}
```
