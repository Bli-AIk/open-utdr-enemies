+++
title = "Madjick (疯狂魔术师)"
description = "UNDERTALE enemy animation analysis - Madjick"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 4
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utrp_data = "/utrp/core/madjick.json"
+++


---

## 组成拆解

Madjick 由 **靴子（boot）+ 裙子（dress）+ 翻领（lapel）+ 头部（head）+ 巫师帽（hat）+ 宝珠、法球（orb）+ 法球放出来的十字架（orbsprinkle）** 组成。

![madjick](./a1308956011910722faf6ba29fa906ab630502172.webp)

## 公式整理

```javascript
计时器一览：
_sin = sin(time / 5)
_cos = cos(time / 5)
_dsin = sin(time / 2.5)

-----------------------

靴子：
x：x + 70 - 23 - 5 * _sin
y：y + 80 - 6 * _sin
角度：-40 - 10 * _sin
x：x + 70 + 19 + 5 * _sin
y：y + 80 - 6 * _sin
角度：40 + 10 * _sin

翻领：
x：x + 70 - 2
y：y + 52 + _sin
角度：-10 * _sin

裙子：
x：x + 70 - 34
y：y + 52 + _sin
yscale：1.8 - 0.2 * _sin

头部：
x：x + 70 - 6 + _sin
y：y + 2 + 8 * _sin

帽子：
x：x + 70 + 2 + _cos
y：y + 4 + 10 * _sin

法球：
x：x + 70 - 44
y：y + 16 + 2 * _dsin
x：x + 70 + 70
y：y + 6 + 5 * _dsin

十字架（每5帧创建一个）：
x：x + 70 + 46 + random(18)
y：y - 10 + 4 * _dsin - random(6)
x：x + 70 - 66 + random(18)
y：y + 4 * _dsin - random(6)
```