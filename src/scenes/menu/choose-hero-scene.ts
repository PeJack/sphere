import { CST } from "../../CST"

export class ChooseHeroScene extends Phaser.Scene {
  private sChosenHero     : string;
  private oMage           : Phaser.GameObjects.Sprite;
  private oSwordman       : Phaser.GameObjects.Sprite;
  private oMageButton     : Phaser.GameObjects.Text;
  private oSwordmanButton : Phaser.GameObjects.Text;
  private oNextButton     : Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "ChooseHeroScene"
    });
    this.sChosenHero = "Mage";
  }


  init(): void {
    this.chooseHero('mage');
  }

  create(): void {
    // Добавить фон.
    this.add.image(0, 0, CST.IMAGE.TITLE).setOrigin(0).setDepth(0);
    
    // Добавить лого.
    this.add.text(this.sys.game.renderer.width / 3.2, this.sys.game.renderer.height * 0.20, "[SPHERE]", {font: '84px Courier New', fill: '#ffffff'}).setDepth(1);

    // Создать кнопки.
    this.oMageButton = this.add.text(100, this.sys.game.renderer.height / 2, "Mage", 
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);
    
    this.oSwordmanButton = this.add.text(100, this.sys.game.renderer.height / 2 + 100, "Swordman",
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);

    this.oNextButton = this.add.text(this.sys.game.renderer.width / 1.2, this.sys.game.renderer.height / 2 + 250, "Next",
      {
          font: '54px Courier New', 
          fill: '#ffffff'
      }).setDepth(1);

    // Повесить условия на кнопки.
    this.oMageButton.setInteractive();
    this.oMageButton.on("pointerover", () => {})
    this.oMageButton.on("pointerout", () => {})
    this.oMageButton.on("pointerup", () => {
      this.chooseHero('mage');
    })

    this.oSwordmanButton.setInteractive();
    this.oSwordmanButton.on("pointerover", () => {})
    this.oSwordmanButton.on("pointerout", () => {})
    this.oSwordmanButton.on("pointerup", () => {
      this.chooseHero('swordman');
    })

    this.oNextButton.setInteractive();
    this.oNextButton.on("pointerover", () => {})
    this.oNextButton.on("pointerout", () => {})
    this.oNextButton.on("pointerup", () => {
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
    this.sChosenHero = type;
    if (type == 'mage') {
      if (this.oSwordman) {
        this.oSwordman.destroy();
      }
      this.oMage = this.add.sprite(this.sys.game.renderer.width / 1.4, this.sys.game.renderer.height / 2.4, CST.IMAGE.MAGE).setOrigin(0).setDepth(0);
    } else {
      this.oMage.destroy();
      this.oSwordman = this.add.sprite(this.sys.game.renderer.width / 1.4, this.sys.game.renderer.height / 2.4, CST.IMAGE.SWORDMAN).setOrigin(0).setDepth(0).setDisplaySize(200,300);
    }
  }

}
