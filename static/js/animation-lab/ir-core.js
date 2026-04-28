/**
 * UTRP Canvas2D runtime.
 */

const UTRPExpression = (() => {
  const TOKEN = {
    NUM: 'num',
    ID: 'id',
    OP: 'op',
    LPAREN: '(',
    RPAREN: ')',
    COMMA: ','
  };

  const FUNCS = {
    sin: Math.sin,
    cos: Math.cos,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    abs: Math.abs,
    sign: Math.sign,
    min: Math.min,
    max: Math.max,
    pow: Math.pow,
    sqrt: Math.sqrt,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max)
  };

  function isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  function isIdStart(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  function isIdPart(ch) {
    return isIdStart(ch) || isDigit(ch);
  }

  function tokenize(src) {
    const tokens = [];
    let i = 0;

    while (i < src.length) {
      const ch = src[i];

      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        i++;
        continue;
      }

      if (ch === '(') {
        tokens.push({ type: TOKEN.LPAREN });
        i++;
        continue;
      }

      if (ch === ')') {
        tokens.push({ type: TOKEN.RPAREN });
        i++;
        continue;
      }

      if (ch === ',') {
        tokens.push({ type: TOKEN.COMMA });
        i++;
        continue;
      }

      if ('+-*/%'.includes(ch)) {
        tokens.push({ type: TOKEN.OP, value: ch });
        i++;
        continue;
      }

      if (isDigit(ch) || ch === '.') {
        const start = i;
        let sawDigit = false;

        while (i < src.length && isDigit(src[i])) {
          sawDigit = true;
          i++;
        }

        if (src[i] === '.') {
          i++;
          while (i < src.length && isDigit(src[i])) {
            sawDigit = true;
            i++;
          }
        }

        if (!sawDigit) {
          throw new Error(`UTRP expression: invalid number at "${src.slice(start)}"`);
        }

        if (src[i] === 'e' || src[i] === 'E') {
          const expStart = i;
          i++;
          if (src[i] === '+' || src[i] === '-') i++;
          let sawExpDigit = false;
          while (i < src.length && isDigit(src[i])) {
            sawExpDigit = true;
            i++;
          }
          if (!sawExpDigit) i = expStart;
        }

        tokens.push({ type: TOKEN.NUM, value: Number(src.slice(start, i)) });
        continue;
      }

      if (isIdStart(ch)) {
        const start = i;
        i++;
        while (i < src.length && isIdPart(src[i])) i++;
        tokens.push({ type: TOKEN.ID, value: src.slice(start, i) });
        continue;
      }

      throw new Error(`UTRP expression: unexpected character "${ch}"`);
    }

    return tokens;
  }

  function compile(expr) {
    if (typeof expr === 'number') return () => expr;
    if (expr == null) return () => 0;

    const src = String(expr).trim();
    if (src === '') return () => 0;

    const direct = Number(src);
    if (!Number.isNaN(direct)) return () => direct;

    const tokens = tokenize(src);
    let pos = 0;

    function peek() {
      return tokens[pos] || null;
    }

    function eat() {
      return tokens[pos++];
    }

    function parseExpression() {
      let left = parseTerm();

      while (peek() && peek().type === TOKEN.OP && (peek().value === '+' || peek().value === '-')) {
        const op = eat().value;
        const right = parseTerm();
        const l = left;
        const r = right;
        left = op === '+'
          ? vars => l(vars) + r(vars)
          : vars => l(vars) - r(vars);
      }

      return left;
    }

    function parseTerm() {
      let left = parseFactor();

      while (peek() && peek().type === TOKEN.OP && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
        const op = eat().value;
        const right = parseFactor();
        const l = left;
        const r = right;

        if (op === '*') left = vars => l(vars) * r(vars);
        else if (op === '/') left = vars => l(vars) / r(vars);
        else left = vars => l(vars) % r(vars);
      }

      return left;
    }

    function parseFactor() {
      if (peek() && peek().type === TOKEN.OP && peek().value === '-') {
        eat();
        const inner = parseFactor();
        return vars => -inner(vars);
      }

      if (peek() && peek().type === TOKEN.OP && peek().value === '+') {
        eat();
        return parseFactor();
      }

      return parseAtom();
    }

    function parseAtom() {
      const token = peek();
      if (!token) throw new Error(`UTRP expression: unexpected end in "${src}"`);

      if (token.type === TOKEN.NUM) {
        eat();
        return () => token.value;
      }

      if (token.type === TOKEN.ID) {
        eat();
        const name = token.value;

        if (peek() && peek().type === TOKEN.LPAREN) {
          eat();
          const args = [];

          if (peek() && peek().type !== TOKEN.RPAREN) {
            args.push(parseExpression());
            while (peek() && peek().type === TOKEN.COMMA) {
              eat();
              args.push(parseExpression());
            }
          }

          if (!peek() || peek().type !== TOKEN.RPAREN) {
            throw new Error(`UTRP expression: missing ")" after ${name}()`);
          }
          eat();

          const fn = FUNCS[name];
          if (!fn) throw new Error(`UTRP expression: unknown function "${name}"`);

          return vars => fn(...args.map(arg => arg(vars)));
        }

        return vars => {
          const value = vars && Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : 0;
          return Number(value) || 0;
        };
      }

      if (token.type === TOKEN.LPAREN) {
        eat();
        const inner = parseExpression();
        if (!peek() || peek().type !== TOKEN.RPAREN) {
          throw new Error(`UTRP expression: missing ")" in "${src}"`);
        }
        eat();
        return inner;
      }

      throw new Error(`UTRP expression: unexpected token in "${src}"`);
    }

    const evaluator = parseExpression();
    if (pos < tokens.length) {
      throw new Error(`UTRP expression: unexpected text after "${src}"`);
    }

    return evaluator;
  }

  function evaluate(expr, vars = {}) {
    return compile(expr)(vars);
  }

  return { compile, eval: evaluate };
})();

