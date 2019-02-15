import { GameScene } from '../scenes/gameScene';
import { IPath, IPosition } from '../interfaces';
import Item from './item';
import { ButtonHandler, IDownButtons } from '../systems/buttonHandler';
import Inventory from './inventory';

//@ts-ignore
interface ISpriteAdd extends Phaser.GameObjects.Sprite {
    off?    : number,
    target? : { x : number, y : number }
}

interface IDirectionScale {
    up    : number,
    down  : number,
    left  : number,
    right : number
}

export default class Actor {
    public oGameScene           : GameScene;
    public nScale               : number;
    public oPosition            : IPosition;  
    public oSprite              : ISpriteAdd;
    public oDirectionScale      : IDirectionScale;
    public nSpriteOffset        : number;
    public nMovingDelay         : number;
    public nLocalID             : number;
    public nEntityID            : number;
    public bIsPlayer            : boolean; 
    public bVisibleForPlayer    : boolean;   
    public aPath                : IPath[];
    public oWeapon              : Item;
    public nHp                  : number;
    public nSp                  : number;
    public nDamage              : number;
    public oButtonHandler       : ButtonHandler;
    public oDownButtons         : IDownButtons;
    public oInventory           : Inventory;

    private bWalking            : boolean;
    private sCurrDir            : string; 
    private oGroup              : Phaser.GameObjects.Group;       

    constructor(gameScene: GameScene, pos: IPosition) {
        this.oGameScene = gameScene;
        this.oGroup = this.oGameScene.oLayers.actors;
        this.nScale = 0.6;
        this.bWalking = false;
        this.sCurrDir = "down";
        this.bIsPlayer = false;
        this.bVisibleForPlayer = false;
        
        this.oSprite = this.oGroup.create(
            pos.x * this.oGameScene.nTileSize, 
            pos.y * this.oGameScene.nTileSize, 
            "48bitSprites"
        );

        this.oSprite.setOrigin(0.5, 0.5);
        this.oSprite.setScale(this.nScale, this.nScale);

        this.oSprite.off = -8;
        this.oSprite.target = {
            x: this.oSprite.x,
            y: this.oSprite.y
        };

        this.oPosition = {
            x: this.getPosition().x,
            y: this.getPosition().y
        };

        this.oDirectionScale = {
            up: null,
            down: null,
            left: this.nScale,
            right: -this.nScale
        };
    }

    setAnimations(): void {
        if (!this.oGameScene.anims.exists("idle_" + this.nEntityID)) {
            this.oGameScene.anims.create({
                key: "idle_" + this.nEntityID,
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "48bitSprites", {
                        // @ts-ignore
                        frames: [0 + this.nSpriteOffset, 1 + this.nSpriteOffset]
                    }),
                repeat: -1,
                frameRate: 6           
            });
        }

