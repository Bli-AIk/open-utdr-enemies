+++
title = "Mad Dummy (愤怒人偶)"
description = "UNDERTALE enemy animation analysis - Mad Dummy"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 5
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/waterfall/mad-dummy.json"
  utaf_lab_url = "/lab/mad-dummy/"
+++


---

## 组成拆解

Mad Dummy 由 **头部（head）+ 上半躯干（torso）+ 下半躯干（legs）+ 底座（base）** 组成。

![maddummy](./9ac2770e43918e6df0303a72f9cade43630502172.webp)

## 公式整理

```plaintext
一样的，在此之前，我们先看看大表哥的计时器
rot = 30 * sin(time / 6)

-----------------------

头部：
x：x + 5
y：y + 75
角度：-rot

上半躯干：
x：x
y：y + 35 + rot / 4
角度：rot / 2

下半躯干：
x：x + 5
y：x + 65
角度：rot / 3

底座：
x：x - rot / 3
y：y + rot / 3
角度：rot
```

### 补充说明

大表哥（Mad Dummy）越晃越快的操作也很简单，只需要增加 rot 的值即可，比如 `rot *= 3`。