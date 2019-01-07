import "phaser";
import "../styles/less/styles.less";
// import "../styles/less/styles-fullscreen.less";

import { BootScene } from "./scenes/boot-scene";
import { MenuScene } from "./scenes/menu/menu-scene";
import { ChooseHeroScene } from "./scenes/menu/choose-hero-scene";


// main game configuration
const config: GameConfig = {
  title: "Sphere",
  width: 1024,
  height: 768,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, MenuScene, ChooseHeroScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  },
  // backgroundColor: "#f5cc69",
  backgroundColor: "#f000000",
  pixelArt: true,

};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  const game = new Game(config);
};
