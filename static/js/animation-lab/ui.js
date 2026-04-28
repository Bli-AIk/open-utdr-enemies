/**
 * UTRP animation lab UI.
 */

class UTRPLabUI {
  constructor(container, engine, data, options = {}) {
    this.container = container;
    this.engine = engine;
    this.data = data;
    this.options = options;
    this.mini = !!options.mini;
    this.frameDisplay = null;
    this.timer = null;
  }

  mount() {
    this.container.innerHTML = '';
    this.container.classList.add('utrp-lab');
    if (this.mini) this.container.classList.add('utrp-lab--mini');

    this.container.appendChild(this.buildHeader());
    this.container.appendChild(this.buildCanvasWrap());
    this.container.appendChild(this.buildControls());

    if (!this.mini) {
      const codePanel = document.createElement('div');
      codePanel.className = 'utrp-lab__code';
      this.container.appendChild(codePanel);
      new UTRPCodegenPanel(codePanel, this.data).mount();
    }

    this.timer = window.setInterval(() => {
      if (this.frameDisplay) this.frameDisplay.textContent = `F: ${this.engine.frame}`;
    }, 100);
  }

  destroy() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  buildHeader() {
    const header = document.createElement('div');
    header.className = 'utrp-lab__header';

    const title = document.createElement('span');
    title.className = 'utrp-lab__title';
    title.textContent = `* ${(this.data.name || 'Animation').toUpperCase()}`;
    header.appendChild(title);

    if (this.mini && this.options.labUrl) {
      const link = document.createElement('a');
      link.href = this.options.labUrl;
      link.className = 'utrp-lab__open';
      link.textContent = '打开实验室 ->';
      header.appendChild(link);
    }

    return header;
  }

  buildCanvasWrap() {
    const wrap = document.createElement('div');
    wrap.className = 'utrp-lab__canvas-wrap';
    wrap.appendChild(this.engine.canvas);
    return wrap;
  }

  buildControls() {
    const controls = document.createElement('div');
    controls.className = 'utrp-lab__controls';

    const play = document.createElement('button');
    play.type = 'button';
    play.textContent = 'Pause';
    play.addEventListener('click', () => {
      this.engine.playing = !this.engine.playing;
      play.textContent = this.engine.playing ? 'Pause' : 'Play';
    });
    controls.appendChild(play);

    if (!this.mini) {
      const step = document.createElement('button');
      step.type = 'button';
      step.textContent = 'Step';
      step.addEventListener('click', () => {
        this.engine.playing = false;
        play.textContent = 'Play';
        this.engine.stepForward();
      });
      controls.appendChild(step);

      const reset = document.createElement('button');
      reset.type = 'button';
      reset.textContent = 'Reset';
      reset.addEventListener('click', () => {
        this.engine.reset();
      });
      controls.appendChild(reset);
    }

    const speedWrap = document.createElement('span');
    speedWrap.className = 'utrp-lab__speed';
    for (const speed of [0.5, 1, 2]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${speed}x`;
      button.classList.toggle('active', speed === 1);
      button.addEventListener('click', () => {
        this.engine.speed = speed;
        speedWrap.querySelectorAll('button').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
      });
      speedWrap.appendChild(button);
    }
    controls.appendChild(speedWrap);

    this.frameDisplay = document.createElement('span');
    this.frameDisplay.className = 'utrp-lab__frame';
    this.frameDisplay.textContent = 'F: 0';
    controls.appendChild(this.frameDisplay);

    return controls;
  }
}

function showAnimationLabError(container, message) {
  container.innerHTML = '';
  const error = document.createElement('div');
  error.className = 'utrp-lab__error';
  error.textContent = `Animation load failed: ${message}`;
  container.appendChild(error);
}

async function initAnimationLab(container, dataUrl, options = {}) {
  const initId = (container.__utrpLabInitId || 0) + 1;
  container.__utrpLabInitId = initId;
  let engine = null;
  let ui = null;

  const isCurrent = () => container.__utrpLabInitId === initId;
  const destroyInstance = instance => {
    if (!instance) return;
    instance.engine.stop();
    instance.ui.destroy();
  };
  const destroyPartial = () => {
    if (engine) engine.stop();
    if (ui) ui.destroy();
  };

  try {
    if (container.__utrpLabInstance) {
      destroyInstance(container.__utrpLabInstance);
      container.__utrpLabInstance = null;
    }

    if (!dataUrl) throw new Error('No UTRP data source configured.');

    const response = await fetch(dataUrl);
    if (!isCurrent()) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!isCurrent()) return null;
    if (!data || data.format !== 'utrp') {
      throw new Error('Expected format "utrp".');
    }

    const canvasInfo = data.canvas || {};
    const canvas = document.createElement('canvas');
    canvas.width = Number(canvasInfo.width) || 220;
    canvas.height = Number(canvasInfo.height) || 280;

    const displayScale = Number(canvasInfo.scale) || 1;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.style.imageRendering = 'pixelated';

    if (options.mini) {
      const maxWidth = 180;
      const ratio = Math.min(maxWidth / canvas.width, 1);
      canvas.style.width = `${Math.round(canvas.width * ratio)}px`;
      canvas.style.height = `${Math.round(canvas.height * ratio)}px`;
    } else if (displayScale !== 1) {
      canvas.dataset.displayScale = String(displayScale);
    }

    engine = new UTRPEngine(canvas, data, options);
    await engine.loadAssets();
    if (!isCurrent()) {
      destroyPartial();
      return null;
    }

    ui = new UTRPLabUI(container, engine, data, options);
    ui.mount();
    engine.render();
    engine.start();

    container.__utrpLabInstance = { engine, ui };
    return { engine, ui };
  } catch (err) {
    destroyPartial();
    if (!isCurrent()) return null;
    destroyInstance(container.__utrpLabInstance);
    container.__utrpLabInstance = null;
    showAnimationLabError(container, err.message);
    console.error('Animation Lab init error:', err);
    return null;
  }
}

window.UTRPLabUI = UTRPLabUI;
window.initAnimationLab = initAnimationLab;
