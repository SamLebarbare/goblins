import watt from "gigawatts";
const assets = require("./assets/*.*");
export default watt(function*(next) {
  let sheet = null;
  yield PIXI.loader.add("goblin_text", assets.goblin.png).load(next.args);
  const texture = PIXI.BaseTexture.fromImage(assets.goblin.png);
  sheet = new PIXI.Spritesheet(texture, assets.goblin.json, assets.goblin.png);
  yield sheet.parse(next.args);
  return sheet;
});
