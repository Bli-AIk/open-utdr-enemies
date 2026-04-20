+++
title = "Lanino (拉尼诺)"
description = "DELTARUNE enemy animation analysis - Lanino"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 2
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Lanino 使用 `obj_lanino_enemy` 对象，由 **6 个身体部件**组成，拥有**肩部火焰**和 **4 种姿势**：

- **肩部（含火焰动画）**
- **腿部**
- **胸部**
- **头部**
- **左臂 + 左手**

另有 Rouxls 版本 `obj_lanino_enemy_rouxls`（姿势 -1）。

## 公式

### 身体弹跳

```javascript
animsiner += 1;

// 与 El Niña 相同的弹跳公式
boby = abs(sin(animsiner / 6) * -2) * -1;

// 姿势 3 下弹跳减半：boby * 0.5
// 其他姿势：boby * 1.5
// 左臂偏移：-7 + (boby * 4)
// 头部弹跳减半：boby * 0.5
```

### 肩部火焰动画

```javascript
// 独立的火焰帧计数器
shoulderflameindex += 0.125;  // 比身体动画慢很多

// 火焰作为肩部精灵的帧动画自动播放
// 叠加在肩部部件上方
```

### 摘墨镜特效

```javascript
// 使用 spr_enemy_lanino_removeglasses_front
// 酷姿势切换时的过渡动画
```

### 闪烁效果

```javascript
// 所有 6 个部件逐一闪烁
flash_alpha = (-cos(fsiner / 5) * 0.4) + 0.6;
```
