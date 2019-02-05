import { BootScene } from "./scenes/bootScene";
import { GameScene } from "./scenes/gameScene";


const config: GameConfig = {
  title: "Sphere",
  width: 1024,
  height: 768,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  },
  backgroundColor: "#f000000",
  pixelArt: true,

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
