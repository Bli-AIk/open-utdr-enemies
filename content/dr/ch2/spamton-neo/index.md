+++
title = "Spamton NEO"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 17
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Spamton NEO 使用 `obj_spamton_neo_enemy` 对象，是全游戏最复杂的敌人之一，由 **8 个身体部件 + 18 层背景藤蔓**组成：

### 8 部件系统
| 索引 | 精灵 | 部位 |
|------|------|------|
| 0 | `spr_sneo_wingl` | 左翼 |
| 1 | `spr_sneo_arml` | 左臂 |
| 2 | `spr_sneo_legl` | 左腿 |
| 3 | `spr_sneo_legr` | 右腿 |
| 4 | `spr_sneo_body` | 躯干 |
| 5 | `spr_sneo_head` | 头部 |
| 6 | `spr_sneo_armr` | 右臂 |
| 7 | `spr_sneo_wingr` | 右翼 |

### 追踪数组
每个部件拥有独立的：
- `partframe[i]`：当前帧
- `partsiner[i]`：独立动画计时器
- `partrot[i]`：旋转角度
- `partx[i]` / `party[i]`：位置偏移
- `partvisible[i]`：可见性
- `partweakened[i]`：虚弱标记

## 公式

### 部件动画速率

```javascript
// 每个部件有不同的 siner 递增速率
partsiner[i] += 1 + (i / 5);
// 索引越高的部件动画越快
// 部件 0: +1.0/帧, 部件 7: +2.4/帧
```

### 手臂摆动（partmode 1: 待机）

```javascript
// 手臂使用正弦旋转
partrot[1] = lerp(partrot[1],
    sin(partsiner[1] / 30) * 15, 0.25 * f);
partrot[6] = lerp(partrot[6],
    -sin(partsiner[6] / 30) * 15, 0.25 * f);
// f = 帧率因子
// lerp 插值使运动平滑
```

### 头部动画

```javascript
// 头部缓慢下倾
partrot[5] -= 10 * f;  // 每帧下降 10°（插值后）
// 结合 lerp 实现渐进的低头效果
```

### 背景藤蔓系统（18 层）

```javascript
// 18 条藤蔓使用较慢的 siner
partsiner_back[ii] += 0.5;  // 背景速率为身体的一半

// 藤蔓从根部延伸到 y-400
draw_line_width(vine_x, vine_y,
    vine_x + sin(partsiner_back[ii] / 20) * 8,
    vine_y - 400, 4);

// 颜色：暗绿 make_colour_rgb(0, 51, 0)
```

### 34 种 partmode 动画模式

```javascript
// 主要模式：
// mode 0: 站立（头部倾斜 -30°，其余归零）
// mode 1: 待机摆动（手臂正弦 15° 振幅）
// mode 2: 电击（随机旋转 shocker < 0 时）
// mode 3: 空闲（头部微倾）
// mode 4: 射击（24 帧序列，手臂瞄准）
// mode 5-8: 战斗姿态
// mode 15-18: 头部缩放变化（0.5 → 1.0 → 1.5）
// mode 20: 败北姿态（随机 ±3° 抖动）
// mode 21-25: 挣扎动画（正弦手臂摆动）
```

### 手臂瞄准系统

```javascript
// 左臂追踪玩家心灵位置
arm_endpoint_x = x + lengthdir_x(armlength, partrot[1] - 93);
arm_endpoint_y = y + lengthdir_y(armlength, partrot[1] - 93);
// armaim 随帧更新跟踪玩家位置
```

### 虚弱化机制

```javascript
// weakentimer 计数到 10
weakentimer += 1;
if (weakentimer >= 10) {
    weakentimer = 0;
    // 施加随机抖动
    weakenshakeamount = random_range(-2, 2);
}

// 虚弱部件视觉变化：线条颜色变橙 + 白色闪烁覆盖
```

### 暴力结局闪烁

```javascript
// violentendflash 控制白色覆盖
// 所有藤蔓上方覆盖白色线条
// alpha = violentendflash / 10
```
