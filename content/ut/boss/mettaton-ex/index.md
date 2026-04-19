+++
title = "Mettaton EX (镁塔顿) - EX形态"
description = "Undertale boss animation analysis - Mettaton EX"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 6
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
+++


---

## 组成拆解

Mettaton EX 由 **腿部（leg）+ 身体（body）+ 肚子上的心（heart）+ 手臂（arm）+ 脸部（mettface）** 组成。

![mettaton_ex](./3dd930005b1adf61263ec585f4e43a3e630502172.webp)

## 公式整理

```plaintext
特殊计时器：
ds1, ds2 = random(dsf * 2) - dsf

腿部：
x：x + 90 + xoffr
y：y + 120 + yoffr - legh - 0.05 * sin(time / 2)
yscale：2 - 0.05 * sin(time / 3.5)
角度：10 * sin(time / 7) - offangle
x：x + 90 - xoffl - 32
y：y + 120 + yoffl - legh - 0.05 * sin(time / 2)
yscale：2 - 0.05 * sin(time / 3.5)
角度：10 * sin(time / 7)

手臂：
x：x + 36 + sin(time / 3.5)
y：y - legh + 80 + 2 * cos(time / 3.5)
x：x + 110 + sin(time / 3.5)
y：y - legh + 80 + 2 * cos(time / 3.5)

身体：
x：x + 72 + sin(time / 3.5) + ds1
y：y + legh + 134 + 2 * cos(time / 3.5) + ds2

心：
x：x + 72 + sin(time / 3.5) + ds1 + 66
y：y + legh + 134 + 2 * cos(time / 3.5) + 108 + ds2

脸部：
x：x + 68
y：y + 40 - legh + 2 * cos(time / 3.5)
```

### 腿部详细说明

由于 Mettaton EX 腿部和手部动作十分丰富，这里进行阐述：

```plaintext
if (noleg == 0)
{
    if (legr == 0)
    {
        legrsprite = spr_mettleg1
        xoffr = -14
        yoffr = 10
        legrh = 36
    }
    if (legr == 1)
    {
        legrsprite = spr_mettleg2
        xoffr = -16
        yoffr = 6
        legrh = 8
    }
    if (legr == 2)
    {
        legrsprite = spr_mettleg3
        xoffr = -10
        yoffr = 14
        legrh = 60
    }
    if (legr == 3)
    {
        legrsprite = spr_mettleg4
        xoffr = -10
        yoffr = 14
        legrh = 30
    }
    if (legr == 4)
    {
        legrsprite = spr_mettleg5
        xoffr = -18
        yoffr = 2
        legrh = 42
    }
    // ... more leg variants
}
```

大概意思就是：每个不同贴图的腿，它的 x, y 都是不一样的。

### 手臂详细说明

```plaintext
if (arml == 0)
    armlsprite = spr_mettarm1
if (arml == 1)
    armlsprite = spr_mettarm2
if (arml == 2)
    armlsprite = spr_mettarm3
if (arml == 3)
    armlsprite = spr_mettarm4
if (arml == 4)
    armlsprite = spr_mettarm5
if (arml == 5)
    armlsprite = spr_mettarm6
if (arml == 6)
    armlsprite = spr_mettarm7
if (arml == 7)
    armlsprite = spr_mettarm8
// ... similar for right arm
```

虽然不知道 toby 这么列举下来是何意味，但是很容易看懂就是了。