        if (!this.oGameScene.anims.exists("walk_" + this.nEntityID)) {        
            this.oGameScene.anims.create({
                key: "walk_" + this.nEntityID,
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "48bitSprites", {
                        // @ts-ignore
                        frames: [1 + this.nSpriteOffset, 2 + this.nSpriteOffset, 3 + this.nSpriteOffset, 2 + this.nSpriteOffset],
                    }),
                repeat: -1,
                frameRate: 10          
            });
        }

        if (!this.oGameScene.anims.exists("walkup_" + this.nEntityID)) {
            this.oGameScene.anims.create({
                key: "walkup_" + this.nEntityID,
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "48bitSprites", {
                        // @ts-ignore
                        frames: [7 + this.nSpriteOffset, 8 + this.nSpriteOffset, 9 + this.nSpriteOffset, 8 + this.nSpriteOffset]
                    }),
                repeat: -1,
                frameRate: 10,
            });
        }

        if (!this.oGameScene.anims.exists("attack_" + this.nEntityID)) {
            this.oGameScene.anims.create({
                key: "attack_" + this.nEntityID,
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "48bitSprites", {
                        // @ts-ignore
                        frames: [4 + this.nSpriteOffset, 5 + this.nSpriteOffset, 6 + this.nSpriteOffset, 6 + this.nSpriteOffset, 5 + this.nSpriteOffset, 4 + this.nSpriteOffset]
                    }),
                repeat: -1
            });
        }

        this.oSprite.play("idle_" + this.nEntityID, false, 2 + this.nSpriteOffset);
    }

    startIdle(): void {
        this.oSprite.anims.stop();
    }

    getPosition(): IPosition {
        return this.oGameScene.getPosition(this.oSprite);
    }

    walkToTile(path?: IPath, direction?: string, callback?: Function, context?: Class): void {
        if (!path || (path.x === undefined && path.y === undefined)) {
            if (typeof callback == "function") {
                callback.call(context);
            }
            return;
        }

        let checkingPath = path;
        if (checkingPath.x === undefined) {
            checkingPath.x = this.getPosition().x;
        } else if (checkingPath.y === undefined) {
            checkingPath.y = this.getPosition().y;
        }
        
        if (!this.oGameScene.oMapsManager.isWalkable(checkingPath)) {
            if (typeof callback == "function") {
                callback.call(context);
            }

            return;
        }
    
        if (!this.bIsPlayer) {
            this.oGameScene.oActorsMap[checkingPath.x + "." + checkingPath.y] = this;
        }
    
        let newCoords = this.oGameScene.posToCoord(path);
        if (newCoords.x) {
            this.oSprite.target.x = newCoords.x;
        }
        if (newCoords.y) {
            this.oSprite.target.y = newCoords.y;
        }
    
        this.sCurrDir = direction;
        this.oGameScene.tweens.add({
            targets: this.oSprite,
            x: this.oSprite.target.x,
            y: this.oSprite.target.y + this.oSprite.off,
            duration: this.nMovingDelay,
            ease: 'Linear',
            onStart: function() {
                this.startWalk(this.oDirectionScale[direction]);
            },
            onStartScope: this,
            onComplete: function() {
                this.stopWalk(callback, context);
            },
            onCompleteScope: this
        });
    }

    startWalk(direction: number): void {
        if (this.bWalking == false) {
            this.bWalking = true;
        }
    
        let target = this.oSprite.target;
      
        if (direction) {
            this.oSprite.scaleX = direction;
            this.oSprite.play("walk_" + this.nEntityID);
        } else {
            if (target.y < this.oSprite.y) {
                this.oSprite.play("walkup_" + this.nEntityID);
            } else {
                this.oSprite.play("walk_" + this.nEntityID);
            }
        }
    
        if (!this.bIsPlayer){
            delete this.oGameScene.oActorsMap[this.oPosition.x + "." + this.oPosition.y];
        }
    }

    stopWalk(callback: Function, context: Class): void {
        this.bWalking = false;
        this.startIdle();

        this.oPosition = {
            x: this.getPosition().x,
            y: this.getPosition().y
        };

        this.oGameScene.bPositionUpdated = true;

        if (callback) {
            callback.call(context);
        }
    }

    hurt(arrIndex? : number) : void {
        if (!this.bIsPlayer) {
            if (this.oGameScene.oActorsMap.hasOwnProperty(this.oPosition.x + "." + this.oPosition.y)) {
                delete this.oGameScene.oActorsMap[this.oPosition.x + "." + this.oPosition.y];
            } else {
                for (let key in this.oGameScene.oActorsMap) {
                    if (this.oGameScene.oActorsMap[key].nLocalID == this.nLocalID) {
                        delete this.oGameScene.oActorsMap[key];
                    }
                }
            }
        };

        if (arrIndex) {
            this.oGameScene.aActorsList.splice(arrIndex, 1);
        } else {
            for (arrIndex = 0; arrIndex < this.oGameScene.aActorsList.length; arrIndex++) {
                if (this.oGameScene.aActorsList[arrIndex].nLocalID == this.nLocalID) {
                    this.oGameScene.aActorsList.splice(arrIndex, 1);
                }
            }
        };

        this.oSprite.destroy();
    }

    pickUp(item: Item): void {}

    aiAct(): void {}
}