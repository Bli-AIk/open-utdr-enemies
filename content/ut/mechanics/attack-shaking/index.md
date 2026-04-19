+++
title = "攻击震动 (Attack Shaking)"
description = "UNDERTALE enemy mechanism analysis - Attack Shaking"
date = 2026-04-11T22:29:21+08:00
updated = 2026-04-11T22:29:21+08:00
draft = false
weight = 1
template = "page.html"

[extra]
  author = "毫无技术的鸽子"

  toc = true
  top = false
+++


---

## 说明

敌人的砍击震动也是有公式的。

首先敌人有一个特殊变量 shudder，这个变量就是总共的幅度，会被固定设置为 16（前提是小怪：sans 直接跑、羊妈剧烈震动，完全不符合这个）。

然后每次震颤会固定减小 2，然后左右对换：

```plaintext
x += shudder
if (shudder < 0)
    shudder = (-((shudder + 2)))
else
    shudder = (-shudder)
if (shudder == 0)
{
    global.hurtanim[myself] = 2
    exit
}
alarm = 2
```

### 示例

比如一开始是 16，先往右移 16

随后因为 shudder > 0，取负数 -16

然后由于 shudder < 0，取负数并且减小 2，变成 14

再取负数 -14……

直到 0，动画结束。