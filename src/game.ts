import "phaser";

import { BootScene } from "./scenes/bootScene";
import { GameScene } from "./scenes/gameScene";


const config: GameConfig = {
    title: "Sphere",
    width: "100%",
    height: "100%",
    type: Phaser.AUTO,
    parent: "game",
    scene: [BootScene, GameScene],
    backgroundColor: "#f000000",
    fps: {
        target: 30
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        // pixelArt: true,
        // antialias: true,
        // roundPixels: true
    }
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
