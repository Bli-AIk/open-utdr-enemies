+++
title = "Sweet Cap'n Cakes"
description = "DELTARUNE enemy animation analysis"
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

Sweet Cap'n Cakes 是**三人乐队组合 BOSS**，由三个独立对象组成：

### Sweet（主唱）
- **对象：** `obj_sweet_enemy`
- **待机精灵：** `spr_sweet_idle`
- **受伤精灵：** `spr_sweet_hurt`
- **舞蹈精灵：** `spr_sweet_dance`

### K.K.（DJ）
- **对象：** `obj_kk_enemy`
- **待机精灵：** `spr_kk_idle`
- **受伤精灵：** `spr_kk_hurt`
- **打碟精灵：** `spr_kk_scratch`

### Cap'n / Hat Guy（鼓手）
- **对象：** `obj_hatguy_enemy`
- **待机精灵：** `spr_hatguy_idle`
- **受伤精灵：** `spr_hatguy_hurt`
- **打鼓精灵：** `spr_hatguy_drum`

## 公式

### 舞蹈同步系统

```javascript
// 三人共享音乐节拍计时器
// beat_timer 由全局音乐系统驱动

// Sweet 的舞蹈
if (beat_timer % beat_interval == 0) {
    dance_frame += 1;
    // 身体随节拍上下弹跳
    y = base_y + sin(dance_frame * pi) * bounce_height;
}
```

### Sweet 动画

```javascript
// 待机：siner / 4（中等速度）
siner += 1;
draw_sprite_ext(spr_sweet_idle, siner / 4, x, y, 2, 2, 0, image_blend, 1);

// 唱歌时切换嘴型动画
if (singing == 1)
    draw_sprite_ext(spr_sweet_dance, siner / 3, x, y, 2, 2, 0, image_blend, 1);
```

### K.K. 动画

```javascript
// 打碟动画：快速交替帧
if (scratching == 1) {
    draw_sprite_ext(spr_kk_scratch, siner / 2, x, y, 2, 2, 0, image_blend, 1);
}
```

### Hat Guy 动画

```javascript
// 打鼓：按节拍切换帧
if (drumming == 1) {
    drum_frame = (beat_timer / beat_interval) % 4;
    draw_sprite_ext(spr_hatguy_drum, drum_frame, x, y, 2, 2, 0, image_blend, 1);
}
```

### 受伤抖动

```javascript
// 三人独立计算受伤抖动
// 攻击其中一人时，其他两人继续演奏
```
