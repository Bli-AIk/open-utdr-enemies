+++
title = "GIGA Queen (巨型女王)"
description = "DELTARUNE enemy animation analysis - Giga Queen"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 15
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Giga Queen 使用 `obj_gigaqueen_enemy` 对象，是一场**拳击机甲战**，不使用传统精灵系统：

- **背景控制器：** `obj_boxingqueen_black_bg`
- **3D 效果：** `obj_3d_bg_effect`
- **拳击控制器：** `o_boxingcontroller`
- **拳击女王：** `o_boxingqueen`

所有渲染由子控制器对象处理，而非 Giga Queen 自身的 Draw 事件。

## 公式

### 生命值系统

```javascript
// 基础 HP 200 + 招募加成（最多 +50）
hp = 200;

// 从 flag[254] 到 flag[644] 统计招募数量
var recruit_count = 0;
for (var i = 254; i <= 644; i++) {
    if (global.flag[i] > 0)
        recruit_count += 1;
}
hp += min(recruit_count, 50);
```

### 拳击战系统

```javascript
// turn 变量追踪回合
// 玩家需要在闪避后反击

didntpunchthisturn = 0;   // 本回合是否未出拳
playerhasntdodged = 0;    // 玩家是否未闪避
haventusedspell = 0;      // 是否未使用法术
extradamage = 0;          // 额外伤害倍率
```

### 特殊机制

```javascript
// 物品系统在机甲战中保留
// 法术使用追踪
// 战斗结束后恢复正常系统
```
