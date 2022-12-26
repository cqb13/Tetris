const SHAPES = [
  [1632],
  [8738, 3840, 17476, 240],
  [610, 114, 562, 624],
  [802, 1136, 550, 113],
  [1570, 116, 547, 368],
  [561, 864, 1122, 54],
  [306, 1584, 612, 99]
];

const COLORS = [
  "#111",
  "#00a300",
  "#9f00a7",
  "#603cba",
  "#ffc40d",
  "#ee1111",
  "#99b433",
  "#ff0097"
];

var dw = 360;
var dh = 760;

class Tetris extends Loop {
  constructor() {
    super();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.currentShape = null;
    this.nextShape = null;
    this.time = 0;
    this.keyLeft = new Key(0.15);
    this.keyRight = new Key(0.15);
    this.keyDown = new Key(0.2);
    this.keyUp = new Key();
  }

  create = function (parent) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    parent.appendChild(this.canvas);

    window.addEventListener("keydown", this.inputHandler.bind(this), false);
    window.addEventListener("keyup", this.inputHandler.bind(this), false);

    let self = this;
    let resize = function () {
      self.canvas.width = dw;
      self.canvas.height = dh;
    };
    window.onresize = resize;
    resize();
    this.running = true;

    this.restart();
    this.start(function (dt) {
      self.update(dt);
      self.render(self.canvas.getContext("2d"));
    }, 60);
  };

  inputHandler = function (e) {
    let code = e.keyCode;
    let down = e.type == "keydown";
    let prevent = false;
    switch (code) {
      case 32:
        if (this.gameOver && !down) {
          this.restart();
        }
        prevent = true;
        break;
      case 37:
        if (down && this.keyLeft.isReleased()) {
          this.keyLeft.setState(JUST_PRESSED);
        } else if (!down) {
          this.keyLeft.setState(RELEASED);
        }
        prevent = true;
        break;
      case 39:
        if (down && this.keyRight.isReleased()) {
          this.keyRight.setState(JUST_PRESSED);
        } else if (!down) {
          this.keyRight.setState(RELEASED);
        }
        prevent = true;
        break;
      case 40:
        if (down && this.keyDown.isReleased()) {
          this.keyDown.setState(JUST_PRESSED);
        } else if (!down) {
          this.keyDown.setState(RELEASED);
        }
        prevent = true;
        break;
      case 38:
        if (down && this.keyUp.isReleased()) {
          this.keyUp.setState(JUST_PRESSED);
        } else if (!down) {
          this.keyUp.setState(RELEASED);
        }
        prevent = true;
        break;
    }
    if (prevent) e.preventDefault();
  };

  update = function (deltaTime) {
    if (this.gameOver) {
      return;
    }

    if (this.currentShape == null || this.currentShape.remove) {
      let lines = this.grid.checkLines();
      if (lines > 0) {
        this.score += lines * 10;
        this.linesCleared++;
        if (this.linesCleared > this.level * 10) {
          this.level++;
        }

        this.currentShape = this.nextShape;
        // Generate a new nextShape
        this.generateNextShape();
        console.log(`First: ${this.nextShape}`)
        console.log(`First: ${this.currentShape}`)
      }

      let shapeId = Math.floor(Math.random() * 7);
      this.currentShape = new Shape(SHAPES[shapeId], shapeId + 1, this.grid);
      this.currentShape.x = 3;
      this.time = 0;

      console.log(`Second: ${this.nextShape}`)
      console.log(`Second: ${this.currentShape}`)

      if (
        !this.currentShape.canMove(this.currentShape.x, this.currentShape.y)
      ) {
        // GAME OVER
        this.gameOver = true;
        return;
      }
    }

    if (this.time > 1) {
      this.time = 0;
      this.currentShape.moveDown();
    } else {
      this.time += deltaTime * this.level;
    }

    if (this.keyLeft.isJustPressed() || this.keyLeft.isHoldDown()) {
      this.keyLeft.setState(PRESSED);
      this.currentShape.moveLeft();
    } else if (this.keyLeft.isPressed()) {
      this.keyLeft.addHoldDownTime(deltaTime * this.level);
    }

    if (this.keyRight.isJustPressed() || this.keyRight.isHoldDown()) {
      this.keyRight.setState(PRESSED);
      this.currentShape.moveRight();
    } else if (this.keyRight.isPressed()) {
      this.keyRight.addHoldDownTime(deltaTime * this.level);
    }

    if (this.keyDown.isJustPressed() || this.keyDown.isHoldDown()) {
      this.keyDown.setState(PRESSED);
      this.time = 0;
      this.currentShape.moveDown();
      this.score++;
    } else if (this.keyDown.isPressed()) {
      this.keyDown.addHoldDownTime(deltaTime * 10 * this.level);
    }

    if (this.keyUp.isJustPressed()) {
      this.keyUp.setState(Key.PRESSED);
      this.currentShape.rotateRight();
    }
  };

  generateNextShape = function () {
    let shapeIndex = Math.floor(Math.random() * SHAPES.length);
    let shape = SHAPES[shapeIndex];
    let colorIndex = Math.floor(Math.random() * COLORS.length);
    let color = COLORS[colorIndex];
    this.nextShape = new Shape(shape, color);
  }

  render = function (ctx) {
    ctx.fillStyle = "#040404"; // black
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.grid.render(ctx);
    if (this.currentShape != null) this.currentShape.render(ctx);
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#808080"; // gray
    ctx.fillText("Score: " + this.score, 10, dh - 15);
    ctx.fillText("Cleared: " + this.linesCleared, 140, dh - 15);
    ctx.fillText("Level: " + this.level, dw - 80, dh - 15);

    if (this.gameOver) {
      let text = "Press Space";
      let dimensions = ctx.measureText(text);
      ctx.fillText(text, dw * 0.5 - dimensions.width * 0.5, dh * 0.5 + 30);
      ctx.font = "bold 25px sans-serif";
      text = "GAME OVER";
      dimensions = ctx.measureText(text);
      ctx.fillText(text, dw * 0.5 - dimensions.width * 0.5, dh * 0.5);
    }
  };

  dispose = function () {
    this.stop();
  };

  restart = function () {
    this.grid = new Grid(10, 20);
    this.currentShape = null;
    this.nextShape = null;
    this.level = 1;
    this.score = 0;
    this.linesCleared = 0;
    this.gameOver = false;
  };
}
