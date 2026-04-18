+++
title = "Tsunderplane (傲娇飞机)"
description = "Undertale enemy animation analysis - Tsunderplane"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
  utaf_data = "/utaf/hotland/tsunderplane.json"
  utaf_lab_url = "/lab/tsunderplane/"
+++


---

## 组成拆解

Tsunderplane 由 **飞机本体（plane）+ 荷叶边洋帽（hat，疑似 ZUN 帽）+ "尾气"（cloud）+ 腮红（blush）** 组成。

![tsunderplane](./1e797626013eed758a631e700b5956ed630502172.webp)

### 关于疑似 ZUN 帽

![zun_hat](./5cc4d92dfdf0d64dec2870eb126ab6b2630502172.png)

怎么看怎么像大小姐戴的那种。

## 公式整理

```plaintext
身体：
x：x + 94
y：y + 76 + 3 * sin(time / 7)

帽子：
x：x + 154
y：y + 90 + 3 * sin(time / 7)

腮红：
x：x + 94 + 2 * sin(time / 7)
y：y + 76 + 4 * sin(time / 7)
透明度：0.7 + 0.1 * sin(time / 4)

尾气：
角度时刻+1
x持续加sin(time / 2)
y持续加cos(time / 2)
大小倍率持续加0.05
```