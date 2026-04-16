+++
title = "Sans (杉斯)"
description = "Undertale boss animation analysis - Sans"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 8
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

Sans 由 **头部（head）+ 身子（body）+ 腿部（legs）** 组成。

圈内制作者做了这么多年 sans，早就知道 sans 的组成拆解了。

![sans](./b297b789f8e46907c8ad985448564e30630502172.webp)

## 公式整理

```plaintext
核心摆动控制

// 摆动控制变量
y = global.idealborder[2] - 130  // 基础Y坐标
xoff = 0  // X轴摆动偏移
yoff = 0  // Y轴摆动偏移
siner = 0  // 正弦计时器
headx = 0  // 头部X偏移（用于攻击动画）
heady = 0  // 头部Y偏移（用于攻击动画）

// 摆动模式选择（bounce = 0-3）
if (bounce == 3) {
    // 模式3：大幅垂直摆动（疲惫状态）
    siner += 1
    yoff = (sin(siner / 18)) * 2
    xoff = 0
}
if (bounce == 2) {
    // 模式2：中等幅度垂直摆动
    siner += 1
    yoff = (sin(siner / 15)) * 4
    xoff = 0
}
if (bounce == 1) {
    // 模式1：轻微8字形摆动（基础闲晃）
    siner += 1
    yoff = sin(siner / 3)  // 快速垂直摆动
    xoff = cos(siner / 6)  // 慢速水平摆动，形成8字形轨迹
}
if (bounce == 0) {
    // 模式0：静止
    siner = 0
    yoff = 0
    xoff = 0
}

身体绘制

// 绘制躯干（摆动影响）
if (movearm == 0)  // 仅在非手臂动画时
    draw_sprite_ext(spr_sansb_torso, global.flag[20], 
                   (x + xoff),  // X坐标：基础X + 摆动偏移
                   (y + 42 + yoff / 1.5),  // Y坐标：基础Y + 42 + 1/1.5的摆动偏移
                   2, 2, 0, c_white, 1)

脸

// 绘制面部（有多种状态）
if (facetype == 0)  // 正常面部
    draw_sprite_ext(spr_sansb_face, global.faceemotion, 
                   (x + xoff + headx),  // X坐标：基础X + 摆动偏移 + 头部攻击偏移
                   (y + yoff + heady),  // Y坐标：基础Y + 摆动偏移 + 头部攻击偏移
                   2, 2, 0, c_white, 1)

// 流汗动画（3种等级）
if (sweat == 1)
    draw_sprite_ext(spr_sansb_face_sweat, 0, (x + xoff + headx), (y + yoff + heady), 2, 2, 0, c_white, 1)
if (sweat == 2)
    draw_sprite_ext(spr_sansb_face_sweat, 1, (x + xoff + headx), (y + yoff + heady), 2, 2, 0, c_white, 1)
if (sweat == 3)
    draw_sprite_ext(spr_sansb_face_sweat, 2, (x + xoff + headx), (y + yoff + heady), 2, 2, 0, c_white, 1)

// 蓝眼特效（特殊攻击时）
if (facetype == 1) {
    f_i += 1
    draw_sprite_ext(spr_sansb_blueeye, floor(f_i / 2), 
                   (x + xoff + headx), (y + yoff + heady), 2, 2, 0, c_white, 1)
}
```