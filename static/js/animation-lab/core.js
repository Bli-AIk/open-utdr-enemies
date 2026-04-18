/**
 * UTAF Animation Engine
 * Core animation loop and rendering for UT Animation Format data.
 * Uses expression-based declarative animation (similar to AE expressions).
 *
 * Copyright notice: All monster sprites are property of Toby Fox / UNDERTALE.
 * Used for non-commercial research and educational purposes only.
 * If you believe this infringes your rights, please contact us for removal.
 */

// ============================================================
// Expression Compiler — parse math expressions into JS functions
// ============================================================
const UTAFExpr = (() => {
  // Tokeniser
  const TOKEN = { NUM: 1, ID: 2, OP: 3, LPAREN: 4, RPAREN: 5, COMMA: 6 };
  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '(') { tokens.push({ t: TOKEN.LPAREN }); i++; continue; }
      if (ch === ')') { tokens.push({ t: TOKEN.RPAREN }); i++; continue; }
      if (ch === ',') { tokens.push({ t: TOKEN.COMMA }); i++; continue; }
      if ('+-*/%'.includes(ch)) { tokens.push({ t: TOKEN.OP, v: ch }); i++; continue; }
      if (ch >= '0' && ch <= '9' || ch === '.') {
        let num = '';
        while (i < src.length && ((src[i] >= '0' && src[i] <= '9') || src[i] === '.')) num += src[i++];
        tokens.push({ t: TOKEN.NUM, v: parseFloat(num) });
        continue;
      }
      if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
        let id = '';
        while (i < src.length && ((src[i] >= 'a' && src[i] <= 'z') || (src[i] >= 'A' && src[i] <= 'Z') || (src[i] >= '0' && src[i] <= '9') || src[i] === '_')) id += src[i++];
        tokens.push({ t: TOKEN.ID, v: id });
        continue;
      }
      throw new Error(`UTAF expr: unexpected character '${ch}' in "${src}"`);
    }
    return tokens;
  }

  // Recursive descent parser → returns an evaluator function (vars) => number
  function parse(src) {
    if (typeof src === 'number') return () => src;
    if (typeof src !== 'string') return () => 0;
    const trimmed = src.trim();
    if (trimmed === '') return () => 0;
    // Fast path: pure number
    const asNum = Number(trimmed);
    if (!isNaN(asNum)) return () => asNum;

    const tokens = tokenize(trimmed);
    let pos = 0;
    const peek = () => tokens[pos] || null;
    const eat = () => tokens[pos++];

    // Built-in functions
    const FUNCS = {
      sin: Math.sin, cos: Math.cos, tan: Math.tan,
      abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round,
      sqrt: Math.sqrt, min: Math.min, max: Math.max, pow: Math.pow,
      sign: Math.sign, clamp: (v, lo, hi) => Math.min(Math.max(v, lo), hi)
    };

    function parseExpr() {
      let left = parseTerm();
      while (peek() && peek().t === TOKEN.OP && (peek().v === '+' || peek().v === '-')) {
        const op = eat().v;
        const right = parseTerm();
        const l = left, r = right;
        left = op === '+' ? (v => l(v) + r(v)) : (v => l(v) - r(v));
      }
      return left;
    }

    function parseTerm() {
      let left = parseFactor();
      while (peek() && peek().t === TOKEN.OP && (peek().v === '*' || peek().v === '/' || peek().v === '%')) {
        const op = eat().v;
        const right = parseFactor();
        const l = left, r = right;
        if (op === '*') left = (v => l(v) * r(v));
        else if (op === '/') left = (v => l(v) / r(v));
        else left = (v => l(v) % r(v));
      }
      return left;
    }

    function parseFactor() {
      // Unary minus
      if (peek() && peek().t === TOKEN.OP && peek().v === '-') {
        eat();
        const inner = parseFactor();
        return (v) => -inner(v);
      }
      // Unary plus
      if (peek() && peek().t === TOKEN.OP && peek().v === '+') {
        eat();
        return parseFactor();
      }
      return parseAtom();
    }

    function parseAtom() {
      const tok = peek();
      if (!tok) throw new Error(`UTAF expr: unexpected end of expression in "${src}"`);

      // Number literal
      if (tok.t === TOKEN.NUM) {
        eat();
        const val = tok.v;
        return () => val;
      }

      // Identifier: variable or function call
      if (tok.t === TOKEN.ID) {
        eat();
        const name = tok.v;
        // Function call?
        if (peek() && peek().t === TOKEN.LPAREN) {
          eat(); // consume '('
          const args = [];
          if (peek() && peek().t !== TOKEN.RPAREN) {
            args.push(parseExpr());
            while (peek() && peek().t === TOKEN.COMMA) {
              eat();
              args.push(parseExpr());
            }
          }
          if (!peek() || peek().t !== TOKEN.RPAREN) throw new Error(`UTAF expr: missing ')' for ${name}()`);
          eat(); // consume ')'
          const fn = FUNCS[name];
          if (!fn) throw new Error(`UTAF expr: unknown function '${name}'`);
          return (v) => fn(...args.map(a => a(v)));
        }
        // Variable
        return (v) => (v[name] !== undefined ? v[name] : 0);
      }

      // Parenthesised expression
      if (tok.t === TOKEN.LPAREN) {
        eat();
        const inner = parseExpr();
        if (!peek() || peek().t !== TOKEN.RPAREN) throw new Error(`UTAF expr: missing ')' in "${src}"`);
        eat();
        return inner;
      }

      throw new Error(`UTAF expr: unexpected token in "${src}"`);
    }

    const result = parseExpr();
    if (pos < tokens.length) throw new Error(`UTAF expr: unexpected tokens after expression in "${src}"`);
    return result;
  }

  return { compile: parse };
})();


