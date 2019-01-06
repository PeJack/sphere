import { CST } from "../CST"

export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private optionCount = 1; // Количество кнопок меню.

  constructor() {
    super({
      key: "MenuScene"
    });
  }


  init(): void {
    this.initRegistry();
  }

  create(): void {
    // Добавить фон.
    this.add.image(0, 0, CST.IMAGE.TITLE).setOrigin(0).setDepth(0);
    
    // Добавить лого.
    let txt = this.add.text(this.sys.game.renderer.width / 3.2, this.sys.game.renderer.height * 0.20, "[SPHERE]", {font: '84px Courier New', fill: '#ffffff'}).setDepth(1);


    // Создать кнопки.
    let playButton    = this.add.image(this.sys.game.renderer.width / 2, this.sys.game.renderer.height / 2, CST.IMAGE.PLAY).setDepth(1);
    let optionsButton = this.add.image(this.sys.game.renderer.width / 2, this.sys.game.renderer.height / 2 + 100, CST.IMAGE.OPTIONS).setDepth(1);


    // Создать аудио.
    this.sound.pauseOnBlur = false; // Делает воспроизвидение непрекращающимся при переходе на другую вкладку.
    this.sound.play(CST.AUDIO.TITLE, {loop: true})

    playButton.setInteractive();
    playButton.on("pointerover", () => {})
    playButton.on("pointerout", () => {})
    playButton.on("pointerup", () => {
        // this.scene.start("");
    })

    optionsButton.setInteractive();
    optionsButton.on("pointerover", () => {})
    optionsButton.on("pointerout", () => {})
    optionsButton.on("pointerup", () => {
        //this.scene.launch();
    })
  }

  update(): void {
  }

  /**
   * Build-in global game data manager to exchange data between scenes.
   * Here we initialize our variables with a key.
   */
  private initRegistry(): void {
    this.registry.set("points", 0);
    this.registry.set("lives", 3);
    this.registry.set("level", 1);
  }

}
