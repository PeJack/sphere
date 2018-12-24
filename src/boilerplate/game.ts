import "phaser";
import { BootScene } from "./scenes/boot-scene";
import { MenuScene } from "../games/space-invaders/scenes/menu-scene";


// main game configuration
const config: GameConfig = {
  title: "Sphere",
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, MenuScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  },
  backgroundColor: "#f5cc69",
  pixelArt: true,

};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new Game(config);
};

