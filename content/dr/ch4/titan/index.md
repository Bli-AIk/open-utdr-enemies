+++
title = "Titan (泰坦)"
description = "DELTARUNE enemy animation analysis - Titan"
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

Titan 使用 `obj_titan_enemy` 对象，是 Ch4 最终 BOSS。由 **8 层背翅** + **星星核心** + **防御翅膀**组成，拥有极其复杂的多状态绘制系统：

### 背翅（idle/rumble/crack 状态）
- **层 0~3：** `spr_titan_0_backwing` ~ `spr_titan_3_backwing`（后方翅膀）
- **层 4（核心翅膀）：** `spr_titan_4_backwing`（使用 `draw_monster_body_part` 绘制，含闪烁）
- **层 5~7：** `spr_titan_5_backwing` ~ `spr_titan_7_backwing`（前方翅膀）

### 防御翅膀（defense 状态）
- **层 0~3, 5~7：** `spr_cover_wings_defense_layer_0` ~ `spr_cover_wings_defense_layer_7`
- **层 4（防御核心）：** `spr_cover_wings_defense_layer_4`（替代 `spr_titan_4_backwing`）

### 星星特效
- `spr_titan_star_disappear`（消失，帧率 /6）
- `spr_titan_star_dissolve`（溶解，帧率 /3）
- `spr_titan_star_appear`（出现，帧率 /3）
- `spr_titan_star_break`（破碎闪烁）

### 其他
- **受伤精灵：** `spr_titan_hurt`
- **震动精灵：** `spr_titan_rumble`

## 公式

### 位置计算

```javascript
// 位置锁定在摄像机右侧
var _x = 0, _y = 0;
if (i_ex(obj_shake)) _x = obj_shake.shakex;
if (i_ex(obj_shake)) _y = obj_shake.shakey;

x = ((camerastartx + camerawidth()) - 494) + _x;
y = (camerastarty - 88) + _y;
```

Titan 不在固定坐标——始终对齐摄像机右边缘减 494px，跟随全局 shake 偏移。

### 翅膀拍打与减速

```javascript
var _sinerspeed = 0.16666666666666666;  // 标准速度

// 减速系统（90帧渐进）
if (slowdowncon == 1) {
    slowdowntimer++;
    if (slowdowntimer < 90)
        _sinerspeed = lerp(0.16666666666666666, 0.05, slowdowntimer / 90);
    else
        _sinerspeed = 0.05;  // 最终速度 = 标准的 30%
}

// 震动覆盖——rumbler 直接控制速度
if (rumble || pre_rumble)
    _sinerspeed = rumbler / 18;

siner += _sinerspeed;
```

### 蓄力抖动

```javascript
var _chargeshakex = chargeshakex * chargeshakexsign;

// 每帧翻转符号 → 左右交替抖动
if (chargeshakexsign == 1)
    chargeshakexsign = -1;
else
    chargeshakexsign = 1;
```

### drawstate 系统——"idle"/"rumble"/"crack"/"crack2"

```javascript
// 8 层翅膀同帧绘制
// 层 0~3：直接 draw_sprite_ext，无闪烁处理
draw_sprite_ext(spr_titan_0_backwing, siner, x, y, ...);
draw_sprite_ext(spr_titan_1_backwing, siner, x, y, ...);
draw_sprite_ext(spr_titan_2_backwing, siner, x, y, ...);
draw_sprite_ext(spr_titan_3_backwing, siner, x, y, ...);

// 层 4：使用 draw_monster_body_part（含闪烁）
// 根据状态选择精灵：
//   正常 → spr_titan_4_backwing
//   受伤（shakex != 0）→ spr_titan_hurt
//   crack（无抖动）→ spr_cover_wings_defense_layer_4

// 层 5~7：最前方翅膀
draw_sprite_ext(spr_titan_5_backwing, siner, x, y, ...);
draw_sprite_ext(spr_titan_6_backwing, siner, x, y, ...);
draw_sprite_ext(spr_titan_7_backwing, siner, x, y, ...);
```

当 `obj_darkener` 存在时，层 5~7 会**重复绘制一次**——加深前翅不透明度。

### 震动红色覆盖

```javascript
if (rumble) {
    rumbletimer++;

    // 每 2 帧交替偏移
    if ((rumbletimer % 2) == 0)
        x += shakepow;
    else
        x -= shakepow;

    // 红色脉冲覆盖——所有翅膀层
    _rumblealpha = 0.2 + (sin(rumbletimer * 0.2) * 0.2);
    // alpha 在 0.0 ~ 0.4 之间正弦脉动

    d3d_set_fog(true, c_red, 0, 1);
    draw_sprite_ext(spr_titan_X_backwing, siner, x, y, ..., _rumblealpha);
    d3d_set_fog(false, c_black, 0, 0);
}
```

### 星星射击系统（starshootcon）

```javascript
// starshootcon == 0: 正常——绘制 spr_titan_star_disappear（帧率 /6）
draw_monster_body_part(spr_titan_star_disappear, starshoottimer / 6, ...);

// starshootcon == 1: 星星溶解
draw_monster_body_part(spr_titan_star_dissolve, starshoottimer / 3, ...);
// + 加法混合噪声（两层叠加）
gpu_set_blendmode(bm_add);
draw_sprite_ext(spr_titan_star_dissolve, starshoottimer / 3,
    x + (irandom_range(-2, 2) * 2),  // ±4px 随机偏移
    y + (irandom_range(-2, 2) * 2),
    ..., #444444, ...);  // 灰色色调
// 绘制两次叠加 → 加强发光
gpu_set_blendmode(bm_normal);

// starshootcon == 3: 星星重现
draw_monster_body_part(spr_titan_star_appear, starshoottimer / 3, ...);
```

