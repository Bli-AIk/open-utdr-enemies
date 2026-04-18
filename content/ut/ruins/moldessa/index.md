+++
title = "Moldessa (终极模怪 - 困难模式)"
description = "Undertale enemy animation analysis - Moldessa (Hardmode)"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 9
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
+++


---

## 组成拆解

Moldessa 由 **脸（face）+ 底座（stem）+ 头上的尖锐部分（headthing）+ 两个胳膊（arm）** 组成。

![moldessa](./2fb241a4c5d387139babc3177367b0a6630502172.webp)

## 公式整理

```plaintext
底座：
x：x
y：y + 114
x伸缩公式：2 + 0.1 * sin(time / 7)
y伸缩公式：2 - 0.1 * sin(time / 7)

三个脸上的物品：
face[0]x：x + 13 * sin(time / 16)) + sin(time / 6)
face[0]y：y + 56 + 18 * cos(time / 16) + cos(time / 6)
face[0]角度：time * 3 + 4 * sin(time / 6)

face[1]和face[2]所做操作均为改变了初相，face[1]为time + 36，face[2]为time + 65
face[1]和face[2]的角度均相对于face[0]加了180

头上的尖锐部分：
x公式：x
y公式：y - 4 + 2 * sin(time / 7)

两个胳膊：
x公式：x - 12 或 x + 14
y公式：y
角度公式：-5 + 5 * sin(time / 7) 或 5 - 5 * sin(time / 7)
```