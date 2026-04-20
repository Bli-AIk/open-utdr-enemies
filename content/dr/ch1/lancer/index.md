+++
title = "Lancer (蓝瑟)"
description = "DELTARUNE enemy animation analysis - Lancer"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 12
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Lancer 在游戏中有**三次 BOSS 战**，分别使用 `obj_lancerboss`、`obj_lancerboss2`、`obj_lancerboss3`。所有版本都由**单个精灵**构成，但拥有多种状态精灵：

- **待机：** `spr_lancerboss_idle`
- **受伤：** `spr_lancerboss_hurt`
- **对话：** `spr_lancerboss_talk`
- **准备攻击：** `spr_lancerboss_ready`
- **攻击中：** `spr_lancerboss_attack`
- **兴奋：** `spr_lancer_excited`

## 公式

### 第一次战斗（obj_lancerboss）

```javascript
// 帧速率：siner / 3（快速动画）
siner += 1;
thissprite = spr_lancerboss_idle;
draw_sprite_ext(thissprite, siner / 3, x, y, 2, 2, 0, image_blend, 1);
```

### 第二次战斗（obj_lancerboss2）

```javascript
// 更复杂的状态系统
// mode 变量控制当前动画状态
switch (mode) {
    case 0:  // 待机
        thissprite = spr_lancerboss_idle;
        break;
    case 1:  // 攻击准备
        thissprite = spr_lancerboss_ready;
        break;
    case 2:  // 对话
        thissprite = spr_lancerboss_talk;
        break;
}
```

### 第三次战斗（obj_lancerboss3）

```javascript
// 最复杂的版本——包含剧情状态切换
// 有 "兴奋" 表情（spr_lancer_excited）
// 在 Susie 暗杀他的脚本中使用

// 受伤状态下使用标准抖动
draw_sprite_ext(spr_lancerboss_hurt, 0,
    x + shakex, y, 2, 2, 0, image_blend, 1);
```

### 闪烁效果

```javascript
// 所有版本共享标准白色闪烁
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, siner / 3, x, y, 2, 2, 0,
    image_blend, (-cos(fsiner / 5) * 0.4) + 0.6);
d3d_set_fog(false, c_black, 0, 0);
```