class UTRPEngine {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.options = options;
    this.variables = {};
    this.assets = {};
    this.playing = true;
    this.speed = 1;
    this.frame = 0;
    this.fps = data.fps || 30;
    this.frameInterval = 1000 / this.fps;
    this.lastFrameTime = 0;
    this.raf = null;
    this.canvasScale = data.canvas && Number(data.canvas.scale) ? Number(data.canvas.scale) : 1;
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;

    this.compiledUpdates = [];
    this.compiledDraw = [];

    this.initVariables();
    this.compileProgram();
  }

  initVariables() {
    this.variables = {};
    for (const variable of this.data.variables || []) {
      if (!variable || !variable.name) continue;
      this.variables[variable.name] = UTRPExpression.eval(variable.initial || 0, this.variables);
    }
  }

  compileProgram() {
    this.compiledUpdates = (this.data.update || []).map(op => ({
      ...op,
      byExpr: UTRPExpression.compile(op.by == null ? 0 : op.by),
      valueExpr: UTRPExpression.compile(op.value == null ? 0 : op.value)
    }));

    this.compiledDraw = (this.data.draw || [])
      .filter(item => item && item.kind === 'sprite')
      .slice()
      .sort((a, b) => (a.draw_order || 0) - (b.draw_order || 0))
      .map(item => {
        const transform = item.transform || {};
        return {
          item,
          offsetX: UTRPExpression.compile(transform.offset_x == null ? 0 : transform.offset_x),
          offsetY: UTRPExpression.compile(transform.offset_y == null ? 0 : transform.offset_y),
          scaleX: UTRPExpression.compile(transform.scale_x == null ? 1 : transform.scale_x),
          scaleY: UTRPExpression.compile(transform.scale_y == null ? 1 : transform.scale_y),
          rotationDeg: UTRPExpression.compile(transform.rotation_deg == null ? 0 : transform.rotation_deg),
          alpha: UTRPExpression.compile(transform.alpha == null ? 1 : transform.alpha),
          frameIndex: UTRPExpression.compile(transform.frame_index == null ? 0 : transform.frame_index)
        };
      });
  }

  async loadAssets() {
    const entries = [];

    for (const asset of this.data.assets || []) {
      if (!asset || !asset.id) continue;
      const frames = Array.isArray(asset.frames) && asset.frames.length > 0
        ? asset.frames
        : (asset.path ? [asset.path] : []);

      entries.push(Promise.all(frames.map(path => this.loadImage(path))).then(images => {
        this.assets[asset.id] = images;
      }));
    }

    await Promise.all(entries);
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      image.src = path;
    });
  }

  tick() {
    for (const op of this.compiledUpdates) {
      if (op.op === 'increment' && op.variable) {
        const current = this.variables[op.variable] || 0;
        this.variables[op.variable] = current + op.byExpr(this.variables);
      } else if (op.op === 'set' && op.variable) {
        this.variables[op.variable] = op.valueExpr(this.variables);
      }
    }

    this.frame++;
  }

  resolveFrame(assetFrames, frameValue) {
    if (!assetFrames || assetFrames.length === 0) return null;
    const raw = Math.floor(Number(frameValue) || 0);
    const index = ((raw % assetFrames.length) + assetFrames.length) % assetFrames.length;
    return assetFrames[index];
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    for (const entry of this.compiledDraw) {
      const item = entry.item;
      const frames = this.assets[item.sprite];
      const sprite = this.resolveFrame(frames, entry.frameIndex(this.variables));
      if (!sprite) continue;

      const origin = item.origin || {};
      const pivot = item.pivot || { x: sprite.width / 2, y: sprite.height / 2 };
      const offsetX = entry.offsetX(this.variables);
      const offsetY = entry.offsetY(this.variables);
      const scaleX = entry.scaleX(this.variables);
      const scaleY = entry.scaleY(this.variables);
      const rot = entry.rotationDeg(this.variables);
      const alpha = entry.alpha(this.variables);

      ctx.save();
      ctx.globalAlpha = Math.min(Math.max(alpha, 0), 1);
      ctx.translate(
        this.centerX + (Number(origin.x) || 0) + offsetX,
        this.centerY + (Number(origin.y) || 0) + offsetY
      );
      ctx.rotate(-rot * Math.PI / 180);
      ctx.scale(this.canvasScale * scaleX, this.canvasScale * scaleY);
      ctx.drawImage(sprite, -(Number(pivot.x) || 0), -(Number(pivot.y) || 0));
      ctx.restore();
    }
  }

  start() {
    if (this.raf) return;

    const loop = timestamp => {
      this.raf = requestAnimationFrame(loop);

      if (this.playing) {
        const interval = this.frameInterval / this.speed;
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed >= interval) {
          this.lastFrameTime = timestamp - (elapsed % interval);
          this.tick();
        }
      }

      this.render();
    };

    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  reset() {
    this.initVariables();
    this.frame = 0;
    this.lastFrameTime = 0;
    this.render();
  }

  stepForward() {
    this.tick();
    this.render();
  }
}

window.UTRPExpression = UTRPExpression;
window.UTRPEngine = UTRPEngine;
