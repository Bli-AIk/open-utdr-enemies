/**
 * UTAF Animation Engine
 * Core animation loop and rendering for UT Animation Format data.
 *
 * Copyright notice: All monster sprites are property of Toby Fox / UNDERTALE.
 * Used for non-commercial research and educational purposes only.
 * If you believe this infringes your rights, please contact us for removal.
 */

class UTAFEngine {
  constructor(canvas, utafData, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = utafData;
    this.mini = options.mini || false;

    this.variables = {};
    this.sprites = {};
    this.spritesLoaded = false;
    this.playing = true;
    this.speed = 1;
    this.frame = 0;
    this.paramOverrides = {};

    this.fps = utafData.fps || 30;
    this.frameInterval = 1000 / this.fps;
    this._lastFrameTime = 0;

    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;

    // Per-part frame animation state
    this._partFrameIndex = {};

    // Path movement state
    this._pathPosition = 0; // 0..totalLength progress
    this._pathSegments = null;
    this._pathTotalLength = 0;
    if (utafData.path) this._buildPath(utafData.path);

    this._initVariables();
    this._raf = null;
  }

  _initVariables() {
    for (const [name, def] of Object.entries(this.data.variables || {})) {
      this.variables[name] = 0;
    }
  }

  // Build path segments with lengths for interpolation
  _buildPath(pathDef) {
    const pts = pathDef.points;
    if (!pts || pts.length < 2) return;
    const closed = pathDef.closed !== false;
    const smooth = pathDef.smooth || false;

    // Build interpolation points (optionally with Catmull-Rom)
    let interpPts;
    if (smooth && pts.length >= 3) {
      interpPts = this._catmullRomPoints(pts, closed, 16);
    } else {
      interpPts = pts.map(p => ({ x: p[0], y: p[1] }));
      if (closed) interpPts.push({ x: pts[0][0], y: pts[0][1] });
    }

    // Compute segment lengths
    const segs = [];
    let total = 0;
    for (let i = 0; i < interpPts.length - 1; i++) {
      const dx = interpPts[i + 1].x - interpPts[i].x;
      const dy = interpPts[i + 1].y - interpPts[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segs.push({ from: interpPts[i], to: interpPts[i + 1], length: len, cumLen: total });
      total += len;
    }
    this._pathSegments = segs;
    this._pathTotalLength = total;
  }

  // Generate smooth curve via Catmull-Rom spline
  _catmullRomPoints(pts, closed, subdivisions) {
    const result = [];
    const n = pts.length;
    const count = closed ? n : n - 1;
    for (let i = 0; i < count; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      for (let t = 0; t < subdivisions; t++) {
        const f = t / subdivisions;
        const f2 = f * f, f3 = f2 * f;
        result.push({
          x: 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * f + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * f2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * f3),
          y: 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * f + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * f2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * f3)
        });
      }
    }
    if (closed) result.push({ x: pts[0][0], y: pts[0][1] });
    else result.push({ x: pts[n - 1][0], y: pts[n - 1][1] });
    return result;
  }

  // Get (x,y) offset at current path position
  _getPathOffset() {
    if (!this._pathSegments || this._pathTotalLength === 0) return { x: 0, y: 0 };
    const pos = this._pathPosition % this._pathTotalLength;
    for (const seg of this._pathSegments) {
      if (pos <= seg.cumLen + seg.length) {
        const local = (pos - seg.cumLen) / seg.length;
        return {
          x: seg.from.x + (seg.to.x - seg.from.x) * local,
          y: seg.from.y + (seg.to.y - seg.from.y) * local
        };
      }
    }
    const last = this._pathSegments[this._pathSegments.length - 1];
    return { x: last.to.x, y: last.to.y };
  }

  async loadSprites() {
    const promises = [];
    for (const [id, pathOrArr] of Object.entries(this.data.sprites || {})) {
      if (Array.isArray(pathOrArr)) {
        // Multi-frame sprite: load all frames
        const frames = [];
        pathOrArr.forEach((path, idx) => {
          promises.push(new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { frames[idx] = img; resolve(); };
            img.onerror = () => reject(new Error(`Failed to load sprite: ${path}`));
            img.src = path;
          }));
        });
        this.sprites[id] = frames;
      } else {
        // Single-frame sprite
        promises.push(new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => { this.sprites[id] = img; resolve(); };
          img.onerror = () => reject(new Error(`Failed to load sprite: ${pathOrArr}`));
          img.src = pathOrArr;
        }));
      }
    }
    await Promise.all(promises);
    this.spritesLoaded = true;
  }

  evaluate(animNode) {
    if (!animNode) return 0;
    const varName = animNode.variable || 'siner';
    const v = this.variables[varName] || 0;

    // Check for parameter overrides
    const overrideKey = `${animNode._partId}.${animNode._propName}`;
    const ampOverride = this.paramOverrides[`${overrideKey}.amplitude`];
    const periodOverride = this.paramOverrides[`${overrideKey}.period`];
    const amplitude = ampOverride !== undefined ? ampOverride : (animNode.amplitude || 0);
    const period = periodOverride !== undefined ? periodOverride : (animNode.period || 1);
    const base = animNode.base || 0;

    switch (animNode.type) {
      case 'sine':
        return base + amplitude * Math.sin(v / period);
      case 'cosine':
        return base + amplitude * Math.cos(v / period);
      case 'static':
        return animNode.value || 0;
      default:
        return base;
    }
  }

  tick() {
    // Update variables
    for (const [name, def] of Object.entries(this.data.variables || {})) {
      if (def.type === 'counter') {
        this.variables[name] = (this.variables[name] || 0) + def.step * this.speed;
      }
    }

    // Advance path position
    if (this._pathSegments && this.data.path) {
      const pathSpeed = this.data.path.speed || 1;
      this._pathPosition += pathSpeed * this.speed;
      if (this._pathPosition >= this._pathTotalLength) {
        this._pathPosition %= this._pathTotalLength;
      }
    }

    // Advance per-part frame animation
    for (const part of this.data.parts) {
      if (part.image_speed && Array.isArray(this.sprites[part.sprite])) {
        const idx = this._partFrameIndex[part.id] || 0;
        const frameCount = this.sprites[part.sprite].length;
        this._partFrameIndex[part.id] = (idx + part.image_speed * this.speed) % frameCount;
      }
    }

    this.frame++;
  }

  render() {
    const ctx = this.ctx;
    const scale = this.data.scale || 2;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Get path offset (applies to all parts)
    const pathOff = this._getPathOffset();

    // Sort parts by draw order
    const parts = [...this.data.parts].sort((a, b) => (a.drawOrder || 0) - (b.drawOrder || 0));

    for (const part of parts) {
      // Resolve sprite (single image or frame from array)
      let sprite;
      const spriteData = this.sprites[part.sprite];
      if (Array.isArray(spriteData)) {
        const frameIdx = Math.floor(this._partFrameIndex[part.id] || 0);
        sprite = spriteData[frameIdx % spriteData.length];
      } else {
        sprite = spriteData;
      }
      if (!sprite) continue;

      const anim = part.animation || {};

      // Tag animation nodes with part info for override lookup
      for (const [prop, node] of Object.entries(anim)) {
        if (node && typeof node === 'object') {
          node._partId = part.id;
          node._propName = prop;
        }
      }

      const ox = (part.origin.x || 0) + this.evaluate(anim.offset_x);
      const oy = (part.origin.y || 0) + this.evaluate(anim.offset_y);
      const sx = anim.scale_x ? this.evaluate(anim.scale_x) : 1;
      const sy = anim.scale_y ? this.evaluate(anim.scale_y) : 1;
      const rot = this.evaluate(anim.rotation);
      const alpha = anim.alpha ? this.evaluate(anim.alpha) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.centerX + pathOff.x * scale + ox, this.centerY + pathOff.y * scale + oy);
      ctx.rotate(rot * Math.PI / 180);
      ctx.scale(scale * sx, scale * sy);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
  }

  start() {
    const loop = (timestamp) => {
      this._raf = requestAnimationFrame(loop);
      if (this.playing) {
        var elapsed = timestamp - this._lastFrameTime;
        if (elapsed >= this.frameInterval / this.speed) {
          this._lastFrameTime = timestamp - (elapsed % (this.frameInterval / this.speed));
          this.tick();
        }
      }
      this.render();
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  reset() {
    this._initVariables();
    this.frame = 0;
    this._pathPosition = 0;
    this._partFrameIndex = {};
  }

  stepForward() {
    this.tick();
    this.render();
  }

  setOverride(key, value) {
    this.paramOverrides[key] = value;
  }

  getAnimParams() {
    const params = [];
    for (const part of this.data.parts) {
      for (const [prop, node] of Object.entries(part.animation || {})) {
        if (node && typeof node === 'object' && node.type) {
          if (node.amplitude !== undefined) {
            params.push({
              partId: part.id,
              prop: prop,
              param: 'amplitude',
              value: node.amplitude,
              key: `${part.id}.${prop}.amplitude`
            });
          }
          if (node.period !== undefined) {
            params.push({
              partId: part.id,
              prop: prop,
              param: 'period',
              value: node.period,
              key: `${part.id}.${prop}.period`
            });
          }
          if (node.base !== undefined && node.base !== 0) {
            params.push({
              partId: part.id,
              prop: prop,
              param: 'base',
              value: node.base,
              key: `${part.id}.${prop}.base`
            });
          }
        }
      }
    }
    return params;
  }
}
