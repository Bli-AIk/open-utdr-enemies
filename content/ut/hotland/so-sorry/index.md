+++
title = "So Sorry (很抱歉/真抱歉)"
description = "UNDERTALE enemy animation analysis - So Sorry"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 6
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/hotland/so-sorry.json"
  utaf_lab_url = "/lab/so-sorry/"
+++


---

## 组成拆解

So Sorry 由 **身体（body，正反）+ 头部（head）+ 脸部（face）+ 手臂（arm）+ 帽子（hat）+ 腿部（leg）+ 尾巴（tail）+ 长耳朵（ear）** 组成。

![sosorry](./d22b573c912a24aab24278ca01df80b1630502172.webp)

## 公式整理

```javascript
尾巴：
x：x + 46 * sin(time / 12)
y：y + 88
xscale：2 * sin(time / 12)

身体：
x：x
y：y + 64 + 2 * sin(time / 6)

腿：
x：x ± (2 + 2 * sin(time / 6))
y：y + 128
yscale：2 + 0.1 * cos(time / 3)

头部：
x：x
y：y + 3 * sin(time / 6)

脸部：
x：x
y：y + 12 + 4 * sin(time / 6)

双耳：
x：x - 32; x + 32
y：y - 22 + sin(time / 6)

帽子（如果戴帽子了）：
x：x
y：y - 20 + 5 * sin(time / 6)

胳膊：
由于有不同的状态，这里分开阐述
默认戳手：
x：x - 44 + 2 * sin(time / 3)
y：y + 32
x：x + 46 - 2 * sin(time / 3)
y：y + 32
手中抓画本时，和上述公式完全一致
双手在后面时，和上述公式完全一致
单手背后单手画画时：
x：x - 44 + 2 * sin(time / 3)
y：y + 32
x：x + 52 - 2 * sin(time / 3)
y：y + 28
```