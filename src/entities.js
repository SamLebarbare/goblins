import { QuadTree, Point, Rectangle } from "./quad.js";
import * as PIXI from "pixi.js";

class Goblin extends PIXI.extras.AnimatedSprite {
  static speed() {
    return 2;
  }

  constructor(initialPos, game) {
    super(game.sheet.animations.goblin);
    this.game = game;
    this.type = "goblin";
    this.animationSpeed = 0.167;
    this.interactive = true;
    this.on("pointertap", this.prepareMode.bind(this));
    this.play();
    this.x = initialPos.x;
    this.y = initialPos.y;
    this.onFrameChange = this.move;
    this.falling = false;
    this.direction = 6; //numpad dir
    this.qt = this.game.qt;
    this.qt.insert(this);
    this.mode = 0;
  }

  prepareMode() {
    const action = this.game.selectedAction();
    this.mode = action.mode;
    this.useMode = action.use;
  }

  setModeTimeout() {
    this.useMode();
    switch (this.mode) {
      case 4:
      case 6:
        setTimeout(() => (this.mode = 0), 5000);
        break;
      case 2:
      default:
        setTimeout(() => (this.mode = 0), 2000);
    }
  }

  collide(direction) {
    let entities = [];
    let box = null;
    switch (direction) {
      case 2:
        box = new Rectangle(this.x + 8, this.y, Block.size() - 2, 2);
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
    this.qt.query(box, entities);
    let collide = false;
    if (entities.length > 0) {
      let remove = direction === this.mode;
      if (entities.filter(e => e != this).length > 0) {
        collide = true;
        if (remove) {
          entities[0].remove();
          this.setModeTimeout();
        }
      }
    }
    return collide;
  }

  turn180() {
    if (this.mode === this.direction) {
      return;
    }
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
    this.gfx.beginFill(0x00, 1);
    this.gfx.drawRect(
      0,
      this.app.screen.height / 2,
      this.app.screen.width,
      this.app.screen.height
    );
    this.gfx.endFill();
  }
}

class ActionBar {
  constructor(app, buttons, onButtonClicked) {
    this.gfx = new PIXI.Graphics();
    this.app = app;
    this.buttons = buttons || [];
    this.app.stage.addChild(this.gfx);
    this.onButtonClicked = onButtonClicked;
  }

  onClick(e) {
    const btn = e.currentTarget;
    this.onButtonClicked(btn.info);
  }

  render() {
    const barW = this.app.screen.width / this.buttons.length;
    const x = this.app.screen.width / 2 - barW / 2;
    const y = this.app.screen.height - this.app.screen.height / 8;
    const barH = 50;
    this.gfx.beginFill(0x1c1c1c, 0.2);
    this.gfx.drawRect(x, y, barW, barH);
    this.gfx.endFill();

    let buttonIndex = 0;
    const buttonWidth = barW / this.buttons.length;
    for (let p = x; p < x + barW; p += buttonWidth) {
      const btn = new PIXI.Graphics();
      btn.interactive = true;
      btn.info = this.buttons[buttonIndex];
      btn.lineStyle(2, 0xfeeb77, 0.1);
      btn.beginFill(0x1cfcfc, 0.2);
      btn.drawRect(p, y, barW / this.buttons.length, barH);
      btn.endFill();
      this.app.stage.addChild(btn);
      const txt = new PIXI.Text(`${btn.info.text} ${btn.info.quantity}`, {
        fontSize: 22,
        fontFamily: "Arial",
        fill: "#cc00ff",
        align: "center",
        stroke: "#FFFFFF",
        strokeThickness: 2
      });
      txt.x = p + buttonWidth / 2 - txt.width / 2;
      txt.y = y + barH / 5;
      btn.info.label = txt;
      this.app.stage.addChild(txt);
      btn.on("pointertap", this.onClick.bind(this));
      if (buttonIndex === 0) {
        this.onClick({ currentTarget: btn });
      }
      buttonIndex++;
    }
  }
}

class Block {
  static size() {
    return 10;
  }
  constructor(game, x, y, color, isFalling) {
    this.game = game;
    this.type = "block";
    this.isFalling = isFalling;
    this.color = color || 0x4c2a00;
    this.gfx = new PIXI.Graphics();
    this.msk = new PIXI.Graphics();
    this.game.stage.addChild(this.gfx);
    this.gfx.interactive = true;
    this.x = x;
    this.y = y;
    this.h = Block.size();
    this.w = Block.size();
    //this.gfx.on("pointertap", this.remove.bind(this));
    this.qt = game.qt;
    this.qt.insert(this);
  }

  queryEntities(entities) {
    let box = new Rectangle(this.x, this.y, Block.size(), Block.size());
    this.qt.query(box, entities);
    return entities;
  }

  tryKillGoblins(entities) {
    entities
      .filter(e => {
        return e.type === "goblin";
      })
      .forEach(goblin => {
        console.log("hit");
        this.qt.remove(goblin);
        this.game.stage.removeChild(goblin);
      });
  }

  collide(entities) {
    let collide = false;
    if (entities.length > 0) {
      if (entities.filter(e => e !== this).length > 0) {
        collide = true;
      }
    }
    return collide;
  }

  update() {
    let entities = [];
    this.queryEntities(entities);
    if (!this.collide(entities)) {
      this.y += Block.size();
      this.render();
      this.falling = true;
    } else {
      if (this.falling) {
        this.qt.remove(this);
        this.qt.insert(this);
        this.falling = false;
      }
      this.queryEntities(entities);
      this.tryKillGoblins(entities);
    }
    setTimeout(this.update.bind(this), 250);
  }

  remove() {
    this.qt.remove(this);
    this.game.stage.removeChild(this.gfx);
    this.gfx.mask = this.msk;
    this.render();
  }

  mount() {
    if (this.isFalling === true) {
      this.update();
    }
  }

  render() {
    this.gfx.clear();
    this.gfx.beginFill(this.color, 1);
    this.gfx.drawRect(this.x, this.y, this.h, this.w);
    this.gfx.endFill();
  }
}
module.exports = { ActionBar, Block, Sky, Goblin };
