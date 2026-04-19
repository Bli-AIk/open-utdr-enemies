(function() {
  'use strict';

  const ENGINES = {
    gms:       { name: 'GMS',       type: '2d', yDown: true,  rotCCW: true,  deg: true  },
    clickteam: { name: 'Clickteam', type: '2d', yDown: true,  rotCCW: true,  deg: true  },
    godot2d:   { name: 'Godot 2D',  type: '2d', yDown: true,  rotCCW: false, deg: false },
    canvas2d:  { name: 'Canvas 2D', type: '2d', yDown: true,  rotCCW: false, deg: false },
    love2d:    { name: 'Love2D',    type: '2d', yDown: true,  rotCCW: false, deg: false },
    cocos:     { name: 'Cocos2d-x', type: '2d', yDown: false, rotCCW: true,  deg: true  },
    unity2d:   { name: 'Unity 2D',  type: '2d', yDown: false, rotCCW: true,  deg: true  },
    bevy2d:    { name: 'Bevy 2D',   type: '2d', yDown: false, rotCCW: true,  deg: false },
    unity3d:   { name: 'Unity 3D',  type: '3d', handed: 'L', up: 'Y', fwd: 'Z',  right: 'X' },
    godot3d:   { name: 'Godot 3D',  type: '3d', handed: 'R', up: 'Y', fwd: '-Z', right: 'X' },
    bevy3d:    { name: 'Bevy 3D',   type: '3d', handed: 'R', up: 'Y', fwd: '-Z', right: 'X' },
    unreal3d:  { name: 'Unreal',    type: '3d', handed: 'L', up: 'Z', fwd: 'X',  right: 'Y' },
  };

  // Map heading text (lowercase) → engine key(s)
  // Arrays mean show multiple engines simultaneously
  const HEADING_PATTERNS = [
    ['clickteam fusion', ['clickteam']],
    ['godot 2d', ['godot2d', 'godot3d']],
    ['web canvas 2d', ['canvas2d']],
    ['canvas 2d', ['canvas2d']],
    ['love2d', ['love2d']],
    ['cocos2d', ['cocos']],
    ['unity 2d', ['unity2d', 'unity3d']],
    ['bevy（2d', ['bevy2d', 'bevy3d']],
    ['bevy (2d', ['bevy2d', 'bevy3d']],
    ['bevy 2d', ['bevy2d', 'bevy3d']],
    ['unity 3d', ['unity3d', 'unity2d']],
    ['godot 3d', ['godot3d', 'godot2d']],
    ['bevy 3d', ['bevy3d', 'bevy2d']],
    ['unreal', ['unreal3d']],
  ];

  const DPR = window.devicePixelRatio || 1;
  const W = 160, H = 170; // logical size per diagram
  const CX = W / 2, CY = 70;
  const AXIS = 40;

  const CLR = {
    same:  '#44FF44',
    diff:  '#CC66FF',
    axis:  '#FFFFFF',
    rot:   '#FFFF44',
    rotD:  '#CC66FF',
    bg:    '#111111',
    dim:   '#666666',
    text:  '#FFFFFF',
    red:   '#FF4444',
    green: '#44FF44',
    blue:  '#4488FF',
    label: '#AAAAAA',
  };

  function createHiDPICanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w * DPR;
    c.height = h * DPR;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(DPR, DPR);
    return { canvas: c, ctx: ctx };
  }

  function drawArrow(ctx, x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len, uy = dy / len;
    var px = -uy, py = ux;
    var sz = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * sz + px * sz * 0.4, y1 - uy * sz + py * sz * 0.4);
    ctx.lineTo(x1 - ux * sz - px * sz * 0.4, y1 - uy * sz - py * sz * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  function drawRotArc(ctx, cx, cy, ccw, color) {
    var r = 16;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    var start, end, acw;
    if (ccw) {
      start = 0.15 * Math.PI;
      end = -0.85 * Math.PI;
      acw = true;
    } else {
      start = -0.15 * Math.PI;
      end = 0.85 * Math.PI;
      acw = false;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end, acw);
    ctx.stroke();

    var ae = end;
    var ax = cx + r * Math.cos(ae);
    var ay = cy + r * Math.sin(ae);
    var td = ccw ? -1 : 1;
    var tdx = -Math.sin(ae) * td;
    var tdy = Math.cos(ae) * td;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - tdx * 5 + tdy * 3, ay - tdy * 5 - tdx * 3);
    ctx.lineTo(ax - tdx * 5 - tdy * 3, ay - tdy * 5 + tdx * 3);
    ctx.closePath();
    ctx.fill();
  }

  function draw2D(ctx, eng, isRef) {
    var gms = ENGINES.gms;
    var yMatch = eng.yDown === gms.yDown;
    var rotMatch = eng.rotCCW === gms.rotCCW;
    var degMatch = eng.deg === gms.deg;

    // Background
    ctx.fillStyle = CLR.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // Title
    ctx.fillStyle = isRef ? CLR.green : CLR.text;
    ctx.font = 'bold 13px "UT-HUD", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(eng.name, CX, 18);
    if (isRef) {
      ctx.fillStyle = CLR.dim;
      ctx.font = '10px monospace';
      ctx.fillText('(基准)', CX, 30);
    }

    // Origin dot
    ctx.fillStyle = CLR.text;
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fill();

    // X axis — always right
    drawArrow(ctx, CX - AXIS, CY, CX + AXIS, CY, CLR.red);
    ctx.fillStyle = CLR.red;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('X+', CX + AXIS + 4, CY + 4);

    // Y axis
    var yColor = yMatch ? CLR.green : CLR.diff;
    var yEnd = eng.yDown ? CY + AXIS : CY - AXIS;
    drawArrow(ctx, CX, CY - AXIS, CX, CY + AXIS, '#555555');
    drawArrow(ctx, CX, CY, CX, yEnd, yColor);
    ctx.fillStyle = yColor;
    ctx.textAlign = 'center';
    if (eng.yDown) {
      ctx.fillText('Y+', CX + 18, CY + AXIS + 2);
    } else {
      ctx.fillText('Y+', CX + 18, CY - AXIS + 2);
    }

    // Rotation arc
    var rotClr = rotMatch ? CLR.rot : CLR.rotD;
    drawRotArc(ctx, CX, CY, eng.rotCCW, rotClr);

    // Info labels
    var ly = H - 42;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    // Rotation direction
    ctx.fillStyle = rotMatch ? CLR.same : CLR.diff;
    var rotStr = eng.rotCCW ? '↺ CCW +' : '↻ CW +';
    ctx.fillText(rotStr, CX, ly);

    // Angle unit
    ctx.fillStyle = degMatch ? CLR.same : CLR.diff;
    var degStr = eng.deg ? '角度: 度 (°)' : '角度: 弧度';
    ctx.fillText(degStr, CX, ly + 16);

    // Y direction
    ctx.fillStyle = yMatch ? CLR.same : CLR.diff;
    var yStr = eng.yDown ? 'Y轴: ↓ 正' : 'Y轴: ↑ 正';
    ctx.fillText(yStr, CX, ly + 32);
  }

  function draw3D(ctx, eng, isRef) {
    ctx.fillStyle = CLR.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // Title
    ctx.fillStyle = isRef ? CLR.green : CLR.text;
    ctx.font = 'bold 13px "UT-HUD", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(eng.name, CX, 18);

    // 3D isometric projection
    var ox = CX, oy = 75;
    var len = 35;

    // Screen-space directions for roles (up/right/forward)
    var screenDir = {
      up:    { dx:  0,    dy: -1    },
      right: { dx:  0.87, dy:  0.35 },
      fwd:   { dx: -0.87, dy:  0.35 },
    };

    // Color based on axis letter
    function axisColor(a) {
      var letter = a.replace('-', '');
      if (letter === 'X') return CLR.red;
      if (letter === 'Y') return CLR.green;
      return CLR.blue;
    }

    // Draw up axis
    var ud = screenDir.up;
    var uc = axisColor(eng.up);
    drawArrow(ctx, ox, oy, ox + ud.dx * len, oy + ud.dy * len, uc);
    ctx.fillStyle = uc;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(eng.up + '+', ox + ud.dx * (len + 12), oy + ud.dy * (len + 12));

    // Draw right axis
    var rd = screenDir.right;
    var rc = axisColor(eng.right);
    drawArrow(ctx, ox, oy, ox + rd.dx * len, oy + rd.dy * len, rc);
    ctx.fillStyle = rc;
    ctx.fillText(eng.right + '+', ox + rd.dx * (len + 12), oy + rd.dy * (len + 12));

    // Draw forward axis
    var fwd = eng.fwd;
    var isNeg = fwd.startsWith('-');
    var fd = screenDir.fwd;
    // Negative forward means the axis actually goes outward; flip arrow direction
    if (isNeg) { fd = { dx: -fd.dx, dy: -fd.dy }; }
    var fc = axisColor(fwd);
    drawArrow(ctx, ox, oy, ox + fd.dx * len, oy + fd.dy * len, fc);
    ctx.fillStyle = fc;
    var fwdLabel = fwd.replace('-', '') + '+';
    ctx.fillText(fwdLabel, ox + fd.dx * (len + 12), oy + fd.dy * (len + 12));
    if (isNeg) {
      ctx.fillStyle = CLR.dim;
      ctx.font = '8px monospace';
      ctx.fillText('(朝屏幕外)', ox + fd.dx * (len + 12), oy + fd.dy * (len + 12) + 10);
    }

    // Origin
    ctx.fillStyle = CLR.text;
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Info
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var ly = H - 28;
    ctx.fillStyle = CLR.label;
    ctx.fillText(eng.handed === 'L' ? '左手系' : '右手系', CX, ly);
    ctx.fillText('Up:' + eng.up + ' Fwd:' + eng.fwd, CX, ly + 14);
  }

  function drawEngine(ctx, key, isRef) {
    var eng = ENGINES[key];
    if (!eng) return;
    if (eng.type === '2d') {
      draw2D(ctx, eng, isRef);
    } else {
      draw3D(ctx, eng, isRef);
    }
  }

  // --- Init ---
  function init() {
    var container = document.getElementById('coord-preview');
    if (!container) return;

    // Create UI
    container.innerHTML = '';
    var title = document.createElement('div');
    title.style.cssText = 'color:#44FF44; font-family:"UT-HUD",monospace; font-size:12px; text-align:center; margin-bottom:8px;';
    title.textContent = '◆ 坐标系对照';
    container.appendChild(title);

    var col = document.createElement('div');
    col.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:6px;';
    container.appendChild(col);

    var diffBox = document.createElement('div');
    diffBox.style.cssText = 'color:#AAAAAA; font-family:monospace; font-size:11px; text-align:center; margin-top:6px; line-height:1.6;';
    container.appendChild(diffBox);

    // Draw initial state — just GMS
    var ref = createHiDPICanvas(W, H);
    col.appendChild(ref.canvas);
    drawEngine(ref.ctx, 'gms', true);
    diffBox.textContent = '滚动文章查看对比';

    var currentKeys = null; // array of engine keys currently shown
    var canvases = [ref]; // track all canvases in col

    function updateEngines(keys) {
      // keys is an array of engine key strings
      var keysStr = keys.join(',');
      var curStr = currentKeys ? currentKeys.join(',') : '';
      if (keysStr === curStr) return;
      currentKeys = keys;

      // Clear all canvases
      while (col.firstChild) col.removeChild(col.firstChild);
      canvases = [];

      // Always draw GMS reference first
      var gmsCanvas = createHiDPICanvas(W, H);
      col.appendChild(gmsCanvas.canvas);
      drawEngine(gmsCanvas.ctx, 'gms', true);
      canvases.push(gmsCanvas);

      if (keys.length === 0 || (keys.length === 1 && keys[0] === 'gms')) {
        diffBox.innerHTML = '滚动文章查看对比';
        return;
      }

      // Draw each engine
      var allDiffs = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var eng = ENGINES[key];
        if (!eng) continue;

        var c = createHiDPICanvas(W, H);
        col.appendChild(c.canvas);
        drawEngine(c.ctx, key, false);
        canvases.push(c);

        // Build diff info
        var gms = ENGINES.gms;
        if (eng.type === '2d') {
          var diffs = [];
          if (eng.yDown !== gms.yDown) diffs.push('<span style="color:' + CLR.diff + '">● Y轴不同</span>');
          else diffs.push('<span style="color:' + CLR.same + '">● Y轴相同</span>');
          if (eng.rotCCW !== gms.rotCCW) diffs.push('<span style="color:' + CLR.diff + '">● 旋转不同</span>');
          else diffs.push('<span style="color:' + CLR.same + '">● 旋转相同</span>');
          if (eng.deg !== gms.deg) diffs.push('<span style="color:' + CLR.diff + '">● 单位不同</span>');
          else diffs.push('<span style="color:' + CLR.same + '">● 单位相同</span>');
          if (keys.length > 1) {
            allDiffs.push('<b style="color:' + CLR.text + '">' + eng.name + '</b>: ' + diffs.join(' '));
          } else {
            allDiffs.push(diffs.join('<br>'));
          }
        } else {
          var info = (eng.handed === 'L' ? '左手系' : '右手系');
          if (keys.length > 1) {
            allDiffs.push('<b style="color:' + CLR.text + '">' + eng.name + '</b>: <span style="color:' + CLR.label + '">' + info + '</span>');
          } else {
            allDiffs.push('<span style="color:' + CLR.label + '">3D ' + info + '</span>');
          }
        }
      }
      diffBox.innerHTML = allDiffs.join('<br>');
    }

    // IntersectionObserver for heading tracking
    var headings = document.querySelectorAll('article h3, article h4');
    var headingEngineMap = [];

    headings.forEach(function(h) {
      var text = h.textContent.toLowerCase().trim();
      for (var i = 0; i < HEADING_PATTERNS.length; i++) {
        if (text.indexOf(HEADING_PATTERNS[i][0]) !== -1) {
          headingEngineMap.push({ el: h, keys: HEADING_PATTERNS[i][1] });
          break;
        }
      }
    });

    if (headingEngineMap.length > 0 && 'IntersectionObserver' in window) {
      var visibleSet = new Set();
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var item = headingEngineMap.find(function(m) { return m.el === entry.target; });
          if (!item) return;
          if (entry.isIntersecting) {
            visibleSet.add(item);
          } else {
            visibleSet.delete(item);
          }
        });

        // Pick the topmost visible heading
        if (visibleSet.size > 0) {
          var topItem = null;
          var topY = Infinity;
          visibleSet.forEach(function(item) {
            var rect = item.el.getBoundingClientRect();
            if (rect.top < topY) {
              topY = rect.top;
              topItem = item;
            }
          });
          if (topItem) updateEngines(topItem.keys);
        }
      }, { rootMargin: '-10% 0px -60% 0px' });

      headingEngineMap.forEach(function(item) {
        observer.observe(item.el);
      });

      // Also track scroll to detect when user scrolls past a heading
      window.addEventListener('scroll', function() {
        if (visibleSet.size > 0) return;
        var best = null;
        for (var i = headingEngineMap.length - 1; i >= 0; i--) {
          var rect = headingEngineMap[i].el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.4) {
            best = headingEngineMap[i];
            break;
          }
        }
        if (best) {
          updateEngines(best.keys);
        } else {
          updateEngines(['gms']);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
