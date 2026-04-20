+++
title = "呼啸骑士 (Roaring Knight)"
description = "DELTARUNE enemy animation analysis"
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

Roaring Knight 使用 `obj_knight_enemy` 对象，是 Ch3 BOSS，拥有**残影系统**和**多阶段变身**：

- **待机精灵：** `spr_roaringknight_idle`
- **受伤精灵：** `spr_roaringknight_idle`（与待机相同）
- **饶恕精灵：** `spr_roaringknight_hurt`
- **球形过渡：** `spr_roaringknight_ball_transition`

## 公式

### 垂直浮动

```javascript
// 使用 cos 驱动的慢速浮动（8px 振幅）
siner2 += 1;  // 可与控制器共享
y = ystart + (cos(siner2 / 8) * 8);
```

### 残影系统

```javascript
// 每 4 帧在待机/受伤状态下生成残影
if (siner2 % 4 == 0) {
    afterimage = instance_create(x, y, obj_afterimage);
    // 残影自动淡出并销毁
}
```

### 受伤动画

```javascript
// 受伤时每 2 帧交替显示：
// 偶数帧：spr_roaringknight_idle
// 奇数帧：spr_roaringknight_ball_transition
// 附加 shakex 抖动
```

### 蓄力特效

```javascript
// chargeupcon 控制蓄力视觉
// 使用白色闪烁 + 雾化效果
// whiteflash 倒计时，alpha = 0.62
d3d_set_fog(true, c_white, 0, 1);
draw_sprite_ext(thissprite, ..., whiteflash_alpha);
d3d_set_fog(false, c_black, 0, 0);
```

### 特殊状态

```javascript
// 多阶段 BOSS 战
phase = 0;           // 当前阶段
stronghurtanim = 0;  // 强力受伤动画
chargeupcon = 0;     // 蓄力状态
// 伤害减免机制
```
