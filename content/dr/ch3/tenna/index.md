+++
title = "Tenna (天线怪)"
description = "DELTARUNE enemy animation analysis - Tenna"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 9
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Tenna 使用 `obj_tenna_enemy` 对象，是 Ch3 BOSS，拥有**多小游戏集成系统**（137 个初始化变量）：

- **指向精灵：** `spr_tenna_point_up`
- **受伤精灵：** `spr_tenna_hurt`
- **悲伤（饶恕）：** `spr_tenna_sad`
- **演员对象：** `tenna_actor`（动态动画实例）

## 公式

### 待机动画

```javascript
// 帧率 0.16666.../帧
siner += 0.16666666666666666;

// 使用 tenna_actor 实例进行动态绘制
// actor 系统允许多种表情/姿态切换
```

### 小游戏过渡系统

```javascript
// minigametype 控制当前小游戏类型
// 例如 "susiezilla" 等
// minigametransition_con 管理过渡状态机

// 过渡流程：
// 1. 静态噪声淡入
// 2. 切换小游戏场景
// 3. 静态噪声淡出
// 4. 新小游戏开始
```

### 多阶段战斗

```javascript
// phase 追踪当前阶段
// 每个小游戏有独立的难度追踪
// 观众机制影响战斗进程
```
