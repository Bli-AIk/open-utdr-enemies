+++
title = "Organikk"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 10
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Organikk 使用 `obj_organ_enemy` 对象，由**身体 + 头部**两部分组成，拥有**变速动画系统**和**和声高亮特效**：

- **身体：** `spr_organik_body`（`idlesprite`）
- **头部：** `spr_organik_head`（仅非饶恕时绘制）
- **受伤精灵：** `spr_organik_hurt`
- **饶恕精灵：** `spr_organik_spare`

## 公式

### 变速动画系统

```javascript
fsiner += 1;                           // 闪烁计数器
siner2 += 0.16666666666666666;         // 调制器

// siner 的递增速度受 siner2 正弦调制
siner += clamp(0.25 + (sin(siner2 / 6) * 0.3), 0, 0.5);

// sin(siner2 / 6) 在 -1 ~ +1 间变化
// 速度范围: clamp(0.25 - 0.3, 0, 0.5) = 0
//        → clamp(0.25 + 0.3, 0, 0.5) = 0.5
// 效果: 动画速度在 0 ~ 0.5 之间"呼吸式"变化
```

### 身体 + 头部绘制

```javascript
thissprite = idlesprite;  // spr_organik_body

// 饶恕时切换精灵
if (global.mercymod[myself] >= global.mercymax[myself]
    && global.turntimer < 1)
    thissprite = sparedsprite;  // spr_organik_spare

draw_monster_body_part(thissprite, siner, x, y);

// 仅非饶恕时绘制头部
if (thissprite == idlesprite)
    draw_monster_body_part(spr_organik_head, siner, x, y);
```

`draw_monster_body_part` 内置白色闪烁处理——身体和头部共享同一个 `siner` 帧索引，动画完全同步。

### 水平摇摆

```javascript
// 非饶恕状态时左右摇摆
if (thissprite != sparedsprite)
    x = xstart + (sin(siner2 / 1.5) * 3);

// siner2 / 1.5 → 比动画调制更快的摇摆周期
// 3px 振幅
```

### 多实例相位偏移

```javascript
// Create_0 中根据实例索引偏移初始相位
for (var i = 0; i < instance_number(object_index); i++) {
    if (instance_find(object_index, i)) {
        siner = (i + 1) * 100;  // 大幅偏移帧索引
        siner2 = i * 33;        // 偏移调制器
    }
}
```

多只 Organikk 同时出现时，各自的动画节奏和摇摆相位完全不同——避免同步机械感。

### 和声高亮系统

```javascript
if (harmonize_highlight > 0) {
    harmonize_highlight--;

    // 创建或续命高亮对象
    if (!i_ex(obj_organ_enemy_highlight)) {
        instance_create(x + 58, y + 136, obj_organ_enemy_highlight);
        obj_organ_enemy_highlight.depth = depth - 2;
    } else {
        obj_organ_enemy_highlight.alarm[0] = 2;  // 延长存活
    }

    // 粒子特效
    particletimer++;
    if (particletimer >= 1) {
        part = instance_create(
            x + 8 + random(60),  // 水平散布 60px
            y + 117,             // 固定高度
            obj_organ_enemy_particle
        );
        part.depth = depth - 1;
        particletimer = 0;
    }
}
```

和声触发时，在 Organikk 下方 (y+117) 创建发光覆盖层和粒子——粒子每帧生成一个，水平随机散布 60px 范围。
