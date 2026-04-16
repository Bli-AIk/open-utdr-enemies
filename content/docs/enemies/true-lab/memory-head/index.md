+++
title = "MemoryHead (记忆脑)"
description = "Undertale enemy animation analysis - MemoryHead"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++


---

## 组成拆解

MemoryHead 由 **单个图片切换 + 扫描线（scanline）** 组成。

![memoryhead](./af2f35fa9789d88de642cacdf722a399630502172.webp)

## 扫描线说明

扫描线主要用于构建一种画面挤压、扭曲的感觉，其本质其实是贴图的重新绘制：

```plaintext
b = argument0
c = argument1
d = argument2
a += 1
for (i = 0; i < sprite_height; i += 1)
{
    a += 1
    draw_sprite_part_ext(sprite_index, image_index, 0, i, sprite_width, (1 * sin(a) * d), (x + (sin(a / b)) * c), (y + i * 2), 2, 2, c_white, image_alpha)
}
```