+++
title = "Final Froggit (终极蛙吉特)"
description = "UNDERTALE enemy animation analysis - Final Froggit"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "毫无技术的鸽子"
  utaf_data = "/utaf/core/finalfroggit.json"
  utaf_lab_url = "/lab/finalfroggit/"

  toc = true
  top = false
+++


---

## 组成拆解

Final Froggit 由 **头部（head）+ 身体（body）** 组成。

![finalfroggit](./46b6738b47fbaa674b38da546826b853630502172.webp)

## 公式整理

```javascript
头部：
x：x + 60 + 10 * sin(time / 6)
y：y + 20 + 4 * sin(time / 3)
角度：-2 * sin(time / 6)

身体：
x：x + 60
y：y + 20 + 90
yscale：2 - 0.15 * sin(time / 3)
```

> **维护者注：** 身体精灵 `spr_finalfroggit_body`（51×25）在 GameMaker 中的 origin 设置为 (25, 25)，即精灵底部中心。因此 `yscale` 变化时，身体以底边为锚点向上拉伸/收缩——视觉效果是"腿部在底部固定，身体呼吸般起伏"。UTAF 实现中，`pivot` 设为 `(25, 25)` 以匹配此行为。