### 星星破碎闪烁（drawstate "crack2"）

```javascript
hurttimer2++;

// 6 帧颜色序列
if (hurttimer2 == 1 || hurttimer2 == 2)
    color = c_red;      // 红色 2 帧
if (hurttimer2 == 3 || hurttimer2 == 4)
    color = c_white;    // 白色 2 帧
if (hurttimer2 == 5 || hurttimer2 == 6)
    color = c_black;    // 黑色 2 帧
if (hurttimer2 > 6)
    color = c_white;    // 之后保持白色

draw_sprite_ext(spr_titan_star_break, 0, ..., color, ...);
```

### 红色持续脉冲（starshootcon > 0 时）

```javascript
redsiner++;

// 始终叠加低强度红色脉冲
d3d_set_fog(true, c_red, 0, 1);
draw_sprite_ext(..., 0.1 + (sin(redsiner * 0.1) * 0.1), ...);
// alpha 在 0.0 ~ 0.2 之间——微弱的红色呼吸
d3d_set_fog(false, c_black, 0, 0);

// redflashtimer > 0 时叠加更强闪烁
var _color = merge_color(c_red, c_white, redflashtimer / 10);
// 随 timer 递减，颜色从红→白过渡
```

### 黑暗覆盖（darktimer）

```javascript
if (darktimer > 0) {
    darktimer++;
    d3d_set_fog(true, c_black, 0, 1);

    // 标准模式（90帧）:
    if (darktimer < 30)
        alpha = lerp(0, 0.8, darktimer / 30);    // 渐入
    if (darktimer >= 30 && darktimer < 60)
        alpha = 0.8;                               // 保持
    if (darktimer >= 60 && darktimer < 90)
        alpha = lerp(0.8, 0, (darktimer - 60) / 30); // 渐出

    if (darktimer >= 90)
        darktimer = 0;  // 重置
}
```

### drawstate "defense"——防御姿态

```javascript
// 8 层防御翅膀替代背翅
draw_sprite_ext(spr_cover_wings_defense_layer_0, defense_timer, x, y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_1, defense_timer, x, y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_2, defense_timer, x, y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_3, defense_timer, x, y, ...);
// 层 4 由 draw_monster_body_part 绘制
draw_sprite_ext(spr_cover_wings_defense_layer_5, defense_timer, x, y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_6, defense_timer, x, y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_7, defense_timer, x, y, ...);
```

### 防御计时器——加速递增

```javascript
// defense_timer 帧率逐阶段加速
if (defense_timer < 1)
    defense_timer += 0.16666666666666666;  // 阶段 1: 标准速度
else if (defense_timer < 2)
    defense_timer += 0.2;                   // 阶段 2: ×1.2
else if (defense_timer < 3)
    defense_timer += 0.25;                  // 阶段 3: ×1.5
else if (defense_timer < 4)
    defense_timer += (1/3);                 // 阶段 4: ×2.0
else if (defense_timer < 5)
    defense_timer += 0.5;                   // 阶段 5: ×3.0
else if (defense_timer < 6)
    defense_timer += (1/3);                 // 阶段 6: ×2.0（减速）
else
    drawstate = "defense end";              // 进入旋转震颤

// 第 1 帧: 翅膀关闭音效
// 第 2 帧: feathercon = 1 → 开始羽毛特效
```

### drawstate "defense end"——旋转震颤

```javascript
// 8 层翅膀各自沿圆形轨道偏移
// 旋转速度逐帧加速
if (spd < maxspd)
    spd += 0.2;

rotation += spd;

// 计算 4 对偏移方向（0°, -0°, 90°, -90°, 180°, -180°, 270°, -270°）
// 使用 dcos/dsin 生成圆形轨道
var _distance = 4;
_x = dcos(rotation) * _distance + dsin(rotation) * _distance;
_y = -dsin(rotation) * _distance + dcos(rotation) * _distance;
// ... 共 8 组偏移

// 每层翅膀使用不同偏移 → 震颤分离效果
draw_sprite_ext(spr_cover_wings_defense_layer_0, 6, x + _x, y + _y, ...);
draw_sprite_ext(spr_cover_wings_defense_layer_1, 6, x + _x2, y + _y2, ...);
// ... 层 2~7 各自偏移
```

### 绿色闪烁

```javascript
if (greenflashtimer > 0) {
    d3d_set_fog(true, c_lime, 0, 1);
    draw_sprite_ext(..., greenflashtimer / 10);
    d3d_set_fog(false, c_black, 0, 0);
}
greenflashtimer--;  // 每帧递减
```

绿色闪烁与红色闪烁独立运作——可同时叠加在翅膀上。

### defense end 阶段的黑暗覆盖（增强版）

```javascript
// phase 8 或 phase 7 turn 3 时：150 帧增强版
if (darktimer > 0 && darktimer < 100)
    alpha = lerp(0, 0.9, darktimer / 100);   // 100 帧渐入
if (darktimer >= 100 && darktimer < 110)
    alpha = 0.9;                               // 10 帧保持
if (darktimer >= 110 && darktimer < 120)
    alpha = lerp(0.9, 0, (darktimer - 110) / 10);  // 10 帧快速渐出

// 其他情况：90 帧标准版
if (darktimer > 0 && darktimer < 70)
    alpha = lerp(0, 0.9, darktimer / 70);
if (darktimer >= 70 && darktimer < 80)
    alpha = 0.9;
if (darktimer >= 80 && darktimer < 90)
    alpha = lerp(0.9, 0, (darktimer - 80) / 10);
```
