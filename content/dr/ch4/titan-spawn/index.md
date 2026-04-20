+++
title = "泰坦胚胎 (Titan Spawn)"
description = "DELTARUNE enemy animation analysis"
date = 2025-07-27T12:00:00+08:00
updated = 2025-07-27T12:00:00+08:00
draft = false
weight = 13
template = "page.html"

[extra]
  author = "Bli-AIk"

  toc = true
  top = false
+++


---

## 组成拆解

Titan Spawn 使用 `obj_titan_spawn_enemy` 对象，由**单个精灵**构成，是 Titan BOSS 战中的召唤物：

- **待机精灵：** `spr_titan_spawn_idle`
- **受伤精灵：** `spr_titan_spawn_hurt`
- **饶恕精灵：** `spr_titan_spawn_idle`（与待机相同）

注意：第一个出现的 Titan Spawn 被标记为 `battlecontroller = true`，承担战斗控制职责。

## 公式

### 待机动画

```javascript
scr_enemy_drawhurt_generic();
scr_enemy_drawidle_generic(0.16666666666666666);
```

标准通用绘制——无自定义 Draw 逻辑。

### 受伤音效触发

```javascript
if (hurttimer == 29) {
    snd_stop(snd_spawn_weaker);
    snd_play(snd_spawn_weaker);
}
```

受伤动画第 29 帧重新播放削弱音效——先 stop 再 play 防止叠加。

### 闪烁重置

```javascript
if (becomeflash == 0)
    flash = 0;

becomeflash = 0;
```
