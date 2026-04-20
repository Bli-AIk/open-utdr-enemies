+++
title = "Susie (苏西)"
description = "DELTARUNE enemy animation analysis - Susie"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 14
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Susie 使用 `obj_susieenemy` 对象，是**剧情中短暂出现的"敌人"**——Susie 暂时离队后与玩家对抗的几场战斗。由**单个精灵**构成：

- **待机精灵：** `spr_susieenemy_idle`
- **受伤精灵：** `spr_susieenemy_hurt`
- **对话精灵：** `spr_susieenemy_talk`

## 公式

### 待机动画

```javascript
// 帧速率：siner / 5（标准速度）
siner += 1;
thissprite = spr_susieenemy_idle;
draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 对话状态

```javascript
// 对话时切换精灵并使用嘴型动画
if (talking == 1)
    thissprite = spr_susieenemy_talk;

// talk_timer 控制嘴型切换
```

### 受伤抖动

```javascript
// 标准抖动——但 Susie 战斗中玩家无法真正攻击
draw_sprite_ext(spr_susieenemy_hurt, 0,
    x + shakex, y, 2, 2, 0, image_blend, 1);
```

### 特殊行为

```javascript
// Susie 作为敌人时不可被击败（剧情战）
// 她的饶恕值由剧情推进控制
// 战斗中的攻击由脚本而非玩家输入触发
```
