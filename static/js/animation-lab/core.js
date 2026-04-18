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

    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;

    this._initVariables();
    this._raf = null;
  }

  _initVariables() {
    for (const [name, def] of Object.entries(this.data.variables || {})) {
      this.variables[name] = 0;
    }
  }

  async loadSprites() {
    const promises = [];
    for (const [id, path] of Object.entries(this.data.sprites || {})) {
      promises.push(new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { this.sprites[id] = img; resolve(); };
        img.onerror = () => reject(new Error(`Failed to load sprite: ${path}`));
        img.src = path;
      }));
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
    this.frame++;
  }

  render() {
    const ctx = this.ctx;
    const scale = this.data.scale || 2;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Sort parts by draw order
    const parts = [...this.data.parts].sort((a, b) => (a.drawOrder || 0) - (b.drawOrder || 0));

    for (const part of parts) {
      const sprite = this.sprites[part.sprite];
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
      ctx.translate(this.centerX + ox * scale, this.centerY + oy * scale);
      ctx.rotate(rot * Math.PI / 180);
      ctx.scale(scale * sx, scale * sy);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
  }

  start() {
    const loop = () => {
      if (this.playing) {
        this.tick();
      }
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    loop();
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
