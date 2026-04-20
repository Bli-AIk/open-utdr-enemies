+++
title = "战斗布局 (Battle Layout)"
description = "UNDERTALE enemy mechanism analysis - Battle Layout"
date = 2026-04-20T15:00:00+08:00
updated = 2026-04-20T15:00:00+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 概述

UNDERTALE 的内部分辨率为 **640×480** 像素。战斗界面自上而下可分为四个区域：

| 区域 | Y 坐标范围 | 高度 | 用途 |
|------|-----------|------|------|
| 怪物区域 | 0 ~ 250 | ≈250 | 显示怪物精灵图 |
| 战斗框 | 250 ~ 385 | 135 | 闪避弹幕 / 显示菜单文本 |
| 状态栏 | 400 ~ 420 | 20 | 角色名、LV、HP 条 |
| 按钮栏 | ≈430 ~ 460 | ≈30 | FIGHT / ACT / ITEM / MERCY |

下文将逐一分析每个区域的具体实现。

## 战斗框 (Battle Box)

战斗框是战斗系统的核心 UI 元素——白色矩形边界，玩家的灵魂在其中闪避弹幕。

### 基本结构

战斗框由四个独立的边界对象组成：

| 对象 | 角色 | 定位基准 |
|------|------|---------|
| `obj_uborder` | 上边界 | `idealborder[0]`, `idealborder[2]` (左上角) |
| `obj_dborder` | 下边界 | `idealborder[0]`, `idealborder[3]` (左下角) |
| `obj_lborder` | 左边界 | `idealborder[0]`, `idealborder[2]` (左上角) |
| `obj_rborder` | 右边界 | `idealborder[1]`, `idealborder[3]` (右下角) |

它们的位置和大小由全局数组 `global.idealborder[]` 控制：

- `global.idealborder[0]` — 左边界 X
- `global.idealborder[1]` — 右边界 X
- `global.idealborder[2]` — 上边界 Y
- `global.idealborder[3]` — 下边界 Y

<!-- 源码：gml_Object_obj_battlecontroller_Draw_0.gml -->
在战斗框内部，`obj_battlecontroller` 的 Draw 事件绘制黑色填充矩形：

```javascript
if (instance_exists(obj_uborder))
{
    depth = 5
    draw_set_color(c_black)

    if (drawrect == 1)
        draw_rectangle(obj_uborder.x + 5, obj_uborder.y + 5, obj_rborder.x, obj_dborder.y, false)
}
```

黑色矩形向内偏移 5 像素，确保白色边框可见。

### 默认尺寸

<!-- 源码：gml_Script_SCR_BORDERSETUP.gml -->
默认战斗框 (`global.border = 0`) 的坐标为：

```javascript
global.idealborder[0] = 32   // 左
global.idealborder[1] = 602  // 右
global.idealborder[2] = 250  // 上
global.idealborder[3] = 385  // 下
```

即 **570×135** 像素，水平近乎占满屏幕（640 - 32×2 = 576，实际 602-32=570），位于画面中下方。

### 边界动画

边界对象并非瞬间到达目标位置，而是以 **每帧 15 像素** 的速度平滑移动。

<!-- 源码：gml_Object_obj_uborder_Step_0.gml -->
```javascript
if (x != global.idealborder[0])
{
    if (abs(x - global.idealborder[0]) <= 15)
        x = global.idealborder[0]
    else if (x > global.idealborder[0])
        x -= 15
    else
        x += 15
}
```

宽度通过 `image_xscale` 缩放实现，计算公式为：

- 上边界 / 左边界：`image_xscale = (idealborder[1] - idealborder[0]) / 5`
- 下边界：`image_xscale = 1 + (idealborder[1] - idealborder[0]) / 5`
- 左边界 / 右边界（纵向）：`image_yscale = (idealborder[2] - idealborder[3]) / 5`

缩放动画的步长为水平 6、垂直 3，比位置动画更细腻。

特殊标记 `instaborder = 1` 可以跳过动画，瞬间将边界移至目标位置。

### 战斗框预设

游戏中定义了 **50 余种** 战斗框预设，通过 `global.border` 值选择。以下是代表性的几种：

