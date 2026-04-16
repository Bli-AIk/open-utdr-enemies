+++
title = "Jerry (杰瑞)"
description = "Undertale enemy animation analysis - Jerry"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 9
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++


---

## 组成拆解

Jerry 仅图片切换。

![jerry](./9508ae377ccc8cce46fd662a1b4ebbc1630502172.webp)

若想要进行复现，头部为随机触发的三角函数，振幅为 1，震颤一次后归位。

我们视角的右手可以通过利用三角函数改变 xscale 来实现。