import watt from "gigawatts";
import spritesheetLoader from "./spritesheetLoader.js";
import { QuadTree, Point, Rectangle } from "./quad.js";
import { Block, Sky, ActionBar, Goblin } from "./entities.js";

class Game extends PIXI.Application {
  constructor() {
    super({ width: 1024, height: 512, antialias: true, autoStart: true });
    document.body.appendChild(this.view);
    this.gameLoaded = false;
    this.groundLevel = this.screen.height / 2;
    this.boundary = new Rectangle(0, 0, this.screen.width, this.screen.height);
    this.qt = new QuadTree(this.boundary, 1, true);
    this.selectedMode = 2;
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
    sky.render();

    for (let x = 0; x <= this.screen.width + Block.size(); x += Block.size()) {
      for (
        let y = this.groundLevel;
        y <= this.screen.height + Block.size();
        y += Block.size()
      ) {
        let block = null;
        let falling = y < this.screen.height - Block.size();
        if (y === this.groundLevel) {
          block = new Block(this, x, y, 0x24921a, falling);
        } else {
          block = new Block(this, x, y, null, falling);
        }
        blocks.push(block);
      }
    }
    blocks.forEach(b => b.render());
    blocks.forEach(b => b.mount());
    const actionBar = new ActionBar(
      this,
      [
        { text: "⇐", mode: 4, quantity: 10 },
        { text: "⇓", mode: 2, quantity: 10 },
        { text: "⇒", mode: 6, quantity: 10 }
      ],
      info => {
        this.selectedAction = () => {
          if (info.quantity > 0) {
            this.selectedMode = info.mode;
            info.quantity -= 1;
            console.log(info.label);

            return {
              mode: info.mode,
              use: () => {
                info.label.text = `${info.text} ${info.quantity}`;
              }
            };
          }
          return 0;
        };
      }
    );
    actionBar.render();
  }

  *spawnGoblins(next) {
    this.start();
    for (let i = 100; i < 110; i++) {
      const pos = { x: i, y: this.groundLevel - 100 };
      const goblin = new Goblin(pos, this);
      this.stage.addChild(goblin);
      yield setTimeout(next.args, 2000);
    }
  }

  *run() {
    yield this.load();
    this.renderStage();
    yield this.spawnGoblins();
    return this;
  }
}

export default Game;
