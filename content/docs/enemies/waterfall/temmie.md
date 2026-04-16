+++
title = "Temmie (提米)"
description = "Undertale enemy animation analysis - Temmie"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 4
sort_by = "weight"
template = "docs/page.html"

[authors]
  - name = "毫无技术的鸽子"

[extra]
toc = true
top = false
+++


---

## 背景

有人曾说，提米的身体和脸是两个生物。现在，让我们从代码层面看看这两个生物的底层逻辑是什么。

![temmie](http://i0.hdslb.com/bfs/new_dyn/f716ad6170d19376277f1c9ed9cf6ecf630502172.webp)

## 组成拆解

Temmie 由 **身体（body）+ 脸部（face）** 组成。

## 公式整理

```plaintext
身体：
x：xs + random(r)
y：ys + random(r)

脸依旧是这个公式，加上random(r)
但是有一点，当时间大于10秒，而且脸小于身体x+100的位置
脸会以每帧0.01像素的速度向右偏移
如果你要看到脸跑到最大位置，这个时间大概是：
100 / 0.01 = 10000帧 = 10000/30 = 333.33秒
你需要挂机五分半才能看到脸停下了

当然，你不能忽略了身体也在乱动的事实

关于r：
当r小于2的时候，r会每帧增加0.01
如果攻击，r清零重新计时
```

### 结论

古老的传说是真的呢~