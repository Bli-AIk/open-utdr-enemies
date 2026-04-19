+++
title = "Moldsmal (小模怪)"
description = "UNDERTALE enemy animation analysis - Moldsmal"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 6
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/ruins/moldsmal.json"
  utaf_lab_url = "/lab/moldsmal/"
+++


---

## 组成拆解

Moldsmal 单个图片进行竖直方向的伸缩（image_yscale）。

![moldsmal](./ded444b45b01e07f8634c5e5400c6a05630502172.webp)

## 公式

```c
if (image_yscale < 0.9)
    scalevalue = 0.01
if (image_yscale > 1.1)
    scalevalue = -0.01
image_yscale += scalevalue
y -= (102 * scalevalue)
```

说明：
- 如果图片伸缩小于 0.9 倍，那么放大倍率为 0.01
- 如果图片伸缩大于 1.1 倍，那么放大倍率为 -0.01（或者说缩小倍率 0.01）
- y 值随着 scalevalue 的变化有 y = y - 102 * sv 的变化公式

实际制作的时候可以考虑把 y 设置在最下方，然后只改变 yscale，就没必要改变 y 值了。