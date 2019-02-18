export class BootScene extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;

    constructor() {
        super({
            key: "BootScene"
        });
    }

    preload(): void {
        this.cameras.main.setBackgroundColor(0x000000);
        this.createLoadingGraphics();

        this.sys.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.load.on(
            "progress",
            function(value: number) {
              this.progressBar.clear();
              this.progressBar.fillStyle(0x88e453, 1);
              this.progressBar.fillRect(
                this.cameras.main.width / 4,
                this.cameras.main.height / 2 - 16,
                (this.cameras.main.width / 2) * value,
                16
              );
            },
            this
        );

        this.load.on(
            "complete",
            function() {
              this.progressBar.destroy();
              this.loadingBar.destroy();
            },
            this
        );

        this.load.image('forest-tiles', 'assets/sprites/foresttiles_0.png');
        this.load.json('items_list', 'assets/data/items.json');

        this.loadUI();
        this.loadItems();
        this.loadBlood();
    }

    create(): void {
        this.scene.start("GameScene");
    }

    private createLoadingGraphics(): void {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0xffffff, 1);
        this.loadingBar.fillRect(
          this.cameras.main.width / 4 - 2,
          this.cameras.main.height / 2 - 18,
          this.cameras.main.width / 2 + 4,
          20
        );
        this.progressBar = this.add.graphics();        
    }

    private loadUI(): void {
        this.load.spritesheet("48bitSprites", "assets/sprites/48bitSprites.png", {frameHeight: 48, frameWidth: 48});
        this.load.spritesheet("timer", 'assets/ui/timer.png', {frameWidth: 66, frameHeight: 10});
        this.load.spritesheet("timer_bg", 'assets/ui/timer_bg.png', {frameWidth: 66, frameHeight: 10});
        this.load.atlas("inventory", 'assets/ui/invent.png','assets/ui/invent.json');
        this.load.image("ic_hand", "assets/ui/icons/ic_hand.png");
    }

    private loadItems(): void {
        this.load.atlas("items_spritesheet", 'assets/sprites/items.png','assets/sprites/items.json');
    }

    private loadBlood(): void {
        this.load.spritesheet('blood_hit_1', 'assets/sprites/blood/blood_hit_01.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_2', 'assets/sprites/blood/blood_hit_02.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_3', 'assets/sprites/blood/blood_hit_03.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_4', 'assets/sprites/blood/blood_hit_04.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_5', 'assets/sprites/blood/blood_hit_05.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_6', 'assets/sprites/blood/blood_hit_06.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_7', 'assets/sprites/blood/blood_hit_07.png', {
            frameWidth: 128,
            frameHeight: 128            
        });

        this.load.spritesheet('blood_hit_8', 'assets/sprites/blood/blood_hit_08.png', {
            frameWidth: 128,
            frameHeight: 128            
        });
    }
}