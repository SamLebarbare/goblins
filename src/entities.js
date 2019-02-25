import { QuadTree, Point, Rectangle } from "./quad.js";
import * as PIXI from "pixi.js";

class Goblin extends PIXI.extras.AnimatedSprite {
  static speed() {
    return 1;
  }
  constructor(initialPos, game) {
    super(game.sheet.animations.goblin);
    this.type = "goblin";
    this.animationSpeed = 0.167;
    this.play();
    this.x = initialPos.x;
    this.y = initialPos.y;
    this.onFrameChange = this.move;
    this.falling = false;
    this.direction = 6; //numpad dir
    this.qt = game.qt;
    this.qt.insert(this);
  }

  collide(direction) {
    let entities = [];
    let box = null;
    switch (direction) {
      case 2:
        box = new Rectangle(
          this.x + 8,
          this.y - Block.size(),
          Block.size() - 2,
          Block.size()
        );
        break;
      case 4:
        box = new Rectangle(this.x + 2, this.y - 10, 1, 1);
        break;
      case 6:
        box = new Rectangle(this.x + 8, this.y - 10, 1, 1);
        break;
      default:
        box = new Rectangle(this.x, this.y, 16, 16);
    }
    //check falling
    this.qt.query(box, entities);
    let collide = false;
    if (entities.length > 0) {
      if (entities.filter(e => e != this).length > 0) {
        console.log(entities.filter(e => e != this));
        collide = true;
      }
    }
    console.log(collide);
    return collide;
  }

  turn180() {
    if (this.direction == 6) {
      this.direction = 4;
      this.scale.x *= -1;
      this.x -= Goblin.speed() * 2;
    } else if (this.direction == 4) {
      this.direction = 6;
      this.scale.x *= 1;
      this.x += Goblin.speed() * 2;
    }
  }
  move() {
    if (this.falling) {
      this.y += 10;
    }
    switch (this.direction) {
      case 6:
        this.x += Goblin.speed();
        break;
      case 4:
        this.x -= Goblin.speed();
        break;
      case 5:
      default:
    }

    if (this.collide(6)) {
      this.turn180();
    }
    if (this.collide(4)) {
      this.turn180();
    }

    if (this.collide(2)) {
      this.falling = false;
    } else {
      this.falling = true;
    }
  }
}

class Sky {
  constructor(app) {
    this.gfx = new PIXI.Graphics();
    this.app = app;
    app.stage.addChild(this.gfx);
  }

  render() {
    this.gfx.beginFill(0x81bbf0, 1);
    this.gfx.drawRect(0, 0, this.app.screen.width, this.app.screen.height / 2);
    this.gfx.endFill();
  }
}

class Block {
  static size() {
    return 10;
  }
  constructor(game, x, y, color, solidity) {
    this.type = "block";
    this.solidity = solidity || 1;
    this.color = color || 0x4c2a00;
    this.gfx = new PIXI.Graphics();
    this.msk = new PIXI.Graphics();
    game.stage.addChild(this.gfx);
    this.gfx.interactive = true;
    this.x = x;
    this.y = y;
    this.h = Block.size();
    this.w = Block.size();
    this.boundary = new Rectangle(x - this.w, y - this.h, this.h, this.w);
    this.gfx.on("mouseover", this.hit.bind(this));
    this.qt = game.qt;
    this.qt.insert(this);
  }

  hit(e) {
    if (e.data.originalEvent.buttons === 1) {
      this.qt.remove(this);
      this.gfx.mask = this.msk;
      this.render();
    }
  }

  render() {
    this.gfx.beginFill(this.color, 1);
    this.gfx.drawRect(
      this.boundary.x,
      this.boundary.y,
      this.boundary.h,
      this.boundary.w
    );
    this.gfx.endFill();
  }
}
module.exports = { Block, Sky, Goblin };
