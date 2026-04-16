+++
title = "Migospel (哑剧蟑螂 - 困难模式)"
description = "Undertale enemy animation analysis - Migospel (Hardmode)"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 11
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

Migospel 由 **身体（body）（包括一整个外壳和两个缝隙）+ 腿部（leg）+ 嘴和手（mouthA/B/C）+ 长得像面罩的眼睛（eye）+ 大翅膀（wingA）+ 小翅膀（wingB）** 组成。

![migospel](./086e2f33d5d72bffc8ca13ef1e59e39d630502172.webp)

## 公式整理

```plaintext
左大翅膀：
x：x + 2 * sin(time / 4)
y：y + 6 + 52 + 2 * sin(time / 4)

右大翅膀y和左大翅膀一样：
x：x + 52 - 2 * sin(time / 4)

左小翅膀x和左大翅膀一样：
y：y + 16 + 56 - 2 * sin(time / 4)

右小翅膀x与大翅膀一样，y与小翅膀一样

左腿：
x：x
y：y + 100
右腿：
x：x + 50
y：y + 100

身体：
x：x
y：floor(2 * sin(time / 6))
```