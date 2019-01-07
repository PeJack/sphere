import { CST } from "../../CST"

export class ChooseHeroScene extends Phaser.Scene {
  private chosenHero = "Mage"
  mage: Phaser.GameObjects.Sprite;
  swordman: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: "ChooseHeroScene"
    });
  }


  init(): void {
    this.chooseHero('mage');
  }

  create(): void {
    // Добавить фон.
    // this.cameras.main.setBackgroundColor(0x000000);
    this.add.image(0, 0, CST.IMAGE.TITLE).setOrigin(0).setDepth(0);
    
    // Добавить лого.
    let txt = this.add.text(this.sys.game.renderer.width / 3.2, this.sys.game.renderer.height * 0.20, "[SPHERE]", {font: '84px Courier New', fill: '#ffffff'}).setDepth(1);

    // Создать кнопки.
    let mageButton = this.add.text(100, this.sys.game.renderer.height / 2, "Mage", 
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);
    
    let swordmanButton = this.add.text(100, this.sys.game.renderer.height / 2 + 100, "Swordman",
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);

    let nextButton = this.add.text(this.sys.game.renderer.width / 1.2, this.sys.game.renderer.height / 2 + 250, "Next",
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);

    // Повесить условия на кнопки.
    mageButton.setInteractive();
    mageButton.on("pointerover", () => {})
    mageButton.on("pointerout", () => {})
    mageButton.on("pointerup", () => {
      this.chooseHero('mage');
    })

    swordmanButton.setInteractive();
    swordmanButton.on("pointerover", () => {})
    swordmanButton.on("pointerout", () => {})
    swordmanButton.on("pointerup", () => {
      this.chooseHero('swordman');
    })

    nextButton.setInteractive();
    nextButton.on("pointerover", () => {})
    nextButton.on("pointerout", () => {})
    nextButton.on("pointerup", () => {
        // this.scene.start("");
    })

    this.chooseHero('mage');
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

  private chooseHero(type): void {
    this.chosenHero = type;
    if (type == 'mage') {
      if (this.swordman) {
        this.swordman.destroy();
      }
      this.mage = this.add.sprite(this.sys.game.renderer.width / 1.4, this.sys.game.renderer.height / 2.4, CST.IMAGE.MAGE).setOrigin(0).setDepth(0);
    } else {
      this.mage.destroy();
      this.swordman = this.add.sprite(this.sys.game.renderer.width / 1.4, this.sys.game.renderer.height / 2.4, CST.IMAGE.SWORDMAN).setOrigin(0).setDepth(0).setDisplaySize(200,300);
    }
  }

}
