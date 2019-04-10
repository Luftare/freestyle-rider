module.exports = class GameInput {
  constructor(canvas) {
    this.keysDown = {};
    this.keysDownOnce = {};
    this.relativeClicks = {};
    this.releasedKeys = [];
    this.mousePosition = { x: 0, y: 0 };
    this.mouseDown = false;

    window.addEventListener('keydown', ({ key }) => {
      if (!this.keysDown[key]) {
        this.keysDownOnce[key] = true;
      }

      this.keysDown[key] = true;
    });

    window.addEventListener('keyup', ({ key }) => {
      this.releasedKeys.push(key);
    });

    canvas.addEventListener('mousedown', ({ x, y }) => {
      this.mouseDown = true;

      const canvasOffset = canvas.getBoundingClientRect();
      const relativeX = x - canvasOffset.left;
      const relativeY = y - canvasOffset.top;
      this.mousePosition = { x: relativeX, y: relativeY };
      this.relativeClicks.push(this.mousePosition);
    });

    canvas.addEventListener('mousemove', ({ x, y }) => {
      const canvasOffset = canvas.getBoundingClientRect();
      const relativeX = x - canvasOffset.left;
      const relativeY = y - canvasOffset.top;
      this.mousePosition = { x: relativeX, y: relativeY };
    });

    canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });
  }

  clearState() {
    this.releasedKeys.forEach(key => {
      this.keysDown[key] = false;
    });

    this.releasedKeys = [];
    this.keysDownOnce = {};
    this.relativeClicks = [];
  }
};
