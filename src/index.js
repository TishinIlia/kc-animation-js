const randomInteger = (min, max) => {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
};

const BALL_SIZE = 30;

document.body.style = `--ball-size: ${BALL_SIZE}px;`;

class Ball {
  constructor(x0, y0, speed, angle) {
    this.x = x0;
    this.y = y0;
    this.speed = speed;
    this.angle = angle;
  }

  move(t, restrictions) {
    this.x += this.speed * Math.cos(this.angle) * t;
    if (this.x >= restrictions[2]) {
      this.x -= this.x - restrictions[2];
      this.angle = Math.PI - this.angle;
    }
    if (this.x <= restrictions[0]) {
      this.x += -this.x + restrictions[0];
      this.angle = Math.PI - this.angle;
    }
    this.y += this.speed * Math.sin(this.angle) * t;
    if (this.y >= restrictions[3]) {
      this.y -= this.y - restrictions[3];
      this.angle = -this.angle;
    }
    if (this.y <= restrictions[1]) {
      this.y += -this.y + restrictions[0];
      this.angle = -this.angle;
    }
  }
}

class Field {
  constructor(node) {
    this._node = node;
    this.width = node.offsetWidth;
    this.height = node.offsetHeight;
    this.balls = [];
    this.t = null;
  }

  addBall(ball) {
    const el = document.createElement("div");
    el.classList.add("ball");
    this._node.append(el);

    this.balls.push({
      el,
      ball
    });
  }

  tick = (timestamp) => {
    if (this.t === null) {
      this.t = timestamp;
    } else {
      this.balls.forEach(({ ball }) => {
        ball.move((timestamp - this.t) / 1000, [0, 0, this.width, this.height]);
      });
      this.t = timestamp;
    }

    this.draw();
    return requestAnimationFrame(this.tick);
  };

  draw() {
    this.balls.forEach(({ el, ball }) => {
      el.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
      // el.style.left = `${ball.x}px`;
      // el.style.top = `${ball.y}px`;
    });
  }
}

const field = new Field(document.getElementById("scene"));
for (let i = 0; i < 200; i++) {
  field.addBall(
    new Ball(
      Math.random() > 0.5 ? 0 : field.width,
      Math.random() > 0.5 ? 0 : field.height,
      randomInteger(0, 500),
      randomInteger(0, Math.PI * 2 * 100) / 100
    )
  );
}
// field.addBall(new Ball(100, 100, 100, -45));
requestAnimationFrame(field.tick);