// ============================================================
// UTAF Engine
// ============================================================
class UTAFEngine {
  constructor(canvas, utafData, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = utafData;
    this.mini = options.mini || false;

    // Deep clone base data for state switching
    this._baseData = JSON.parse(JSON.stringify(utafData));
    this._currentState = null;

    this.variables = {};
    this.sprites = {};         // All loaded images (keyed by path)
    this._activeSprites = {};  // Current sprite mapping (sprite id -> Image or Image[])
    this.spritesLoaded = false;
    this.playing = true;
    this.speed = 1;
    this.frame = 0;

    this.fps = utafData.fps || 30;
    this.frameInterval = 1000 / this.fps;
    this._lastFrameTime = 0;

    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;

    // Per-part compiled expression cache { "partId.prop": fn }
    this._compiledExprs = {};

    // Path movement state
    this._pathPosition = 0;
    this._pathSegments = null;
    this._pathTotalLength = 0;
    if (utafData.path) this._buildPath(utafData.path);

    this._initVariables();
    this._compileExpressions();
    this._raf = null;
  }

  _initVariables() {
    for (const [name] of Object.entries(this.data.variables || {})) {
      this.variables[name] = 0;
    }
  }

  // Pre-compile all part expressions for performance
  _compileExpressions() {
    this._compiledExprs = {};
    for (const part of this.data.parts) {
      const exprs = part.expressions || {};
      for (const [prop, exprStr] of Object.entries(exprs)) {
        const key = `${part.id}.${prop}`;
        try {
          this._compiledExprs[key] = UTAFExpr.compile(exprStr);
        } catch (e) {
          console.warn(`Expression compile error [${key}]: ${e.message}`);
          this._compiledExprs[key] = () => 0;
        }
      }
    }
  }

  // Evaluate a compiled expression with current variables
  _eval(partId, prop, defaultVal) {
    const fn = this._compiledExprs[`${partId}.${prop}`];
    if (!fn) return defaultVal;
    try {
      return fn(this.variables);
    } catch {
      return defaultVal;
    }
  }

  // Update a part's expression at runtime (for lab editing)
  setExpression(partId, prop, exprStr) {
    // Update the data
    const part = this.data.parts.find(p => p.id === partId);
    if (part) {
      if (!part.expressions) part.expressions = {};
      part.expressions[prop] = exprStr;
    }
    // Recompile
    const key = `${partId}.${prop}`;
    try {
      this._compiledExprs[key] = UTAFExpr.compile(exprStr);
    } catch (e) {
      console.warn(`Expression compile error [${key}]: ${e.message}`);
      this._compiledExprs[key] = () => 0;
    }
  }

