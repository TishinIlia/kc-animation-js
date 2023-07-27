const randomInteger = (min, max) => {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
};

const BALL_SIZE = 30;

document.body.style = `--ball-size: ${BALL_SIZE}px;`;
class Ball {
  constructor(x0, y0, speed, angle, index) {
    this.x = x0;
    this.y = y0;
    this.speed = speed;
    this.angle = angle;
    this.id = index;
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

  checkCollision (ball) {
    const {ball: otherBall} = ball
    const dx = otherBall.x - this.x;
    const dy = otherBall.y - this.y;
    return [BALL_SIZE ** 2 > dx ** 2 + dy ** 2, BALL_SIZE - Math.sqrt(dx*dx+dy*dy)];
  }

  resolveCollision (ball) {
    const {ball: otherBall} = ball

    this.angle = Math.PI / 2 - this.angle;
    otherBall.angle = Math.PI / 2 - this.angle;
  }

  adjustPositions (ball, depth) {
    const {ball: otherBall} = ball

    let norm = [otherBall.x - this.x, otherBall.y - this.y];
    const mag = Math.sqrt(norm[0]*norm[0] + norm[1]*norm[1]);
    norm = [norm[0]/mag,norm[1]/mag];
    const correction = [depth*norm[0],depth*norm[1]];
    this.x -=  correction[0];
    this.y -=  correction[1];
    otherBall.x +=  correction[0];
    otherBall.y +=  correction[1];
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

        for (let ball2 of this.balls) {
          if (ball.id === ball2.ball.id) {
            continue
          }
          const [isCollision, collisionDepth] = ball.checkCollision(ball2)
          if (isCollision) {
            ball.adjustPositions(ball2, collisionDepth)
            ball.resolveCollision(ball2)
          }
        }
      });
      this.t = timestamp;
    }

    this.draw();
    return requestAnimationFrame(this.tick);
  };

  draw() {
    this.balls.forEach(({ el, ball }) => {
      el.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
    });
  }
}

const field = new Field(document.getElementById("scene"));
for (let i = 0; i < 200; i++) {
  field.addBall(
    new Ball(
      Math.random() * 1000,
      Math.random() * 1000,
      randomInteger(100, 500),
      randomInteger(360, Math.PI * 2 * 100) / 100,
      i
    )
  );
}
// field.addBall(new Ball(100, 100, 100, -45));
requestAnimationFrame(field.tick);
