+++
title = "Glyde (老滑头)"
description = "UNDERTALE enemy animation analysis - Glyde"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 10
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/snowdin/glyde.json"
  utaf_lab_url = "/lab/glyde/"
+++


---

## 组成拆解

Glyde 由 **身体（body）+ 左翅膀（leftwing）+ 右翅膀（rightwing）+ 尾巴上的圆圈天线（antenna）** 组成。

> 注：antenna 的意思就是天线，这是一个常用单词。

![glyde](./83a0d1c38e930b5d60d1c820b0c03c58630502172.webp)

## 公式整理

```plaintext
老滑头的计时器比较特殊，这里特地说明：
这是一个套了三角函数的特殊计时器
siner = 2 * cos(time / 24)

还有套了三角函数计时器的三角函数计时器
g = sin(siner / 6)
gg = sin(siner / 12)
---------------------------

身体：
x：不变
y：ys + 8 * sin(siner / 12)

右翅膀：
x：x + 46
y：y + 106 + 2 * g
xscale：2
yscale：1.7 - g * 0.3

左翅膀：
x：x + 82
y：y + 174
xscale：1.95 - g * 0.05
yscale：1.8 - g * 0.2

天线：
x：x + 54 + gg * 2
y：y + 4
角度：20 - gg * 20
```

> **维护者注：** Glyde 的各部件在 GameMaker 中设有非默认的 sprite origin，用于控制缩放和旋转的锚点：右翅膀 origin (0, 42) 即左下角，左翅膀 origin (79, 82) 即右下角，天线 origin (7, 15) 近中心偏下。UTAF 实现中各部件的 `pivot` 均按 GM origin 设置以匹配原作缩放/旋转行为。