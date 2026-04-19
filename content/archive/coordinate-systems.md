+++
title = "游戏引擎坐标系对照"
description = "从 GameMaker 出发，对比各引擎的坐标系差异与 UTAF 格式的坐标约定。"
date = 2026-04-18T00:00:00+08:00
updated = 2026-04-18T00:00:00+08:00
draft = false
weight = 20
sort_by = "weight"
template = "page.html"

[extra]
lead = "GMS 坐标系是所有 Undertale 原作坐标数据的基础。本文梳理 GMS 坐标定义，对比主流引擎差异，并说明 UTAF 格式的坐标约定。"
toc = true
top = false
+++

## GameMaker Studio 坐标系

Undertale / Deltarune 使用 GameMaker Studio（GMS）开发。理解 GMS 的坐标系定义，是正确使用所有原作坐标数据的前提。

### 基本定义

| 属性 | 定义 |
|------|------|
| **原点** | 房间（Room）左上角 |
| **X 轴** | 向右为正 |
| **Y 轴** | 向下为正 |
| **旋转方向** | 逆时针为正（屏幕上看） |
| **角度单位** | 度（°） |

在 GMS 中，`0°` 表示精灵朝右，`90°` 表示朝上，`180°` 表示朝左。

### Sprite Origin（精灵轴点）

每个 GMS 精灵都有一个 **Origin**（轴点），用于定义缩放与旋转的中心。

- 轴点坐标以精灵左上角为原点、像素为单位
- 例如一个 `40×60` 像素的精灵，轴点 `(20, 58)` 表示接近底部中央

`draw_sprite_ext` 的 `x, y` 参数指定的是**轴点在房间中放置的位置**，而非精灵左上角。

### draw_sprite_ext 参数

```gml
draw_sprite_ext(sprite, subimg, x, y, xscale, yscale, rot, colour, alpha)
```

| 参数 | 说明 |
|------|------|
| `x, y` | 轴点在房间中的位置 |
| `xscale, yscale` | 缩放倍率（负值产生翻转） |
| `rot` | 旋转角度，逆时针为正，度数 |

缩放和旋转都围绕 Origin 进行。

---

## 引擎坐标系对比

以下按与 GMS 的**相似度从高到低**排列。

### 坐标系、旋转完全一致

#### Clickteam Fusion

| 属性 | GMS | Clickteam Fusion |
|------|-----|------------------|
| Y 轴方向 | ↓ 正 | ↓ 正 |
| 旋转正方向 | 逆时针 | 逆时针 |
| 角度单位 | 度 | 度 |

Clickteam Fusion 的 2D 坐标系与 GMS 完全一致：Y 轴向下、旋转以度为单位且逆时针为正。GMS 的坐标数据可直接使用，无需任何转换。

### 仅旋转存在差异

#### Godot 2D

| 属性 | GMS | Godot 2D |
|------|-----|----------|
| Y 轴方向 | ↓ 正 | ↓ 正 |
| 旋转正方向 | 逆时针 | **顺时针** |
| 角度单位 | 度 | **弧度** |

Godot 2D 与 GMS 的坐标轴方向完全一致，但旋转约定相反。将 GMS 角度迁移到 Godot 时需要：

```
godot_rotation = -gms_angle * π / 180
```

#### Web Canvas 2D

| 属性 | GMS | Canvas 2D |
|------|-----|-----------|
| Y 轴方向 | ↓ 正 | ↓ 正 |
| 旋转正方向 | 逆时针 | **顺时针** |
| 角度单位 | 度 | **弧度** |

Canvas 2D 的 `ctx.rotate()` 遵循数学上"Y 轴向下时正角度 = 顺时针"的惯例。本站在渲染 UTAF 动画时，通过取反旋转角度来匹配 GMS 约定：

```js
ctx.rotate(-rot * Math.PI / 180);
```

#### Love2D

| 属性 | GMS | Love2D |
|------|-----|--------|
| Y 轴方向 | ↓ 正 | ↓ 正 |
| 旋转正方向 | 逆时针 | **顺时针** |
| 角度单位 | 度 | **弧度** |

Love2D 与 Canvas 2D、Godot 2D 的旋转约定一致。转换公式相同：

```lua
love_rotation = -gms_angle * math.pi / 180
```

### 仅坐标系存在差异

#### Cocos2d-x