| border 值 | 坐标 [左, 右, 上, 下] | 尺寸 | 典型用途 |
|-----------|----------------------|------|---------|
| 0 | [32, 602, 250, 385] | 570×135 | 默认（大多数普通战斗） |
| 1 | [217, 417, 180, 385] | 200×205 | 居中窄框 |
| 4 | [267, 367, 295, 385] | 100×90 | 极小框 |
| 5 | [192, 442, 250, 385] | 250×135 | 中等宽度 |
| 9 | [132, 492, 250, 385] | 360×135 | 宽框 |
| 12 | [居中±40] | 80×80 | 居中正方形 |
| 16 | [居中±50, 50, 385] | 100×335 | 全高窄框 |
| 28 | [235, 405, 35, 385] | 170×350 | 近全高 |
| 31 | [32, 602, 100, 385] | 570×285 | 全宽高框 |
| 37 | [120, 520, 动态, 385] | 400×200 | 自定义高度 |

<!-- 源码：gml_Script_SCR_BORDERSETUP.gml -->
其中，`border = 12` 和 `border = 16` 等使用 `room_width / 2` 进行居中计算：

```javascript
// border 12 - 居中正方形
global.idealborder[0] = (room_width / 2) - 40
global.idealborder[1] = (room_width / 2) + 40
global.idealborder[2] = (room_height / 2) - 40
global.idealborder[3] = (room_height / 2) + 40
```

`border = 22` 和 `border = 23` 是特殊的动态预设，会根据紫色灵魂 (`obj_purpleheart`) 的 Y 坐标调整上边界：

```javascript
// border 22
offpurple = 0
if (instance_exists(obj_purpleheart))
{
    offpurple = obj_purpleheart.yzero
    if (offpurple > 250)
        offpurple = 250
}
global.idealborder[2] = 250
if (offpurple != 0)
    global.idealborder[2] = offpurple - 10
```

## 怪物区域

怪物精灵图显示在战斗框上方，Y 坐标通常在 16 ~ 156 范围内。

<!-- 源码：gml_Script_scr_battlegroup.gml -->
### 定位规则

怪物位置在 `scr_battlegroup` 脚本中逐个指定。常见模式为：

**单个怪物（居中）：**

```javascript
// Froggit 单体
global.monsterinstance[0] = instance_create(216, 136, obj_froggit)
```

X=216 约为屏幕中央偏左（考虑精灵宽度后视觉居中）。

**两个怪物（左右分列）：**

```javascript
// Froggit + Whimsun
global.monsterinstance[0] = instance_create(216, 136, obj_froggit)
global.monsterinstance[1] = instance_create(317, 16, obj_whimsun)
```

```javascript
// 两个 Froggit
global.monsterinstance[0] = instance_create(116, 136, obj_froggit)
global.monsterinstance[1] = instance_create(320, 136, obj_froggit)
```

**三个怪物（均匀分布）：**

```javascript
// 三个 Moldsmal
global.monsterinstance[0] = instance_create(15, 156, obj_moldsmal)
global.monsterinstance[1] = instance_create(217, 156, obj_moldsmal)
global.monsterinstance[2] = instance_create(421, 156, obj_moldsmal)
```

三个怪物的典型 X 坐标：约 14-15、216-218、421-422，将 640 像素宽度大致三等分。

**Boss 怪物** 通常更靠上方：

```javascript
// Toriel: X=250, Y=42（Boss 体型较大，需要更多空间）
global.monsterinstance[0] = instance_create(250, 42, obj_torielboss)
```

### Boss 怪物的额外偏移

部分 Boss 的 Y 坐标会根据战斗框上边界动态调整：

<!-- 源码：gml_Object_obj_sansb_body_Draw_0.gml -->
```javascript
// Sans 的 body 定位：
y = global.idealborder[2] - 130
```

这保证 Boss 精灵始终位于战斗框上方 130 像素处，即使战斗框变形也能正确显示。

## 状态栏 (HP/LV)

状态栏固定在 Y=400 位置，由 `scr_binfowrite` 脚本绘制。

### 普通模式

<!-- 源码：gml_Script_scr_binfowrite.gml -->
```javascript
// 红色背景条（最大 HP）
draw_set_color(c_red)
draw_rectangle(275, 400, 275 + (global.maxhp * 1.2), 420, false)

// 黄色填充条（当前 HP）
draw_set_color(c_yellow)
draw_rectangle(275, 400, 275 + (global.hp * 1.2), 420, false)

// HP 数值文本
draw_text(290 + (global.maxhp * 1.2), 400,
    hpwrite + " / " + string(global.maxhp))

// 角色名和 LV
draw_text(30, 400,
    string(global.charname) + "   LV " + string(global.lv))
```

