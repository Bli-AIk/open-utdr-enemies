+++
title = "Pyrope (火岩绳)"
description = "Undertale enemy animation analysis - Pyrope"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 3
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++


---

## 组成拆解

Pyrope 由 **左脚（footl）+ 右脚（footr）+ 冒火的头（head/head2）+ 六个单层身体（body）** 组成。

![pyrope](./7359b2de7b413c698c6eff719437e55c630502172.webp)

> **特别注意**：六个单层身体的本质是 toby 把六个不同长度的环叠到了同一个贴图组，所以实际制作的过程中也确实是六个不同的图片，而不是单个图片完成放缩操作，如果想要复现，只需要修改 xscale 即可。

## 公式整理

```plaintext
首先还是喜闻乐见的特殊计时器声明时间：
nowy = y + 100 - 20 * abs(-sin(time / 14))

----------------------------

左脚：
x：x + 38
y：nowy + 20
角度：40 * abs(-sin(time / 14))

右脚：
x：x + 60
y：nowy + 20
角度：-40 * abs(-sin(time / 14))

身体层：
假设身体从上到下六层的编号（i）依次为0到5。
从最下方开始绘制：
x：x
y：nowy - i * (12 + 6 * abs(sin(time - i / 14)))

头部（正常）：
x：x + 50
y：nowy - 30
角度：4 * sin(time / 6) + 12 * sin(hurttime)

以防你不知道，火岩绳被打了之后会换一套动画
如果攻击了火岩绳，那么hurttime开始+1，time定格为28

头部（受伤）：
x：x + 50
y：nowy - 30
角度：12 * sin(hurttime)
```