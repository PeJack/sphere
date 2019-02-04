import { GameScene } from "../scenes/game-scene";
import Helpers from "../helpers";

export class EffectsManager {
    private oGameScene  : GameScene;
    private nTilesize   : number;
    private oLayer      : Phaser.GameObjects.Group;
    private oSprite     : Phaser.GameObjects.Sprite;
    
    constructor(gameScene: GameScene) {
        this.oGameScene         = gameScene;
        this.nTilesize          = this.oGameScene.nTileSize;
        this.oLayer             = this.oGameScene.oLayers.effects;
        this.oSprite            = this.oLayer.create(0, 0, "48bitSprites");
        this.oSprite.visible    = false;

        this.init();
    }

    private init(): void {
        this.setAnimation();
    }

    setAnimation(): void {
        let off = Helpers.oSpriteOffset.strike1;
        this.oGameScene.anims.create({
            key: "strike1",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [off, off + 1, off + 1]
                }),
            repeat: -1
        });

        off = Helpers.oSpriteOffset.strike2;
        this.oGameScene.anims.create({
            key: "strike2",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [off, off + 1, off + 1]
                }),
            repeat: -1
        });
        
        off = Helpers.oSpriteOffset.strike3;
        this.oGameScene.anims.create({
            key: "scratch",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [off, off + 1, off + 1]
                }),
            repeat: -1
        });         
    }

    strike(x: number, y: number, callback?: Function): void {
        if (callback) {
            this.oSprite.removeListener("animationcomplete", callback, this, true);
            this.oSprite.once("animationcomplete", callback, this);
        }

        this.oSprite.setPosition(x, y - 6);
        
        if (Math.round(1 * Math.random())) {
            this.oSprite.anims.play("strike1");
        } else {
            this.oSprite.anims.play("strike2");
        }
    }

    scratch(x: number, y: number, callback?: Function): void {
        if (callback) {
            this.oSprite.removeListener("animationcomplete", callback, this, true);
            this.oSprite.once("animationcomplete", callback, this);            
        }

        this.oSprite.setPosition(x, y - 6);
        this.oSprite.anims.play("scratch");
    }
}