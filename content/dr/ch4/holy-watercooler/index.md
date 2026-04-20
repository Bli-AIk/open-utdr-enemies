+++
title = "Miss Mizzle"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 7
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Holy Watercooler / Miss Mizzle 使用 `obj_holywatercooler_enemy` 对象，拥有**变身序列**：

### 变身前（Holy Watercooler）
- **待机精灵：** `spr_holywater_idle` / `spr_holywater_alarm`
- **受伤精灵：** `spr_holywater_hurt`
- **饶恕精灵：** `spr_holywater_spared`

### 变身后（Miss Mizzle）
- **大型待机：** `spr_mizzle_idle_large`
- **大型居中：** `spr_mizzle_idle_large_centered`
- **饮水机形态：** `spr_watercooler_centered`

## 公式

### 变身前浮动

```javascript
// 正弦浮动
y = ystart + (sin(siner * 0.5) * 5);
```

### 3 阶段变身序列（transformationcon）

```javascript
// 阶段 1: 能量球聚集
// 生成 obj_rouxls_power_up_orb（distance_multiplier: 1.4）
// 播放 snd_sneo_overpower
// 2x 缩放 + 黑色雾化效果

// 阶段 2: 30 帧交叉渐变
// Watercooler 精灵 → Mizzle 精灵
// alpha 从 1 渐变到 0（旧）和 0 到 1（新）

// 阶段 3: 完成变身
// 第 30 帧时：
x -= 38;  // 位置调整
y -= 58;
sprite = spr_mizzle_idle_large;
// 名称变更为 "Miss Mizzle"
// 解锁新行为：Dazzle, Embezzle, Nuzzle
// 播放 snd_motor_ghost
```

### 粉色闪烁

```javascript
// 变身过程中的特殊粉色闪烁
pinkflashtimer -= 1;
pink_alpha = pinkflashtimer / 10;
```
