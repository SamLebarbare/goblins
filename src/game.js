import watt from "gigawatts";
import spritesheetLoader from "./spritesheetLoader.js";
import { QuadTree, Point, Rectangle } from "./quad.js";
import { Block, Sky, Goblin } from "./entities.js";

class Game extends PIXI.Application {
  constructor() {
    super({ width: 1024, height: 512, antialias: true, autoStart: true });
    document.body.appendChild(this.view);
    this.gameLoaded = false;
    this.groundLevel = this.screen.height / 2 + Block.size();
    this.boundary = new Rectangle(0, 0, this.screen.width, this.screen.height);
    watt.wrapAll(this);
  }

  *load() {
    if (!this.gameLoaded) {
      this.sheet = yield spritesheetLoader();
      this.gameLoaded = true;
    }
  }

  renderStage() {
    const blocks = [];
    const sky = new Sky(this);
    this.qt = new QuadTree(this.boundary, 1);
    sky.render();

    for (let x = 0; x <= this.screen.width + Block.size(); x += Block.size()) {
      for (
        let y = this.groundLevel;
        y <= this.screen.height + Block.size();
        y += Block.size()
      ) {
        let block = null;
        if (y === this.groundLevel) {
          block = new Block(this, x, y, 0x24921a);
        } else {
          block = new Block(this, x, y);
        }
        blocks.push(block);
      }
    }
    blocks.forEach(b => b.render());
  }

  *addGoblin(next) {
    this.start();
    for (let i = 100; i < 150; i++) {
      const pos = { x: i, y: this.groundLevel - 100 };
      const goblin = new Goblin(pos, this);
      this.stage.addChild(goblin);
      yield setTimeout(next.args, 1000);
    }
  }

  *run() {
    yield this.load();
    this.renderStage();
    yield this.addGoblin();
    return this;
  }
}

export default Game;
