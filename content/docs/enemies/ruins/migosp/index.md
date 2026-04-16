+++
title = "Migosp (福音蟑螂)"
description = "Undertale enemy animation analysis - Migosp"
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

## 组成拆解

Migosp 不进行移动，只是原地的图片切换，切换样子像是随机无意识的动爪子。

![migosp](./cd2dde6909516208452ec9f8c6b5579e630502172.webp)

## 逻辑

```c
// Alarm8
image_speed = 0; // 停下动画切换

// Alarm7
image_speed = 0.5
if (mercymod < 0) // 如果还不可饶恕
{
    alarm[8] = 10

    // 随机30+U(0, 40)的时间再次执行这一片代码
    alarm[7] = 30 + random(40) 
}
else
    image_speed = 0.1 // 这里是福音蟑螂可饶恕时不断蹲起

// Alarm6，这里是福音蟑螂开心时不断蹲起
if (mercymod > 0)
{
    image_speed = 0.1
}
```

## 主体解析

福音蟑螂会随机 30 + U(0, 40)（U 指的是在这段区间内均匀随机分布的一个数）的时间执行每 0.5 秒切换一次图片的动画进程。同时会在十帧后重新关闭动画静止站立。上述进程会不断循环，直到切换状态为 happy。