  // Build path segments with lengths for interpolation
  _buildPath(pathDef) {
    const pts = pathDef.points;
    if (!pts || pts.length < 2) return;
    const closed = pathDef.closed !== false;
    const smooth = pathDef.smooth || false;

    let interpPts;
    if (smooth && pts.length >= 3) {
      interpPts = this._catmullRomPoints(pts, closed, 16);
    } else {
      interpPts = pts.map(p => ({ x: p[0], y: p[1] }));
      if (closed) interpPts.push({ x: pts[0][0], y: pts[0][1] });
    }

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

  // Collect all unique sprite paths from base data + all states
  _collectAllSpritePaths() {
    const allPaths = new Set();
    const addPaths = (sprites) => {
      for (const pathOrArr of Object.values(sprites || {})) {
        if (Array.isArray(pathOrArr)) pathOrArr.forEach(p => allPaths.add(p));
        else allPaths.add(pathOrArr);
      }
    };
    addPaths(this.data.sprites);
    for (const state of Object.values(this.data.states || {})) {
      addPaths(state.sprites);
    }
    return allPaths;
  }

  // Build _activeSprites from a sprites definition (base or state-merged)
  _buildActiveSprites(spritesDef) {
    this._activeSprites = {};
    for (const [id, pathOrArr] of Object.entries(spritesDef || {})) {
      if (Array.isArray(pathOrArr)) {
        this._activeSprites[id] = pathOrArr.map(p => this.sprites[p]);
      } else {
        this._activeSprites[id] = this.sprites[pathOrArr];
      }
    }
  }

  async loadSprites() {
    const allPaths = this._collectAllSpritePaths();
    const promises = [];
    for (const path of allPaths) {
      promises.push(new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { this.sprites[path] = img; resolve(); };
        img.onerror = () => reject(new Error(`Failed to load sprite: ${path}`));
        img.src = path;
      }));
    }
    await Promise.all(promises);
    this._buildActiveSprites(this.data.sprites);
    this.spritesLoaded = true;
  }

  tick() {
    for (const [name, def] of Object.entries(this.data.variables || {})) {
      if (def.type === 'counter') {
        this.variables[name] = (this.variables[name] || 0) + def.step * this.speed;
      }
    }

    if (this._pathSegments && this.data.path) {
      this._pathPosition += (this.data.path.speed || 1) * this.speed;
      if (this._pathPosition >= this._pathTotalLength) {
        this._pathPosition %= this._pathTotalLength;
      }
    }

    this.frame++;
  }

  render() {
    const ctx = this.ctx;
    const scale = this.data.scale || 2;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    const pathOff = this._getPathOffset();
    const parts = [...this.data.parts].sort((a, b) => (a.drawOrder || 0) - (b.drawOrder || 0));

    for (const part of parts) {
      // Resolve sprite frame
      let sprite;
      const spriteData = this._activeSprites[part.sprite];
      if (Array.isArray(spriteData)) {
        const fi = this._eval(part.id, 'frame_index', 0);
        const frameIdx = Math.floor(fi) % spriteData.length;
        sprite = spriteData[frameIdx < 0 ? frameIdx + spriteData.length : frameIdx];
      } else {
        sprite = spriteData;
      }
      if (!sprite) continue;

      const ox = (part.origin.x || 0) + this._eval(part.id, 'offset_x', 0);
      const oy = (part.origin.y || 0) + this._eval(part.id, 'offset_y', 0);
      const sx = this._eval(part.id, 'scale_x', 1);
      const sy = this._eval(part.id, 'scale_y', 1);
      const rot = this._eval(part.id, 'rotation', 0);
      const alpha = this._eval(part.id, 'alpha', 1);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.centerX + pathOff.x * scale + ox, this.centerY + pathOff.y * scale + oy);
      ctx.rotate(rot * Math.PI / 180);
      ctx.scale(scale * sx, scale * sy);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
  }

  // --- State Management ---

  // Return available states: [{ name, label, isDefault }]
  getStates() {
    const states = this.data.states;
    if (!states) return [];
    return Object.entries(states).map(([name, def]) => ({
      name,
      label: def.label || name,
      isDefault: !!def.default
    }));
  }

  getCurrentState() { return this._currentState; }

  // Switch to a named state — merges state overrides onto base data
  setState(name) {
    const states = this.data.states;
    if (!states || !states[name]) return;
    const stateDef = states[name];
    this._currentState = name;

    // Merge sprites: start from base, overlay state sprites
    const mergedSprites = { ...this._baseData.sprites };
    if (stateDef.sprites) {
      Object.assign(mergedSprites, stateDef.sprites);
    }
    this._buildActiveSprites(mergedSprites);

    // Merge part expressions: start from base, overlay state part overrides
    for (const part of this.data.parts) {
      const basePart = this._baseData.parts.find(p => p.id === part.id);
      part.expressions = { ...(basePart ? basePart.expressions : {}) };
      if (stateDef.parts && stateDef.parts[part.id] && stateDef.parts[part.id].expressions) {
        Object.assign(part.expressions, stateDef.parts[part.id].expressions);
      }
    }

    this._compileExpressions();
    this._initVariables();
    this.frame = 0;
    this._pathPosition = 0;
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
  }

  stepForward() {
    this.tick();
    this.render();
  }

  // Get all expression entries for the param panel
  getExpressions() {
    const result = [];
    for (const part of this.data.parts) {
      const exprs = part.expressions || {};
      for (const [prop, exprStr] of Object.entries(exprs)) {
        result.push({ partId: part.id, prop, expr: exprStr });
      }
    }
    return result;
  }
}
