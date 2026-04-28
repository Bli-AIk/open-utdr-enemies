+++
title = "Whimsun (忧郁虫虫)"
description = "UNDERTALE enemy animation analysis - Whimsun"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utrp_data = "/utrp/ruins/whimsun.json"
+++


---

## 组成拆解

Whimsun 由单个实例移动构成。

![whimsun](./60078efb84a85fbd383ddea26446ed86630502172.webp)

**名称：path_whimsun**

路径点复现：

```c
// 路径点展示
// 模式：循环模式，播放完重播
// 步长：0.5px
path_points = [
    [176, 96, 100],    // 点0 
    [176, 88, 100],    // 点1
    [176, 104, 100],   // 点2
];
```

> **维护者注：** UTAF 动画预览中，路径坐标已从游戏内绝对坐标转换为相对坐标（以怪物立绘中心为原点）。原始坐标 x=176 为游戏战斗画面中的水平居中位置，y=96 为垂直基准点。转换后路径点为 (0,0)、(0,-8)、(0,+8)，仅保留相对运动轨迹。