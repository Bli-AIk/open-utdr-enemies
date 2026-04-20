+++
title = "Tasque Manager (塔斯克管理员)"
description = "DELTARUNE enemy animation analysis - Tasque Manager"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 18
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Tasque Manager 使用 `obj_tasque_manager_enemy` 对象，由 **6 个身体部件**组成：

| 索引 | 精灵 | 饶恕精灵 | 部位 |
|------|------|----------|------|
| 0 | `spr_tm_head` | `spr_tm_head_spare` | 头部 |
| 1 | `spr_tm_body` | `spr_tm_body_spare` | 躯干 |
| 2 | `spr_tm_tail` | `spr_tm_tail_spare` | 尾巴 |
| 3 | `spr_tm_hand_l` | `spr_tm_hand_l_spare` | 左手（鞭子） |
| 4 | `spr_tm_hand_r` | `spr_tm_hand_r_spare` | 右手 |
| 5 | `spr_tm_legs` | `spr_tm_legs_spare` | 腿部 |

## 公式

### 部件偏移初始化

```javascript
// 每个部件的偏移量基于精灵原点计算
xOffset[i] = (sprite_get_xoffset(sprite[i]) * 2) - 22;
yOffset[i] = (sprite_get_yoffset(sprite[i]) * 2) - 6;
```

### 各部件动画公式（timer 递增 1.5/帧）

```javascript
timer += 1.5;

// 尾巴：旋转摆动
tail_rot = -sin(timer / 6) * 10;  // ±10° 摆动

// 右手：小幅水平+垂直摆动
hand_r_x = x + sin(timer / 6) * 2;
hand_r_y = y + sin(timer / 6) * 2;

// 左手（鞭子）：cos + sin 组合摆动 + 旋转
hand_l_x = x + cos(timer / 6) * 2;
hand_l_y = y + sin(timer / 6) * 2;
hand_l_rot = sin(timer / 6) * 15;  // ±15° 旋转

// 腿部：固定位置

// 躯干：轻微上下浮动
body_y = y + sin(timer / 6) * 2;

// 头部：较大幅度浮动 + 旋转
head_y = y + sin(timer / 6) * 3;   // 比躯干大 50%
head_rot = sin(timer / 6) * 10;    // ±10° 摆动
```

### 饶恕状态

```javascript
// 饶恕后所有精灵切换为 spare 变体
if (global.mercymod[myself] >= global.mercymax[myself]) {
    sprite[0] = spr_tm_head_spare;
    sprite[1] = spr_tm_body_spare;
    // ... 以此类推
}
```

### 特殊机制

```javascript
// 鞭子动画优先：当鞭子动画对象可见时，不绘制自身
if (obj_tm_whip_animation.visible == true)
    exit;

// 所有部件以 2x 缩放绘制
```
