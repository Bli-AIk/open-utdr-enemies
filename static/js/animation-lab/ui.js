/**
 * UTAF Animation Lab UI
 * Expression-based parameter editor, playback controls, and speed selector.
 */

class UTAFLabUI {
  constructor(container, engine, options = {}) {
    this.container = container;
    this.engine = engine;
    this.mini = options.mini || false;
    this.labUrl = options.labUrl || null;
    this._build();
  }

  _build() {
    this.container.innerHTML = '';
    this.container.classList.add('utaf-lab');
    if (this.mini) this.container.classList.add('utaf-lab--mini');

    // Header
    const header = document.createElement('div');
    header.className = 'utaf-lab__header';
    header.innerHTML = `<span class="utaf-lab__title">* ${this.engine.data.name.toUpperCase()}</span>`;
    if (this.mini && this.labUrl) {
      const link = document.createElement('a');
      link.href = this.labUrl;
      link.className = 'utaf-lab__open';
      link.textContent = '打开实验室 →';
      header.appendChild(link);
    }
    this.container.appendChild(header);

    // State selector (if states defined)
    const states = this.engine.getStates();
    if (states.length > 0) {
      this._buildStateSelector(states);
    }

    // Canvas area
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'utaf-lab__canvas-wrap';
    canvasWrap.appendChild(this.engine.canvas);
    this.container.appendChild(canvasWrap);

    // Playback controls
    const controls = document.createElement('div');
    controls.className = 'utaf-lab__controls';

    const playBtn = document.createElement('button');
    playBtn.textContent = '⏸';
    playBtn.title = '播放/暂停';
    playBtn.onclick = () => {
      this.engine.playing = !this.engine.playing;
      playBtn.textContent = this.engine.playing ? '⏸' : '▶';
    };
    controls.appendChild(playBtn);

    if (!this.mini) {
      const stepBtn = document.createElement('button');
      stepBtn.textContent = '⏭';
      stepBtn.title = '单帧步进';
      stepBtn.onclick = () => {
        this.engine.playing = false;
        playBtn.textContent = '▶';
        this.engine.stepForward();
      };
      controls.appendChild(stepBtn);

      const resetBtn = document.createElement('button');
      resetBtn.textContent = '⟲';
      resetBtn.title = '重置';
      resetBtn.onclick = () => {
        this.engine.reset();
        this.engine.render();
      };
      controls.appendChild(resetBtn);
    }

    // Speed controls
    const speedWrap = document.createElement('span');
    speedWrap.className = 'utaf-lab__speed';
    [0.5, 1, 2].forEach(s => {
      const btn = document.createElement('button');
      btn.textContent = `${s}x`;
      btn.className = s === 1 ? 'active' : '';
      btn.onclick = () => {
        this.engine.speed = s;
        speedWrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      speedWrap.appendChild(btn);
    });
    controls.appendChild(speedWrap);

    // Frame counter
    this.frameDisplay = document.createElement('span');
    this.frameDisplay.className = 'utaf-lab__frame';
    controls.appendChild(this.frameDisplay);

    this.container.appendChild(controls);

    // Expression panel (full mode only)
    if (!this.mini) {
      this._buildExprPanel();
    }

    // Update frame counter
    setInterval(() => {
      this.frameDisplay.textContent = `F: ${this.engine.frame}`;
    }, 100);
  }

  _buildStateSelector(states) {
    const bar = document.createElement('div');
    bar.className = 'utaf-lab__states';

    const label = document.createElement('span');
    label.className = 'utaf-lab__states-label';
    label.textContent = '状态:';
    bar.appendChild(label);

    const btnWrap = document.createElement('div');
    btnWrap.className = 'utaf-lab__states-btns';

    // Find default state
    const defaultState = states.find(s => s.isDefault) || states[0];

    states.forEach(state => {
      const btn = document.createElement('button');
      btn.className = 'utaf-lab__state-btn';
      btn.textContent = state.label;
      if (state.name === defaultState.name) btn.classList.add('active');
      btn.onclick = () => {
        this.engine.setState(state.name);
        btnWrap.querySelectorAll('.utaf-lab__state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Rebuild expression panel if in full mode
        if (!this.mini && this._exprPanel) {
          this._exprPanel.remove();
          this._buildExprPanel();
        }
      };
      btnWrap.appendChild(btn);
    });

    bar.appendChild(btnWrap);
    this.container.appendChild(bar);

    // Apply default state
    this.engine.setState(defaultState.name);
  }

  _buildExprPanel() {
    const panel = document.createElement('div');
    panel.className = 'utaf-lab__params';
    this._exprPanel = panel;

    const title = document.createElement('div');
    title.className = 'utaf-lab__params-title';
    title.textContent = '* 表达式编辑';
    panel.appendChild(title);

    const exprs = this.engine.getExpressions();

    // Group by part
    const groups = {};
    for (const e of exprs) {
      if (!groups[e.partId]) groups[e.partId] = [];
      groups[e.partId].push(e);
    }

    for (const [partId, items] of Object.entries(groups)) {
      const group = document.createElement('div');
      group.className = 'utaf-lab__param-group';

      const label = document.createElement('div');
      label.className = 'utaf-lab__param-label';
      label.textContent = `[ ${partId} ]`;
      group.appendChild(label);

      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'utaf-lab__expr-row';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'utaf-lab__param-name';
        nameSpan.textContent = item.prop;
        row.appendChild(nameSpan);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.expr;
        input.className = 'utaf-lab__expr-input';
        input.spellcheck = false;

        const statusDot = document.createElement('span');
        statusDot.className = 'utaf-lab__expr-status';
        statusDot.textContent = '●';
        statusDot.style.color = '#0f0';

        input.addEventListener('input', () => {
          try {
            UTAFExpr.compile(input.value);
            this.engine.setExpression(item.partId, item.prop, input.value);
            statusDot.style.color = '#0f0';
            statusDot.title = 'OK';
          } catch (e) {
            statusDot.style.color = '#f00';
            statusDot.title = e.message;
          }
        });

        row.appendChild(input);
        row.appendChild(statusDot);
        group.appendChild(row);
      }

      panel.appendChild(group);
    }

    this.container.appendChild(panel);
  }
}

/**
 * Initialize an animation lab instance.
 * @param {HTMLElement} container - The DOM element to build the lab in.
 * @param {string} dataUrl - URL to the UTAF JSON file.
 * @param {object} options - { mini: bool, labUrl: string }
 */
async function initAnimationLab(container, dataUrl, options = {}) {
  try {
    const resp = await fetch(dataUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const w = data.canvasWidth || 220;
    const h = data.canvasHeight || 280;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    if (options.mini) {
      var maxW = 180;
      var ratio = Math.min(maxW / w, 1);
      canvas.style.width = Math.round(w * ratio) + 'px';
      canvas.style.height = Math.round(h * ratio) + 'px';
    }

    const engine = new UTAFEngine(canvas, data, options);
    await engine.loadSprites();

    const ui = new UTAFLabUI(container, engine, options);
    engine.start();

    return { engine, ui };
  } catch (err) {
    container.innerHTML = `<div class="utaf-lab__error">动画加载失败: ${err.message}</div>`;
    console.error('Animation Lab init error:', err);
  }
}
