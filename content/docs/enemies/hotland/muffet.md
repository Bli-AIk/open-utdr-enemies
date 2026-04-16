+++
title = "Muffet (玛菲特)"
description = "Undertale enemy animation analysis - Muffet"
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

## 说明

（光看这个动画就知道三角函数量多大了。）

![muffet](http://i0.hdslb.com/bfs/new_dyn/e95c36455956ce4addb75b202baec7b7630502172.webp)

## 组成拆解

Muffet 由以下部分组成：
- 中间两条胳膊（midarm1/midarm2）
- 手里拿的茶壶（teapot）
- 下面摆动的手（lowarm）
- 胸前的蝴蝶结（shirt）
- 两条腿（legs）
- 蝴蝶结下面部分的裤子（pants）
- 两条比较高的胳膊（upperarm）
- 肩膀（shoulder，这部分指的是比较高的胳膊的大臂到袖口）
- 晃动的短双马尾（hair）
- 头部（head，这部分不包括眼睛）
- 中间的眼睛（eyecen）
- 两侧的大眼睛（eyebig）
- 两边中间的小眼睛（eyemed）

（作者写完这一长串已经吓哭了）

## 公式整理

```plaintext
首先一如既往的计时器：
heady = y + 4 * sin(time / 5)

-----------------------

比较高的胳膊：
x：x + 14
y：y + 86 + 26 + cos(time / 5)
角度：-6 * sin(time / 5)
x：x + 78
y：y + 86 + 26 + cos(time / 5)
角度：6 * sin(time / 5)

肩膀和大臂：
x：x + 42
y：y + 86 + cos(time / 5)
x：x + 50
y：y + 86 + cos(time / 5)

短双马尾：
x：x + 80
y：heady * 1.02 + 18
角度：25 * sin(time / 5)
x：x + 12
y：heady * 1.02 + 18
角度：-25 * sin(time / 5)

头部：
x：x
y：heady

腿部：
x：x + 30
y：y + 162

最低的胳膊：
如果sin(time / 5) < 0，那么切换另一张图片
否则继续切换回来
x：x + 26
y：y + 130 + sin(time / 5)
角度：8 * sin(time / 5) - 8
x：x + 64
y：y + 130 + sin(time / 5)
角度：-8 * sin(time / 5) + 8

拿茶壶的胳膊（大臂）：
x：x + 12
y：y + 116 + 2 * cos(time / 5)
x：x + 80
y：y + 116 + 2 * cos(time / 5)

拿茶壶的胳膊（小臂）：
x：x + 12
y：y + 130 + 2 * cos(time / 5)
角度：3 * sin(time / 5)
x：x + 80
y：y + 130 + 2 * cos(time / 5)
角度：3 * sin(time / 5)

蝴蝶结：
x：x + 28
y：y + 92 + 2 * sin(time / 5)

裤子：
x：x + 20
y：y + 114 + sin(time / 5)

五只眼睛：
x：x + 24, 30, 42, 62, 68
y：heady + 26, 32, 42
```

### 五只眼睛动画

如果你想知道五只眼睛的动画，下面是源代码和解释：

```plaintext
for (i = 0; i < 5; i += 1)
{
    if (anim > (0 + i * 5) && anim < (7 + i * 5))
        eye[i] += 0.5
    if (anim > (12 + i * 5) && anim < (16 + i * 5))
        eye[i] -= 1
    if (anim > 70 && anim < 77)
        eye[i] += 0.5
    if (anim > 88 && anim < 95)
        eye[i] -= 0.5
}
```

- 第一个 if 提取公因式 i * 5，所以每只眼睛享有 0-7 的区间睁眼
- 第二个 if 提取公因式 i * 5，每只眼睛会在 12-16 帧闭眼
- 依次循环到 70-77 区间，所有眼睛睁眼；然后在 88-95 所有眼睛闭眼

下面这个表格很清晰的展示了整个动画的时间线：

![muffet_timeline](http://i0.hdslb.com/bfs/new_dyn/9415bc0c0b32d3bd4d85e17ce67ce3a3630502172.png)