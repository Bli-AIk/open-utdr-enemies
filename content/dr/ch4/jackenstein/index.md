+++
title = "Jackenstein (杰肯斯坦)"
description = "DELTARUNE enemy animation analysis - Jackenstein"
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

Jackenstein 使用 `obj_jackenstein_enemy` 对象，是 Ch4 BOSS，拥有**黑暗系统**和**弹跳动画**：

- **眼睛精灵：** `spr_jackenstein_battle_eyes`（主要可见部分）
- **黑暗覆盖：** `obj_darkness_overlay`（独立黑暗效果对象）
- **伙伴标记：** Susie/Ralsei 的眼部标记

## 公式

### 弹跳动画

```javascript
// 持续正弦弹跳
siner += 0.16666666666666666;

// 垂直弹跳（8px 振幅，快速频率）
y_offset = sin(siner / 1.35) * 8;

draw_sprite_ext(spr_jackenstein_battle_eyes, siner,
    x, y + y_offset, 2, 2, 0, image_blend, 1);
```

### 黑暗系统

```javascript
// 战斗在黑暗中进行
// 创建时生成黑暗覆盖层
darkness = instance_create(x, y, obj_darkness_overlay);
darkness.depth = depth + 5;
darkness.sprite_index = spr_nothing;

// 控制全局调光
global.drawdimmerlight = true;
```

### 闪烁效果

```javascript
// 使用 d3d_set_fog 白色闪烁
if (flashcon == 1) {
    d3d_set_fog(true, c_white, 0, 1);
    draw_sprite_ext(..., flash_alpha);
    d3d_set_fog(false, c_black, 0, 0);
    flashtimer -= 1;
}
```

### 伙伴眨眼

```javascript
// 黑暗中 Susie 和 Ralsei 的眼睛标记闪烁
susieblinktimer -= 1;
if (susieblinktimer <= 0) {
    // 眨眼
    susieblinktimer = 40 + irandom(50);  // 40~90 帧周期
}

// Ralsei 相同机制
ralseiblinktimer -= 1;
```

### 多阶段战斗

```javascript
phase = 1;       // 1-6+ 阶段
phaseturn = 0;   // 阶段内回合
turn = 0;        // 全局回合

// 特殊攻击模式
burnon = 0;       // 燃烧模式
unleash = 0;      // 释放模式
lightup = 0;      // 照亮模式
treasurehunt = 0; // 寻宝模式
```
