import { GameScene, Position } from '../scenes/game-scene';

interface spriteAdd {
    off    : number,
    target : { x : number, y : number}
}

interface directionScale {
    up    : number,
    down  : number,
    left  : number,
    right : number
}

export default class Actor {
    private oGameScene      : GameScene;
    private oGroup          : Phaser.GameObjects.Group;
    private bWalking        : boolean;
    private sCurrDir        : string;
    private bIsPlayer       : boolean;
    public  oSprite         : Phaser.GameObjects.Sprite;
    public  oSpriteAdd      : spriteAdd;
    public  oDirectionScale : directionScale;
    public  nScale          : number;
    public  nSpriteOffset   : number;

    constructor(gameScene : GameScene, pos : {x : number, y : number}) {
        this.oGameScene = gameScene;
        this.oGroup = this.oGameScene.oLayers.actors;
        this.nScale = 0.4;
        this.bWalking = false;
        this.sCurrDir = "down";
        this.bIsPlayer = false;
        this.oSprite = this.oGroup.create(
            pos.x * this.oGameScene.nTileSize, 
            pos.y * this.oGameScene.nTileSize, 
            "48bitSprites"
        );

        this.oSprite.setOrigin(0.5, 0.5);
        this.oSprite.setScale(this.nScale, this.nScale);
        this.oSpriteAdd.off = -8;
        this.oSpriteAdd.target = {
            x: this.oSprite.x,
            y: this.oSprite.y
        };

        this.oSprite.setPosition();
        this.oDirectionScale = {
            up: null,
            down: null,
            left: this.nScale,
            right: -this.nScale
        };
    }

    setAnimations() : void {
        this.oGameScene.anims.create({
            key: "idle",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [0 + this.nSpriteOffset, 1 + this.nSpriteOffset]
                }),
            repeat: -1
        });

        this.oGameScene.anims.create({
            key: "walk",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [1 + this.nSpriteOffset, 2 + this.nSpriteOffset, 3 + this.nSpriteOffset, 2 + this.nSpriteOffset]
                }),
            repeat: -1
        });

        this.oGameScene.anims.create({
            key: "walkup",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [7 + this.nSpriteOffset, 8 + this.nSpriteOffset, 9 + this.nSpriteOffset, 8 + this.nSpriteOffset]
                }),
            repeat: -1
        });

        this.oGameScene.anims.create({
            key: "attack",
            frames: this.oGameScene.anims.generateFrameNumbers(
                "48bitSprites", {
                    // @ts-ignore
                    frames: [4 + this.nSpriteOffset, 5 + this.nSpriteOffset, 6 + this.nSpriteOffset, 6 + this.nSpriteOffset, 5 + this.nSpriteOffset, 4 + this.nSpriteOffset]
                }),
            repeat: -1
        });

        this.oSprite.play("idle", false, 2 + this.nSpriteOffset);

    }

    startIdle() : void {
        this.oSprite.anims.stop();
    }

    public getPosition(): Position{
      return this.oGameScene.getPosition(this.oSprite);
    }
}