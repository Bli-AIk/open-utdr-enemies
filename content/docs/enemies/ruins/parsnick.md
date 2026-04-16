+++
title = "Parsnik (欧防风兽 - 困难模式)"
description = "Undertale enemy animation analysis - Parsnik (Hardmode)"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 10
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

Parsnik 由 **蔬菜头部（head）+ 头环（headwrap）+ 五条单独的蛇（snake1~5）** 组成。

![parsnick](http://i0.hdslb.com/bfs/new_dyn/7348c105600afbbe790d3e1d2eba77da630502172.webp)

## 公式整理

```plaintext
头部：
x：x + 24
y：y + 46

头环：
x：x + 14
y：y + 24 + 2 * sin(time / 5 + 1.5)

1号蛇（最左侧开始）：
x：x + 32
y：y + 52 + 2 * sin(time / 5 + 1.5)
角度：6 * sin(time / 5)

2号蛇：
x：x + 38
y：y + 46 + 1.5 * sin(time / 5 + 0.5)
角度：2 * sin(time / 5)

3号蛇（中间）
x：x + 52
y：y + 50 + 1.5 * sin(time / 5 + 1)
角度：0

4号蛇
x：x + 60
y：y + 46 + 1.5 * sin(time / 5 + 1.5)
角度：-2 * sin(time / 5)

5号蛇（最右侧）
x：x + 74
y：y + 52 + 1.5 * sin(time / 5 + 2)
角度：-6 * sin(time / 5 + 2)
```