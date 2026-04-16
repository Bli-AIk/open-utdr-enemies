+++
title = "Snowdrake (雪铁龙)"
description = "Undertale enemy animation analysis - Snowdrake"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
+++


---

## 组成拆解

Snowdrake 由 **头部（head）+ 身体（body）+ 腿部（legs）** 组成。

![snowdrake](./92d26310ec30b87b83a5589de3368ea4630502172.webp)

## 公式整理

```plaintext
腿部：
x：x
y：y

身体：
x：x
y：y + （head的y - ys） / 3

头部：
x：x
y：
if (down == 1)
{
    y += (a / 2)
    a += 0.05
    if (a >= 1)
        down = 0
}
if (down == 0)
{
    y += (a / 2)
    a -= 0.05
    if (a <= -1)
        down = 1
}
```

### 头部分段函数解释

如果要往下走，那么 y 每次增加 a/2，a 每次加 0.05，如果 a 大于等于 1，那么开始往上走；如果往上走，那么 y 每次减少 a/2，a 每次增加 0.05。

总的来说，就是头部的增量是身体增量的三倍，这样制造出头比身体移动的快的感觉。