+++
title = "Vulkin (迷你火山)"
description = "UNDERTALE enemy animation analysis - Vulkin"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utrp_data = "/utrp/hotland/vulkin.json"
+++


---

## 组成拆解

Vulkin 由 **火山外壳（body）+ 脸部（face）+ 溢出的岩浆（lava）+ 前脚（feetfront）+ 后脚（feetback）** 组成。

![vulkin](./c39a1496436b4b41ce5e3e6621828f62630502172.webp)

## 公式整理

```javascript
后脚：
x：x + 2 + 2 * cos(time / 6)
y：y + 102 + 2 * sin(time / 6)

前脚：
x：x + 2 + 2 * sin(time / 6)
y：y + 102 + 2 * cos(time / 6)

脸部：
x：x + 26 + 18 + 7 * sin(time / 12)
y：y + 50
xscale：2 - 0.2 * abs(sin(time / 12))

岩浆：
x：x + 42
y：y + 10

身体：
x：x
y：y
```