| 元素 | 位置 | 说明 |
|------|------|------|
| 角色名 + LV | X=30, Y=400 | 左对齐，使用 `fnt_curs` 字体 |
| HP 条背景 | X=275 ~ 275+(maxhp×1.2), Y=400~420 | 红色，20 像素高 |
| HP 条填充 | X=275 ~ 275+(hp×1.2), Y=400~420 | 黄色 |
| HP 数值 | X=290+(maxhp×1.2), Y=400 | 格式 "HP / MaxHP" |

每 1 点 HP 对应 **1.2 像素** 的条长度。LV 1 时 maxhp=20，HP 条宽度为 24 像素；LV 20 时 maxhp=99，HP 条宽度为 118.8 像素。

HP 显示有特殊的补零逻辑：HP < 10 时前补 "0"（如 "09"）。

### KR 模式

Sans 战中使用的 KR 模式，状态栏有所不同：

```javascript
// 底色变为暗红
draw_set_color(merge_color(c_red, c_maroon, 0.5))
draw_rectangle(255, 400, 255 + (global.maxhp * 1.2), 420, false)

// 黄色 HP 条
draw_set_color(c_yellow)
draw_rectangle(255, 400, 255 + (global.hp * 1.2), 420, false)

// 品红色 KR 伤害条（在 HP 条上叠加）
draw_set_color(c_fuchsia)
draw_rectangle(255 + (global.hp * 1.2), 400,
    (255 + (global.hp * 1.2)) - (global.km * 1.2), 420, false)
```

KR 模式的 HP 条起始 X 从 275 左移到 **255**，并额外绘制品红色的 KR 持续伤害条。KR 值上限为 40，且不会超过当前 HP - 1。

### 怪物 HP 条

选择 FIGHT/ACT 目标时，怪物列表旁会显示 HP 条：

<!-- 源码：gml_Object_obj_battlecontroller_Draw_0.gml -->
```javascript
// xwrite = 190 + (最长怪物名字长度 * 16)
for (i = 0; i < 3; i++)
{
    if (global.monster[i] == 1)
    {
        draw_set_color(c_red)
        draw_rectangle(xwrite, 280 + (i * 32),
            xwrite + 100, 280 + (i * 32) + 16, false)

        draw_set_color(c_lime)
        draw_rectangle(xwrite, 280 + (i * 32),
            xwrite + ((global.monsterhp[i] / global.monstermaxhp[i]) * 100),
            280 + (i * 32) + 16, false)
    }
}
```

| 属性 | 值 |
|------|---|
| 固定宽度 | 100 像素 |
| 高度 | 16 像素 |
| 行间距 | 32 像素（Y=280、312、344） |
| 背景色 | 红色 (c_red) |
| 填充色 | 黄绿色 (c_lime) |
| X 起始 | 190 + (最长怪物名 × 16 像素) |

HP 条填充宽度 = `100 × (当前HP / 最大HP)`。

## 按钮栏

底部四个按钮为房间内预置对象，通过 `global.bmenucoord[0]` 索引：

| 索引 | 按钮对象 | 功能 |
|------|---------|------|
| 0 | `obj_fightbt` | FIGHT（战斗） |
| 1 | `obj_talkbt` | ACT（行动） |
| 2 | `obj_itembt` | ITEM（物品） |
| 3 | `obj_sparebt` | MERCY（饶恕） |

### 按钮选中逻辑

所有按钮共享相同的选中机制。以 FIGHT 按钮为例：

<!-- 源码：gml_Object_obj_fightbt_Step_0.gml -->
```javascript
image_index = 0

if (global.bmenucoord[0] == 0)          // 当前选中 FIGHT
{
    if (global.myfight == 0)
    {
        if (global.mnfight == 0)
            image_index = 1              // 显示高亮精灵
    }

    if (global.bmenuno == 0)             // 在主菜单界面
    {
        obj_heart.x = x + 8             // 灵魂定位到按钮上
        obj_heart.y = y + 14
    }
}
```

