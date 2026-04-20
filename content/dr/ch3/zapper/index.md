+++
title = "Zapper"
description = "DELTARUNE enemy animation analysis"
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

Zapper 使用 `obj_zapper_enemy` 对象，拥有**红色警报灯**和**音量条**系统：

- **跳跃精灵：** `spr_zapper_jump`（帧率 0.2）
- **受伤精灵：** `spr_zapper_hurt`
- **饶恕精灵：** `spr_zapper_spare`
- **炮管精灵：** `spr_zapper_cannon`（帧率 0.5）

## 公式

### 红色警报灯

```javascript
// 三角波红色覆盖 + 加法混合
sirensiner += 1;

// 三角波公式（非正弦）
siren_alpha = abs(sin(sirensiner / 15)) - lightfade;

// 使用加法混合模式
gpu_set_blendmode(bm_add);
draw_sprite_ext(alarm_sprite, 0, x, y, 2, 2, 0, c_red, siren_alpha);
gpu_set_blendmode(bm_normal);
```

### 音量条（20 段）

```javascript
// 20 段音量指示器
for (var i = 0; i < 20; i++) {
    if (i < volumecount)
        draw_sprite_ext(filled_bar, 0, bar_x, bar_y - i * spacing, ...);
    else
        draw_sprite_ext(empty_bar, 0, bar_x, bar_y - i * spacing, ...);
}

// volumecount 随战斗状态变化
```

### 声音系统

```javascript
// 闭合字幕系统 (closedcaptioncon)
// 音高追踪 (pitch → pitchtarget 渐变)
// 颜色变化系统 (changecolortimer / changecolorcon)
```
