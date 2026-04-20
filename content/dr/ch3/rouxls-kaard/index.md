+++
title = "Rouxls Kaard Ch3 (鲁克斯·卡尔德 第三章)"
description = "DELTARUNE enemy animation analysis - Rouxls Kaard (Chapter 3)"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 6
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Rouxls Kaard Ch3 使用 `obj_rouxls_ch3_enemy` 对象，扮演**厨师**角色，可**召唤影人**：

- **厨师精灵：** `spr_rouxls_chef`
- **舞蹈精灵：** `spr_rouxls_chef_dance`
- **卡牌精灵：** `spr_rouxls_chef_card` / `spr_rouxls_chef_card3`
- **鞠躬精灵：** `spr_rouxls_chef_respect`

## 公式

### 舞蹈动画

```javascript
// danceanim 激活时使用舞蹈精灵
if (danceanim == 1) {
    danceindex += rate;  // rate 递增
    draw_sprite_ext(spr_rouxls_chef_dance, danceindex,
        x, y, 2, 2, 0, image_blend, 1);
}
```

### 鞠躬动画

```javascript
// bowanim 激活时播放鞠躬
if (bowanim == 1) {
    danceindex += 1/3;  // 0 → 2 慢速递增
    draw_sprite_ext(spr_rouxls_chef_respect, danceindex,
        x, y, 2, 2, 0, image_blend, 1);
}
```

### 卡牌召唤

```javascript
// cardsummon 激活时播放召唤动画
if (cardsummon == 1) {
    danceindex += 1/3;
    // danceindex == 1 时生成纸屑特效
}
```

### 影人召唤

```javascript
// 可同时召唤最多 4 个 obj_shadowman_enemy
// 阶段推进时增加召唤数量
```
