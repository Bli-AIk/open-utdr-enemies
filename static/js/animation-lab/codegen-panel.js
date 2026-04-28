/**
 * Generated snippet panel for UTRP programs.
 */

class UTRPCodegenPanel {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.codegen = data.codegen || {};
    this.buttons = new Map();
    this.pre = null;
    this.status = null;
    this.currentTarget = null;
    this.requestId = 0;
  }

  mount() {
    this.container.innerHTML = '';
    this.container.classList.add('utrp-codegen');

    const title = document.createElement('div');
    title.className = 'utrp-codegen__title';
    title.textContent = '* Generated Code';
    this.container.appendChild(title);

    const targets = Object.entries(this.codegen)
      .filter(([, path]) => typeof path === 'string' && path.length > 0);

    if (targets.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'utrp-codegen__empty';
      empty.textContent = 'No generated snippets are available.';
      this.container.appendChild(empty);
      return;
    }

    const controls = document.createElement('div');
    controls.className = 'utrp-codegen__targets';

    for (const [target, path] of targets) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'utrp-codegen__target';
      button.textContent = target;
      button.addEventListener('click', () => this.select(target, path));
      this.buttons.set(target, button);
      controls.appendChild(button);
    }

    this.status = document.createElement('div');
    this.status.className = 'utrp-codegen__status';

    this.pre = document.createElement('pre');
    this.pre.className = 'utrp-codegen__pre';

    this.container.appendChild(controls);
    this.container.appendChild(this.status);
    this.container.appendChild(this.pre);

    const [firstTarget, firstPath] = targets[0];
    this.select(firstTarget, firstPath);
  }

  async select(target, path) {
    this.currentTarget = target;
    const requestId = ++this.requestId;

    for (const [name, button] of this.buttons.entries()) {
      button.classList.toggle('active', name === target);
    }

    this.status.textContent = 'Loading...';
    this.pre.textContent = '';

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (requestId !== this.requestId || target !== this.currentTarget) return;
      this.status.textContent = target;
      this.pre.textContent = text.trim() || '(empty snippet)';
    } catch (err) {
      if (requestId !== this.requestId || target !== this.currentTarget) return;
      this.status.textContent = `Could not load ${target}`;
      this.pre.textContent = err.message;
    }
  }
}

window.UTRPCodegenPanel = UTRPCodegenPanel;
