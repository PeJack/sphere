import { GameScene } from '../scenes/game-scene';

export default class Actor {
    private oGameScene : GameScene;
    private oGroup     : Phaser.GameObjects.Group;
    private nScale     : number;
    private bWalking   : boolean;
    private sCurrDir   : string;
    private bIsPlayer  : boolean;
    private oSprite    : Phaser.GameObjects.Sprite;

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

        this.oSprite.setPosition()
    }
}