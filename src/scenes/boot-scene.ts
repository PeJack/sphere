
import { AnimationHelper } from "../helpers/animation-helper";
import { CST } from "../CST";

export class BootScene extends Phaser.Scene {
  private animationHelperInstance: AnimationHelper;
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "BootScene"
    });
  }

  preload(): void {
    // Установить бэкграунд и и создать loadingBar.
    this.cameras.main.setBackgroundColor(0x000000);
    this.createLoadingbar();

    // pass value to change the loading bar fill
    this.load.on(
      "progress",
      function(value) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xfff6d3, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    // delete bar graphics, when loading complete
    this.load.on(
      "complete",
      function() {

        this.progressBar.destroy();
        this.loadingBar.destroy();
      },
      this
    );

    this.loadImages();
    this.loadAudio();
  }

  update(): void {
    this.scene.start("MenuScene");
  }

  private createLoadingbar(): void {
    this.loadingBar = this.add.graphics();
    // this.loadingBar.fillStyle(0x5dae47, 1);
    this.loadingBar.fillStyle(0x5dae47, 1);
    this.loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }

  private loadImages(): void {
    this.load.setPath("./assets/image");

    for (let prop in CST.IMAGE) {
        console.log(CST.IMAGE[prop])
        //@ts-ignore
        this.load.image(CST.IMAGE[prop], CST.IMAGE[prop]);
    }
  }
  
  private loadAudio(): void {
    this.load.setPath("./assets/audio");

    for (let prop in CST.AUDIO) {
        //@ts-ignore
        this.load.audio(CST.AUDIO[prop], CST.AUDIO[prop]);
    }
  }
}