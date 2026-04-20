+++
title = "攻击震动 (Attack Shaking)"
description = "UNDERTALE enemy mechanism analysis - Attack Shaking"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-20T13:10:00+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "毫无技术的鸽子, Bli-AIk"

  toc = true
  top = false
+++


---

## 说明

敌人的砍击震动也是有公式的。

敌人有一个特殊变量 `shudder`，表示当前震动幅度。受击时 `shudder` 被设定为初始值，随后每帧执行一次：左右交替偏移并逐步衰减，直至归零。

实际上，**不同怪物使用了两种不同的衰减步长**：有的每次衰减 2，有的每次衰减 1。初始幅度也分为两档（16 或 8）。

## 两种震动模式

### 模式 A：shudder = 16，步长 = 2

主要用于 **遗迹 (Ruins)** 和 **雪镇 (Snowdin)** 的怪物。

<!-- 源码：gml_Object_obj_fakefroggit_Alarm_3.gml -->
```javascript
x += shudder
if (shudder < 0)
    shudder = -(shudder + 2)
else
    shudder = -shudder
if (shudder == 0)
{
    global.hurtanim[myself] = 2
    exit
}
alarm[3] = 2
```

震动序列：`+16 → -14 → +12 → -10 → +8 → -6 → +4 → -2 → 0`（共 8 次振荡）

**使用此模式的怪物：**

| 区域 | 怪物 |
|------|------|
| 废墟 | Froggit、Whimsun、Moldsmal、Migosp、Loox、Vegetoid |
| 雪町 | Doggo、Lesser Dog、Dogamy、Dogaressa、Greater Dog、Ice Cap、Gyftrot、Jerry、Moldbygg |
| 其他 | Training Dummy、Glad Dummy |

### 模式 B：shudder = 8，步长 = 1

主要用于 **瀑布 (Waterfall)** 及之后区域的怪物，以及大部分 Boss。

<!-- 源码：gml_Object_obj_basicmonster_Alarm_3.gml -->
```javascript
if (sha == 0)
    sha = x
x = sha + shudder
if (shudder < 0)
    shudder = -(shudder + 1)
else
    shudder = -shudder
if (shudder == 0)
{
    sha = 0
    global.hurtanim[myself] = 2
    exit
}
alarm[3] = 2
```

震动序列：`+8 → -7 → +6 → -5 → +4 → -3 → +2 → -1 → 0`（共 8 次振荡）

**使用此模式的怪物（部分列举）：**

| 区域 | 怪物 |
|------|------|
| 雪町 | Snowdrake、Chilldrake |
| 瀑布 | Aaron、Shyren、Temmie、Woshua、Moldsmal (Moldessa)、Migospel |
| 热地 | Vulkin、Tsunderplane、Pyrope、Madjick、Astigmatism |
| 核心 | Final Froggit、Whimsalot、Knight Knight |
| 真实验室 | Memoryhead、Reaper Bird、Endogeny、Lemon Bread |
| Boss | Sans、Undyne、Mettaton EX、Mettaton NEO、Asgore、Muffet、Asriel |

## 特殊情况

并非所有怪物都严格遵循上述两种模式，存在一些特殊的初始值：

- **Toriel**（`obj_torielboss`）：通常 `shudder = 16`，步长 2。但如果单次伤害超过 100（即屠杀线秒杀），则 `shudder = 32`，产生剧烈震动。
  <!-- 源码：gml_Object_obj_torielboss_Step_0.gml:61-65 -->

- **Undyne**（`obj_undyneboss`）：通常 `shudder = 8`，步长 1。但被击杀时（`global.monsterhp[myself] < 1`），`shudder = 16`，保持步长 1，产生 16 次较长的震动。
  <!-- 源码：gml_Object_obj_undyneboss_Step_0.gml:106-109 -->

- **Mad Dummy**（`obj_maddummy`）：`shudder = 1`，步长 1。仅产生极微弱的 1 次振荡——因为 Mad Dummy 是幽灵，物理攻击对其几乎无效。
  <!-- 源码：gml_Object_obj_maddummy_Step_0.gml:46 -->

## 示例（模式 A）

以 `shudder = 16`、步长 2 为例：

一开始是 16，先往右移 16 像素。

随后因为 shudder > 0，取负数变为 -16。

然后由于 shudder < 0，取负数并减小 2，变成 14。

再取负数 -14……

直到 0，动画结束。

两种模式都产生 **8 次振荡**（`16 / 2 = 8`，`8 / 1 = 8`），持续时间相同（每步 2 帧 = 16 帧），但模式 A 的幅度是模式 B 的两倍。
