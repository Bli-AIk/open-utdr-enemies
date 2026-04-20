+++
title = "Dummy (训练用假人)"
description = "DELTARUNE enemy animation analysis - Dummy"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 11
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Dummy 使用 `obj_dummyenemy` 对象，由**单个精灵**构成，是教程中的练习用敌人：

- **待机精灵：** `spr_dummyenemy_idle`
- **受伤精灵：** `spr_dummyenemy_hurt`

## 公式

### 待机动画

```javascript
// Dummy 使用通用绘制函数
scr_enemy_drawidle_generic(6);  // 帧速率参数为 6
// 即 siner / 6，与 Rudinn 相同

siner += 1;
draw_sprite_ext(spr_dummyenemy_idle, siner / 6, x, y, 2, 2, 0, image_blend, 1);
```

### 受伤抖动

```javascript
// 使用通用受伤绘制
scr_enemy_drawhurt_generic();
// 标准交替 shakex 偏移

// Dummy 没有复杂状态——纯粹的教程靶子
```

### 特殊行为

```javascript
// 无饶恕精灵（教程敌人，不需要饶恕）
// 击败条件由教程脚本控制
// talkmax 设置得很大以配合教程对话
```
