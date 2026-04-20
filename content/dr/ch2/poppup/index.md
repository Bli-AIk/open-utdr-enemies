+++
title = "Poppup (弹窗怪)"
description = "DELTARUNE enemy animation analysis - Poppup"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 3
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Poppup 使用 `obj_poppup_enemy` 对象，由**主体 + 克隆弹窗**构成，拥有独特的**克隆增殖机制**：

- **待机精灵：** `spr_poppup_idle`
- **受伤精灵：** `spr_poppup_hurt`
- **饶恕精灵：** `spr_poppup_spared`
- **关闭精灵：** `spr_poppup_closed`（被关闭后的状态）
- **克隆：** 动态生成的 Poppup 副本

## 公式

### 待机动画

```javascript
// 标准帧率 siner / 5
siner += 1;
thissprite = spr_poppup_idle;

if (closed == 1)
    thissprite = spr_poppup_closed;

if (global.mercymod[myself] >= global.mercymax[myself])
    thissprite = spr_poppup_spared;

draw_sprite_ext(thissprite, siner / 5, x, y, 2, 2, 0, image_blend, 1);
```

### 克隆机制

```javascript
// 每次行动后可能生成克隆
if (clonecount < max_clones) {
    clone = instance_create(x + irandom_range(-40, 40),
                            y + irandom_range(-40, 40),
                            obj_poppup_clone);
    clone.parent = id;
    clonecount += 1;
}

// 关闭克隆 = 增加饶恕值
// 关闭主体（右上角 X）= 大幅增加饶恕值
```

### 受伤抖动

```javascript
// 通用受伤抖动
// 克隆在主体被击中时也会抖动（视觉连锁）
```
