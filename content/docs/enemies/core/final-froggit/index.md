+++
title = "Final Froggit (终极蛙吉特)"
description = "Undertale enemy animation analysis - Final Froggit"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
+++


---

## 组成拆解

Final Froggit 由 **头部（head）+ 身体（body）** 组成。

![finalfroggit](./46b6738b47fbaa674b38da546826b853630502172.webp)

## 公式整理

```plaintext
头部：
x：x + 60 + 10 * sin(time / 6)
y：y + 20 + 4 * sin(time / 3)
角度：-2 * sin(time / 6)

身体：
x：x + 60
y：y + 20 + 90
yscale：2 - 0.15 * sin(time / 3)
```