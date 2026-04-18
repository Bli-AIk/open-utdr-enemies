/**
 * UTAF Animation Lab UI
 * Builds the parameter panel, playback controls, and speed selector.
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

    // Parameter panel (full mode only)
    if (!this.mini) {
      this._buildParamPanel();
    }

    // Update frame counter
    setInterval(() => {
      this.frameDisplay.textContent = `F: ${this.engine.frame}`;
    }, 100);
  }

  _buildParamPanel() {
    const panel = document.createElement('div');
    panel.className = 'utaf-lab__params';

    const title = document.createElement('div');
    title.className = 'utaf-lab__params-title';
    title.textContent = '* 参数调整';
    panel.appendChild(title);

    const params = this.engine.getAnimParams();

    // Group by part
    const groups = {};
    for (const p of params) {
      if (!groups[p.partId]) groups[p.partId] = [];
      groups[p.partId].push(p);
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
        row.className = 'utaf-lab__param-row';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'utaf-lab__param-name';
        nameSpan.textContent = `${item.prop}.${item.param}`;
        row.appendChild(nameSpan);

        const range = this._getRange(item.param, item.value);
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = range.min;
        slider.max = range.max;
        slider.step = range.step;
        slider.value = item.value;
        slider.className = 'utaf-lab__slider';

        const valSpan = document.createElement('span');
        valSpan.className = 'utaf-lab__param-value';
        valSpan.textContent = item.value;

        slider.oninput = () => {
          const v = parseFloat(slider.value);
          valSpan.textContent = v.toFixed(2);
          this.engine.setOverride(item.key, v);
        };

        row.appendChild(slider);
        row.appendChild(valSpan);
        group.appendChild(row);
      }

      panel.appendChild(group);
    }

    this.container.appendChild(panel);
  }

  _getRange(param, value) {
    switch (param) {
      case 'amplitude':
        return { min: -Math.abs(value) * 4, max: Math.abs(value) * 4, step: 0.1 };
      case 'period':
        return { min: 0.5, max: Math.max(value * 4, 20), step: 0.5 };
      case 'base':
        return { min: value - 2, max: value + 2, step: 0.01 };
      default:
        return { min: -100, max: 100, step: 0.1 };
    }
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

    const w = options.mini ? 160 : (data.canvasWidth || 200);
    const h = options.mini ? 160 : (data.canvasHeight || 200);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

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
