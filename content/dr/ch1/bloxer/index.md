+++
title = "Bloxer (方块人偶)"
description = "DELTARUNE enemy animation analysis - Bloxer"
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

Bloxer 使用 `obj_bloxer_enemy` 对象，由**6 个可拆分的身体部件**组成，是 Ch1 中组成最复杂的普通敌人：

- **精灵：** `spr_blockguy_part`（6 帧，每帧代表一个部件）
  - 帧 0：头部
  - 帧 1-4：身体各段（初始化时随机排列）
  - 帧 5：连接件
  - 帧 6：完整状态
- **受伤精灵：** `spr_blockguy_part_hurt`

## 公式

### 身体部件摆动

```javascript
// 使用 sin/cos 驱动慢速摆动
ss = sin(siner / 4);    // 水平摆动因子
ssb = cos(siner / 4);   // 垂直摆动因子

// 6 个部件的位置公式（从上到下）：
// 部件 0（头部）：
x + (ss * 2) + shakex, y + swapx

// 部件 1：
x + (ss * 2) + shakex, y + 28

// 部件 2：
(x + 4) - (ss * 2) + shakex, y + 54

// 部件 3：
(x - 4) + (ss * 2) + shakex, y + 78

// 部件 4（底部）：
(x - ss) + shakex, (y + 100) - swapx

// 部件 5（连接件）：
(x - 24) + (ss * 2) + (swapx * 1.5) + shakex, y + 54 + (ssb * 2)
```

### 浮动拆解动画（交互阶段）

```javascript
// swaptime = 2-3 时，各部件独立浮动
sinmomentum += 0.05;  // 最大 0.8
floatsin += sinmomentum;

// 每个部件有独立的 custom 偏移
// custom = [4.5, 3, 1.5]
partyb[i] = y + 53 + (sin((floatsin / 8) + custom[i]) * 25);
```

### 正确排列判定

```javascript
// 玩家需要选择 3 个部件并按正确顺序排列
// 判定条件：
if (part[1] == 1 && part[2] == 2 && part[3] == 3)
    scr_mercyadd(myself, 100);  // 直接满饶恕

// 归位动画：movex[i] 每帧 -2，部件滑回原位
```
