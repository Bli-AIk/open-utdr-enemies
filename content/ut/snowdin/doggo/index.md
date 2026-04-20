+++
title = "Doggo (遁狗)"
description = "UNDERTALE enemy animation analysis - Doggo"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 5
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/snowdin/doggo.json"
  utaf_lab_url = "/animation-lab/"
+++


---

## 组成拆解

Doggo 由 **身体（body）+ 头部（head）+ 双臂（arms）+ 尾巴（tail）** 组成。

![doggo](./3346ca81312ba99a7a22913e5e87ada7630502172.webp)

## 公式

```javascript
身体，尾巴，头部均保持不动：

手臂：
若sin(time / 4.5) > 0，那么手臂y增加0.8；
反之减少0.8
```