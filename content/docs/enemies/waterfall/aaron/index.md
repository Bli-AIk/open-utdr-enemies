+++
title = "Aaron (亚伦)"
description = "Undertale enemy animation analysis - Aaron"
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

Aaron 由单个图片组成。

![aaron](./84dbe1c532eb5ddf1f32b85910fc9f59630502172.webp)

## 公式整理

```plaintext
y：ys + 9 * sin(timer / 30)
```