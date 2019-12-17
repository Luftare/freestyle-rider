function touchToKey(touch) {
  const topSide = touch.pageY < window.innerHeight / 2;

  if (topSide) {
    return ' ';
  }

  const leftSide = touch.pageX < window.innerWidth / 2;
  return leftSide ? 'ArrowLeft' : 'ArrowRight';
}

module.exports = class GameInput {
  constructor(canvas) {
    this.keysDown = {};
    this.keysDownOnce = {};
    this.relativeClicks = [];
    this.releasedKeys = [];
    this.mousePosition = { x: 0, y: 0 };
    this.mouseDown = false;
    this.touches = [];

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      for (
        let touchIndex = 0;
        touchIndex < e.changedTouches.length;
        touchIndex++
      ) {
        const touch = e.changedTouches[touchIndex];
        this.handleTouchStart(touch);
      }
    });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      for (
        let touchIndex = 0;
        touchIndex < e.changedTouches.length;
        touchIndex++
      ) {
        const touch = e.changedTouches[touchIndex];
        this.handleTouchEnd(touch);
      }
    });

    canvas.addEventListener('touchleave', e => {
      e.preventDefault();
      for (
        let touchIndex = 0;
        touchIndex < e.changedTouches.length;
        touchIndex++
      ) {
        const touch = e.changedTouches[touchIndex];
        this.handleTouchEnd(touch);
      }
    });

    window.addEventListener('keydown', ({ key }) => {
      this.handleKeyDown(key);
    });

    window.addEventListener('keyup', ({ key }) => {
      this.handleKeyUp(key);
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

  handleTouchStart(touch) {
    const key = touchToKey(touch);

    this.handleKeyDown(key);
  }

  handleTouchEnd(touch) {
    const key = touchToKey(touch);

    this.handleKeyUp(key);
  }

  handleKeyDown(key) {
    if (!this.keysDown[key]) {
      this.keysDownOnce[key] = true;
    }

    this.keysDown[key] = true;
  }

  handleKeyUp(key) {
    this.releasedKeys.push(key);
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
