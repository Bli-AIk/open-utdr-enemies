+++
title = "Rouxls Kaard"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 19
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Rouxls Kaard Ch2 使用 `obj_rouxls_enemy` 对象，驾驶**垃圾机器（Thrash Machine）**在水中战斗：

- **Rouxls 精灵：** `spr_rurus_pirate`（海盗装）
- **军刀精灵：** `spr_rurus_pirate_saber`
- **垃圾机器：** `obj_thrashmachine`（独立子对象）
  - 3 个部件：`part[0]`（机体类型 0/1/2）、`part[2]`（轮子配置）
- **水坑对象：** `obj_rouxls_puddle`（涟漪效果）
- **水花效果：** `obj_rouxls_splasheffect`
- **涟漪效果：** `obj_rouxls_ripple`
- **城市小游戏：** `obj_rouxls_simtown`

## 公式

### 垃圾机器位置

```javascript
// 机器相对于 Rouxls 的固定偏移
thrash.xx = x + 34;
thrash.yy = y + 108;
thrash.depth = depth + 5;  // 比 Rouxls 更深一层
```

### 水波动画

```javascript
// 垃圾机器的水上浮动
// wsiner 以 1.6/帧递增
thrash.wsiner += 1.6;

// 垂直起伏公式
wave_y = thrash.s * cos((thrash.wsiner + thrash.wsinerrate) / 3);

// 水坑位置随波浪同步
puddle_y = remy + 173 + (wave_y / 4);
```

### 垃圾机器状态机（thrashcon 0-7）

```javascript
// thrashcon 0-1: 潜入/浮出动画，生成水花效果
// thrashcon 2: 悬停——抛物线轨迹计算
y = (cameray() + 45) - (sin((thrashtimer / aimtime) * pi) * 10);
// aimtime 因轮子配置不同：4.71 ~ 10 帧

// thrashcon 3: 水平冲锋
x -= advancespeed;  // 8 像素/帧

// thrashcon 4: 悬停充能（90-105 帧）

// thrashcon 5: 返回
x += returnspeed;   // 6 像素/帧

// thrashcon 6: 潜入水坑

// thrashcon 7: 吠叫动画（50 帧延迟后攻击）
```

### 水花与涟漪

```javascript
// 状态转换时生成水花
splash = instance_create(x, y, obj_rouxls_splasheffect);
// 前、中、后三组水花
// 速度 0.5 ~ 2 像素/帧

// 悬停时每 8 帧生成涟漪
if (timer % 8 == 0) {
    ripple = instance_create(x, y, obj_rouxls_ripple);
    ripple.maxsize = clamp(1 - ((y - 90) / 45), 0.1, 2);
    // 涟漪大小随距离变化
}
```

### 受伤抖动

```javascript
// 标准递减抖动
hurtshake += 1;
if (hurtshake > 1) {
    if (shakex > 0) shakex -= 1;
    if (shakex < 0) shakex += 1;
    shakex = -shakex;
    hurtshake = 0;
}
```
