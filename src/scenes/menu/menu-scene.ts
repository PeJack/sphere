// import { CST } from "../../CST"

// export class MenuScene extends Phaser.Scene {
//   private nOptionCount    : number; // Количество кнопок меню.
//   private oPlayButton     : Phaser.GameObjects.Image;
//   private oOptionsButton  : Phaser.GameObjects.Image;

//   constructor() {
//     super({
//       key: "MenuScene"
//     });
//     this.nOptionCount = 1;
//   }


//   init(): void {
//   }

//   create(): void {
//     // Добавить фон.
//     this.add.image(0, 0, CST.IMAGE.TITLE).setOrigin(0).setDepth(0);
    
//     // Добавить лого.
//     this.add.text(this.sys.game.renderer.width / 3.2, this.sys.game.renderer.height * 0.20, "[SPHERE]", {font: '84px Courier New', fill: '#ffffff'}).setDepth(1);

//     // Создать кнопки.
//     this.oPlayButton    = this.add.image(this.sys.game.renderer.width / 2, this.sys.game.renderer.height / 2, CST.IMAGE.PLAY).setDepth(1);
//     this.oOptionsButton = this.add.image(this.sys.game.renderer.width / 2, this.sys.game.renderer.height / 2 + 100, CST.IMAGE.OPTIONS).setDepth(1);


//     // Создать аудио.
//     this.sound.pauseOnBlur = false; // Делает воспроизвидение непрекращающимся при переходе на другую вкладку.
//     this.sound.play(CST.AUDIO.TITLE, {loop: true})

//     this.oPlayButton.setInteractive();
//     this.oPlayButton.on("pointerover", () => {})
//     this.oPlayButton.on("pointerout", () => {})
//     this.oPlayButton.on("pointerup", () => {
//         this.scene.start("ChooseHeroScene");
//     })

//     this.oOptionsButton.setInteractive();
//     this.oOptionsButton.on("pointerover", () => {})
//     this.oOptionsButton.on("pointerout", () => {})
//     this.oOptionsButton.on("pointerup", () => {
//         //this.scene.launch();
//     })
//   }

//   update(): void {
//   }

// }
