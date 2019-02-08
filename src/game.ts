import "phaser";

import { BootScene } from "./scenes/bootScene";
import { GameScene } from "./scenes/gameScene";


const config: GameConfig = {
  title: "Sphere",
  width: window.innerWidth,
  height: window.innerHeight,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, GameScene],
  backgroundColor: "#f000000"
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }

  preload(): void {
    this.boot;
  }
}

window.addEventListener("load", () => {
  const game = new Game(config);
});
