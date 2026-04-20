+++
title = "国王 (King)"
description = "DELTARUNE enemy animation analysis"
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

King 使用 `obj_king_boss` 对象，由**多部件**组成：

- **主体精灵：** `spr_king_idle`（多帧动画）
- **受伤精灵：** `spr_king_hurt`
- **锁链精灵：** `spr_king_chain`（连接到王座）
- **面罩精灵：** `spr_king_mask`（特定阶段）
- **黑桃：** `spr_king_spade`（胸口标记）
- **对话：** `spr_king_talk`

## 公式

### 待机动画

```javascript
// 帧速率：siner / 5（标准速度）
siner += 1;
thissprite = spr_king_idle;
draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 多阶段战斗

```javascript
// King 的战斗分多个阶段（phase 变量）
// phase 0: 正常战斗
// phase 1: 移除面罩
// phase 2: 狂暴状态

// 阶段切换时精灵组发生变化
if (phase >= 1) {
    // 不再绘制面罩
    mask_visible = false;
}

if (phase >= 2) {
    // 抖动幅度增大
    shakex = sin(siner) * 4;
}
```

### 锁链绘制

```javascript
// 锁链从王座延伸到 King 身体
// chain_length 随阶段变化
for (var i = 0; i < chain_segments; i++) {
    draw_sprite_ext(spr_king_chain, 0,
        chain_x + sin(i * 0.5) * 4,
        chain_y + i * chain_spacing,
        2, 2, 0, c_white, 1);
}
```

### 受伤抖动

```javascript
// 标准交替抖动
draw_sprite_ext(spr_king_hurt, 0,
    x + shakex, y, 2, 2, 0, image_blend, 1);

// 特殊：被 Ralsei 治愈时使用独特动画
```