`image_index = 0` 为未选中（空心），`image_index = 1` 为选中（填充高亮，橙色）。灵魂图标 ♥ 定位在按钮的 **(X+8, Y+14)** 处。

按钮之间用左右方向键切换，索引循环（0→1→2→3→0）。

### 特殊状态

- 当 `global.mercy == 2` 时，MERCY 按钮被跳过（如 Asgore 战中按钮被破坏）
- 当 `global.mercy == 3` 时，只能选择 ACT 按钮
- ACT 按钮 (`obj_talkbt`) 有特殊的彩虹闪烁效果（`spec = 1` 时）：

```javascript
if (spec == 1)
{
    spec_x++
    image_blend = make_color_hsv(spec_x * 12, 160, 255)
}
```

## 玩家灵魂 (SOUL)

红色心形灵魂 (`obj_heart`) 是玩家在战斗中的化身，尺寸为 **16×16** 像素。

### 移动系统

<!-- 源码：gml_Object_obj_heart_Keyboard_37.gml 等 -->
基本移动速度为 `global.sp`（从 `global.asp` 初始化）。按住 Shift 键时速度减半：

```javascript
// 向左移动（Keyboard_37 = Left Arrow）
x -= global.sp
if (keyboard_multicheck(16) == 1)   // Shift 键
    x += (global.sp / 2)            // 减速：净移动 = sp/2
```

### 边界限制

灵魂被限制在战斗框内部。一般战斗中，边界判定使用 **8 像素** 内边距：

<!-- 源码：gml_Object_obj_heart_Step_0.gml -->
```javascript
if (x < (obj_lborder.x + 8))
    x = obj_lborder.x + 8
if (y < (obj_uborder.x + 8))
    y = obj_uborder.x + 8
if (x > (obj_rborder.x - 8))
    x = obj_rborder.x - 8
if (y > (obj_dborder.y - 8))
    y = obj_dborder.y - 8
```

Sans 战中使用不同的边距——左/上 **4 像素**，右/下 **16 像素**（匹配灵魂精灵的完整宽高）：

```javascript
// Sans 战专用边界
if (x < (global.idealborder[0] + 4))
    x = global.idealborder[0] + 4
if (y < (global.idealborder[2] + 4))
    y = global.idealborder[2] + 4
if (x > (global.idealborder[1] - 16))
    x = global.idealborder[1] - 16
if (y > (global.idealborder[3] - 16))
    y = global.idealborder[3] - 16
```

### 蓝色灵魂（重力模式）

当 `movement = 2` 时，灵魂受重力影响（蓝色灵魂模式）。上键触发跳跃，初始速度 -6：

```javascript
if (movement == 2)
{
    if (jumpstage == 1 && vspeed == 0)
    {
        jumpstage = 2
        vspeed = -6
    }
}
```

重力加速度分段处理：

```javascript
if (vspeed > 0.5 && vspeed < 8)
    vspeed += 0.6
if (vspeed > -1 && vspeed <= 0.5)
    vspeed += 0.2
if (vspeed > -4 && vspeed <= -1)
    vspeed += 0.5
if (vspeed <= -4)
    vspeed += 0.2
```

`movement = 11`、`12`、`13` 分别对应重力朝左、朝下、朝右的变体（分别用于 Sans 战的不同阶段）。

### 菜单中的灵魂定位

灵魂在不同菜单状态下的位置由 `obj_battlecontroller` 的 Step 事件控制：

<!-- 源码：gml_Object_obj_battlecontroller_Step_0.gml -->
| 菜单状态 (`bmenuno`) | 灵魂 X | 灵魂 Y |
|----------------------|--------|--------|
| 0（主菜单） | 跟随当前按钮 + 8 | 跟随当前按钮 + 14 |
| 1/2/11（选择怪物） | `idealborder[0] + 32` | `idealborder[2] + 28 + (bmenucoord[1] × 32)` |
| 3/3.5（物品列表） | 列1: `+32`，列2: `+280` | 行1: `+28`，行2: `+60` |
| 4（MERCY 选项） | `idealborder[0] + 32` | `idealborder[2] + 28 + (bmenucoord[4] × 32)` |
| 10（ACT 对话选项） | 列1: `+32`，列2: `+292` | `+28 + (索引 × 32)` |

