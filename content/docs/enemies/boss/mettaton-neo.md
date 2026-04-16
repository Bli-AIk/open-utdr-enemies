+++
title = "Mettaton NEO (镁塔顿) - NEO形态"
description = "Undertale boss animation analysis - Mettaton NEO"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 7
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

Mettaton NEO 由 **头部（face）+ 身体（body）+ 炮筒手臂（arml）+ 另一个手（armr）+ 背后的翅膀（burst，也许也是灯光）+ 腿部（legs）** 组成。

![mettaton_neo](http://i0.hdslb.com/bfs/new_dyn/c8382bee5e2b7525a4062873bd931a5f630502172.webp)

## 公式整理

```plaintext
翅膀：
x：x - 24或x + 28
y：y + 18 + sin(time / 3)
角度：±2 * sin(time / 6)
透明度：0.4 + 0.5 * abs(sin(time * 0.3))

腿部：
x：x
y：x + 84 + 112
yscale：2 - 0.05 * sin(time / 3)

炮筒手（左边的手）：
x：x - 26 - 2 * sin(time / 3)
y：y + 40
角度：-2 * sin(time / 6)

右边的手：
x：x + 40 + 2 * sin(time / 3)
y：y + 40
角度：2 * sin(time / 6)

身体：
x：x + 4
y：y + 36 + 2 * sin(time / 3)

头部：
x：x
y：y + 3 * sin(time / 3)
```