import "babel-polyfill";
import watt from "gigawatts";
import * as PIXI from "pixi.js";
import "./styles.css";
import Game from "./game.js";

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}
PIXI.utils.sayHello(type);

const game = new Game();
game.run();