物品列表为 **2×2 网格**（每页 4 项），共两页（`bmenuno = 3` 和 `3.5`）。

## 战斗文本系统

战斗内的文本由 `OBJ_WRITER`（逐字显示）和 `OBJ_INSTAWRITER`（瞬间显示）渲染。

### 文本参数

<!-- 源码：gml_Script_SCR_TEXTSETUP.gml -->
文本通过 `SCR_TEXTSETUP` 配置，参数依次为：

1. **字体** (`myfont`)
2. **颜色** (`mycolor`)
3. **起始 X** (`writingx`)
4. **起始 Y** (`writingy`)
5. **换行 X** (`writingxend`)
6. **抖动** (`shake`)
7. **打字速度** (`textspeed`)
8. **音效** (`txtsound`)
9. **字符间距** (`spacing`)
10. **行间距** (`vspacing`)

### 战斗默认文本样式

<!-- 源码：gml_Script_SCR_TEXTTYPE.gml -->
`global.typer = 1`（战斗内通用）：

```javascript
SCR_TEXTSETUP(fnt_main, c_white,
    x + 20, y + 20,              // 起始位置（战斗框左上 + 20px 内边距）
    x + (global.idealborder[1] - 55),  // 换行位置
    1,                            // 抖动程度
    1,                            // 打字速度（每帧 1 字符）
    SND_TXT2,                     // 音效
    16,                           // 字符间距
    32)                           // 行间距
```

其中 `x` 为 `OBJ_WRITER` 的创建位置，即 `global.idealborder[0]`（战斗框左边界）。因此文本实际起始于 **(idealborder[0] + 20, idealborder[2] + 20)**。

## 玩家属性计算

<!-- 源码：gml_Object_obj_battlecontroller_Create_0.gml -->
战斗开始时根据 LV 计算玩家属性：

```javascript
global.maxhp = 16 + (global.lv * 4)
global.at = 8 + (global.lv * 2)
global.df = 9 + ceil(global.lv / 4)
```

| LV | MaxHP | AT | DF |
|----|-------|----|----|
| 1 | 20 | 10 | 10 |
| 5 | 36 | 18 | 11 |
| 10 | 56 | 28 | 12 |
| 15 | 76 | 38 | 13 |
| 19 | 92 | 46 | 14 |
| 20 | **99** | **30** | **30** |

LV 20 为硬编码的特殊值（`maxhp = 99, at = 30, df = 30`），不遵循公式。

HP 存在溢出保护：`if (global.hp > global.maxhp + 15) global.hp = global.maxhp + 15`，允许最多超过上限 15 点。

## 无敌时间

<!-- 源码：gml_Object_obj_battlecontroller_Step_0.gml -->
受击后的无敌帧数（`global.inv`）默认为 **30 帧**，可被装备修改：

| 条件 | 修改 |
|------|------|
| 默认 | 30 |
| Undyne EX 战 | 30 - LV |
| Spider Armor 且非蜘蛛甲 | +20 |
| 蜘蛛甲 (armor=44) | +30 |
| 牛仔裤 (armor=64) | +15 |
| 芭蕾舞鞋 (weapon=45) | +15 |
| 下限 | 15 |

## 战斗流程状态机

战斗流程通过 `global.myfight` 和 `global.mnfight` 两个变量控制：

**`global.myfight`（玩家回合）：**

| 值 | 状态 | 说明 |
|---|------|------|
| 0 | 菜单 | 等待玩家选择 |
| 1 | 攻击中 | 播放攻击动画 |
| 2 | 对话中 | 怪物对话/ACT 回应 |
| 3 | 特殊选择 | 对话中的二选一 |
| 4 | 使用物品/饶恕 | 物品/逃跑结算 |

**`global.mnfight`（怪物回合）：**

| 值 | 状态 | 说明 |
|---|------|------|
| 0 | 等待 | 等待怪物回合开始 |
| 1 | 攻击准备 | 怪物开始攻击 |
| 2 | 闪避中 | 玩家在战斗框内闪避 |
| 3 | 边框复位 | 战斗框动画恢复默认大小 |

回合结束后，边框自动恢复默认尺寸（`border = 0`），待边框动画完成（`obj_lborder.x == global.idealborder[0]`）后进入下一回合。
