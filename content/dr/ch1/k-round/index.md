+++
title = "K. Round"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 4
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

K.Round 使用 `obj_checkers_enemy` 对象，由**单个精灵**构成：

- **待机精灵：** `spr_checkers_idle`（动画帧）
- **对话时间极短：** `talkmax = 5`

## 公式

### 待机动画

```javascript
// 与 C.Round 相同的快速帧率：siner / 3
siner += 1;
thissprite = spr_checkers_idle;

draw_sprite_ext(thissprite, siner / 3, x, y, 2, 2, 0, image_blend, 1);
```

### 受伤动画

```javascript
// 受伤时重置 siner，只显示第 0 帧
// 并附加标准抖动效果
siner = 0;
draw_sprite_ext(hurtsprite, 0, x + shakex, y, 2, 2, 0, image_blend, 1);

// 击败时向右上方弹飞
if (global.monster[myself] == 0) {
    hspeed = 12;
    turnt -= 8;
    vspeed = -4;
}
```

### 特殊属性

```javascript
// K.Round 拥有多种独特状态变量
checked = 0;     // 是否被检查过
crown = 0;       // 王冠状态
attacktype = 0;  // 攻击类型
thrown = 0;       // 被投掷状态
bowcounter = 0;  // 鞠躬计数器
ralsei_lecture = 0;  // Ralsei 说教计数
milk_counter = 0;    // 牛奶计数器
```
