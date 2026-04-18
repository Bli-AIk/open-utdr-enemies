+++
title = "Whimsun (忧郁虫虫)"
description = "Undertale enemy animation analysis - Whimsun"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
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