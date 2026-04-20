+++
title = "Mizzle (小米泽尔)"
description = "DELTARUNE enemy animation analysis - Mizzle"
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

Mizzle 使用 `obj_mizzle_enemy` 对象，由**单个精灵**构成。使用与 Holy Watercooler 相同的 `spr_holywater` 系列精灵：

- **待机精灵：** `spr_holywater_idle` / `spr_holywater_alarm`
- **受伤精灵：** `spr_holywater_hurt`
- **饶恕精灵：** `spr_holywater_spared`

## 公式

### 浮动动画

```javascript
// 正弦浮动
y = ystart + (sin(siner * 0.5) * 5);
// siner * 0.5 → 低频浮动
// 5px 振幅
```

注意浮动公式直接写在 `Draw_0` 开头，每帧执行——`siner` 的递增由 `scr_enemy_drawidle_generic` 内部处理。

### 首帧保护

```javascript
firstframe++;

if (firstframe > 1) {
    scr_enemy_drawhurt_generic();
    scr_enemy_drawidle_generic(0.16666666666666666);
}
```

`firstframe` 计数器确保创建后第一帧不执行绘制——避免初始化未完成时的闪烁。

### 闪烁重置

```javascript
if (becomeflash == 0)
    flash = 0;

becomeflash = 0;
```

与 Holy Watercooler 共享的闪烁控制——`becomeflash` 每帧归零，外部代码需要每帧重新设置才能维持闪烁。
