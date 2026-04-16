+++
title = "Froggit (蛙吉特)"
description = "Undertale enemy animation analysis - Froggit"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[authors]
  - name = "毫无技术的鸽子"

[extra]
toc = true
top = false
+++

---

## 组成拆解

Froggit 由 **头部 + 身体（也可以叫腿部）** 两部分组合而成。

### 头部

头部由 Gamemaker Studio 1.4 自带的 Path 系统进行画线循环控制：

![path](http://i0.hdslb.com/bfs/new_dyn/cacf5ca8d51cfb9e9a525d30960d6314630502172.png)

**名称：path_froroghead**

路径点复现：

```c
// 路径点展示
// 模式：循环模式，播放完重播
// 步长：0.5px
path_points = [
    [264, 300, 100],    // 点0 
    [272, 296, 100],    // 点1
    [280, 300, 100],    // 点2
    [272, 304, 100],    // 点3
    [272, 292, 100]     // 点4
];
```

说明：
- path_points 是记录所有点位的一个表（或者说数组）
- 内部所有东西都围绕 [x坐标, y坐标, 速度] 来逐个填入
- 上方给出了步长，每帧需要移动 0.5px 的距离
- 注意：这是 30f 的情况下，现阶段绝大部分 UT 游戏都是 60f，这个数需要除以 2

### 腿部

由于站位和怪物位置有关系，这里没有固定值，但是 y 值确定是 136。

![legs](http://i0.hdslb.com/bfs/new_dyn/a26ed4bc51cd175ac9e1d9559f1f31c6630502172.png)

最上方是 froggit 和 whimsun 的配合，然后是小模怪，然后是三个小模怪，观察可以发现，没有任何规律，全都是硬编码的。