| 属性 | GMS | Cocos2d-x |
|------|-----|-----------|
| Y 轴方向 | ↓ 正 | **↑ 正** |
| 旋转正方向 | 逆时针 | 逆时针 |
| 角度单位 | 度 | 度 |

Cocos2d-x 使用数学标准坐标系（原点在左下角、Y 轴向上），但旋转方向和角度单位与 GMS 一致。迁移时只需翻转 Y 坐标：

```cpp
cocosPosition.y = screenHeight - gmsPosition.y;
// 旋转角度可直接使用
```

#### Unity 2D

| 属性 | GMS | Unity 2D |
|------|-----|----------|
| Y 轴方向 | ↓ 正 | **↑ 正** |
| 旋转正方向 | 逆时针 | 逆时针 |
| 角度单位 | 度 | 度 |

Unity 的 Y 轴朝上，旋转方向与角度单位都和 GMS 一致。迁移坐标时需要翻转 Y：

```csharp
unityPosition.y = -gmsPosition.y;
// 旋转角度可直接使用
```

Y 轴翻转虽然只有一处差异，但它会影响所有涉及 Y 坐标的数据（位置、轴点 Y 分量、路径等），实际迁移工作量往往最大。

### 坐标系、旋转均存在差异

#### Bevy（2D 模式）

| 属性 | GMS | Bevy 2D |
|------|-----|---------|
| Y 轴方向 | ↓ 正 | **↑ 正** |
| 旋转正方向 | 逆时针 | 逆时针 |
| 角度单位 | 度 | **弧度** |

Bevy 使用标准数学坐标系（Y 轴向上）和弧度制。虽然旋转方向与 GMS 相同（逆时针为正），但由于 Y 轴翻转加上弧度制，同时存在两类差异：

```rust
let bevy_y = -gms_y;
let bevy_rotation = gms_angle * std::f32::consts::PI / 180.0;
```

#### Unreal Engine

| 属性 | GMS | Unreal Engine |
|------|-----|---------------|
| 坐标类型 | 2D | **3D 左手系** |
| X / Y / Z | X 右, Y 下 | **X 前, Y 右, Z 上** |
| 旋转 | 度, 逆时针 | **度, 自定义旋转序** |

Unreal 是面向 3D 的引擎，坐标体系与 GMS 完全不同。若在 Unreal 中制作 2D 效果，通常需要将 GMS 的 X 映射到 Unreal 的 Y、GMS 的 Y 映射到 Unreal 的 -Z，并将旋转转换为对应轴的旋转。

---

## 总结

| 引擎 | Y 轴 | 旋转正向 | 角度单位 | 差异类型 |
|------|------|---------|---------|---------|
| **GMS** | ↓ | 逆时针 | 度 | — |
| Clickteam Fusion | ↓ | 逆时针 | 度 | 完全一致 |
| Godot 2D | ↓ | 顺时针 | 弧度 | 仅旋转 |
| Canvas 2D | ↓ | 顺时针 | 弧度 | 仅旋转 |
| Love2D | ↓ | 顺时针 | 弧度 | 仅旋转 |
| Cocos2d-x | ↑ | 逆时针 | 度 | 仅坐标系 |
| Unity 2D | ↑ | 逆时针 | 度 | 仅坐标系 |
| Bevy 2D | ↑ | 逆时针 | 弧度 | 坐标系 + 单位 |
| Unreal | 3D 左手 | — | 度 | 完全不同 |

---

## UTAF 格式的坐标约定

**UTAF（UT Animation Format）的所有坐标数据均以 GMS 坐标系为准。**

这意味着：

- **位置**：`origin.x` / `origin.y` 使用 GMS 的 Y-down 坐标
- **旋转**：表达式中的旋转值遵循 GMS 的逆时针正方向、度数制
- **轴点**：`pivot` 中的值直接来自 GMS 精灵的 Origin
- **缩放**：`scale_x` 为负值时产生水平翻转，与 GMS 一致

各平台在实现 UTAF 渲染器时，需要根据自身引擎的坐标约定做适配。例如本站使用 Canvas 2D 渲染，在应用旋转时取反角度并转换为弧度：

```js
ctx.rotate(-rot * Math.PI / 180);
```

选择 GMS 坐标作为 UTAF 的标准，是因为所有原作数据（精灵轴点、绘制偏移、旋转角度）都直接来自 GameMaker 的 `data.win` 和 GML 源码，保持一致可以避免转换误差。
