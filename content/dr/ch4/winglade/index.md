+++
title = "Winglade (羽翼剑)"
description = "DELTARUNE enemy animation analysis - Winglade"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 5
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Winglade 使用 `obj_halo_enemy` 对象，由 **6+ 层部件**组成，拥有**眼球追踪系统**和**环形文字**：

- **主体精灵：** `spr_halo_bat`
- **剑：** `spr_halo_bat_sword`
- **顶部装饰：** `spr_halo_bat_topBit`
- **黑色底层：** `spr_halo_bat_black`
- **翅膀（左/右）：** `spr_halo_bat_wing_L`、`spr_halo_bat_wing_R`
- **眼白：** `spr_halo_bat_eyeWhite`
- **瞳孔：** `spr_halo_bat_eyePupil`（饶恕后用 `_spare` 版本）
- **光环：** `spr_halo_bat_halo`

## 公式

### 浮动与翅膀

```javascript
floatsiner += 1;

// 身体浮动
y = ystart + (sin(floatsiner / 12) * 4);

// 翅膀持续旋转
wing_frame = siner * 0.25;  // 慢速旋转
```

### 眼球追踪系统

```javascript
// 眼球在两个目标间循环注视
eyetimer += 1;

if (eyetimer < 30) {
    // 30 帧凝视当前方向
} else {
    // 随机选择新方向
    gaze_angle = 160 + irandom(40);  // 160°~200° 范围
    targetEyeX = lengthdir_x(6, gaze_angle);
    targetEyeY = lengthdir_y(6, gaze_angle);
}

// 瞳孔位置平滑跟踪
eyeX = lerp(eyeX, targetEyeX, 0.2);
eyeY = lerp(eyeY, targetEyeY, 0.2);

// 眨眼系统：随机 8 帧眨眼
if (irandom(100) < 3) blink_timer = 8;
```

### 环形文字效果

```javascript
// 对话时在 72 单位半径的圆上绘制旋转文字
for (var i = 0; i < text_length; i++) {
    char_angle = base_angle + (i * angle_step);
    char_x = x + lengthdir_x(72, char_angle);
    char_y = y + lengthdir_y(72, char_angle);

    // 每个字符旋转角度 = angle_diff + 270 + char_angle
    draw_text_transformed(char_x, char_y, char,
        1, 1, angle_diff + 270 + char_angle);
}

// 使用 200x200 surface 缓冲绘制
// 支持日语字体 fnt_ja_kakugo
```
