import { GameScene } from '../scenes/gameScene';
import { IPath, IPosition } from '../interfaces';

interface spriteAdd {
    off    : number,
    target : { x : number, y : number }
}

interface directionScale {
    up    : number,
    down  : number,
    left  : number,
    right : number
}

interface position {
    x : number, y : number,
    worldX : number, worldY : number
}

export default class Actor {
    public oGameScene         : GameScene;
    private oGroup            : Phaser.GameObjects.Group;
    public nScale             : number;
    private bWalking          : boolean;
    private sCurrDir          : string;
    public  oPosition         : { x : number, y : number };  
    public  oSprite           : Phaser.GameObjects.Sprite;
    public  oSpriteAdd        : spriteAdd;
    public  oDirectionScale   : directionScale;
    public  nSpriteOffset     : number;
    public  nMovingDelay      : number;
    public  nLocalID          : number;
    public  bIsPlayer         : boolean; 
    public  bVisibleForPlayer : boolean;   
    public  aPath             : IPath[];

    constructor(gameScene : GameScene, pos : {x : number, y : number}) {
        this.oGameScene = gameScene;
        this.oGroup = this.oGameScene.oLayers.actors;
        this.nScale = 0.4;
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
        this.oSpriteAdd.off = -8;
        this.oSpriteAdd.target = {
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

    getPosition() : IPosition {
        return this.oGameScene.getPosition(this.oSprite);
    }

    walkToTile(path? : IPath, direction? : string, callback? : Function, context? : Class) : void {
        if (!path || (!path.x && !path.y)) {
            if (typeof callback == "function") {
                callback.call(context);
            }

            return;
        }

        let checkingPath = path;
        if (!checkingPath.x) {
            checkingPath.x = this.getPosition().x;
        } else if (!checkingPath.y) {
            checkingPath.y = this.getPosition().y;
        }

        if (!this.oGameScene.oMapsManager.isWalkable(checkingPath)) {
            if (typeof callback == "function") {
                callback.call(context);
            }

            return;
        }

        if (this.bIsPlayer && this.oGameScene.oActorsMap.hasOwnProperty(checkingPath.x + "." + checkingPath.y)) {
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
          this.oSpriteAdd.target.x = newCoords.x;
        }
        if (newCoords.y) {
          this.oSpriteAdd.target.y = newCoords.y;
        }
    
        this.sCurrDir = direction;
        this.oGameScene.tweens.add({
            targets: this.oSprite,
            x: this.oSpriteAdd.target.x,
            y: this.oSpriteAdd.target.y + this.oSpriteAdd.off,
            duration: this.nMovingDelay,
            ease: 'Power2',
            onStart: function() {
                this.startWalk(this.directionScale[direction]);
            },
            onComplete: function() {
                this.stopWalk(callback, context);
            }
        });
    }

    startWalk(direction : number) : void {
        if (this.bWalking == false) {
          this.bWalking = true;
        }
    
        let target = this.oSpriteAdd.target;
      
        if (direction) {
          this.oSprite.scaleX = direction;
          this.oSprite.play("walk");
        } else {
          if (target.y < this.oSprite.y) {
            this.oSprite.play("walkup");
          } else {
            this.oSprite.play("walk");
          }
        }
    
        if (!this.bIsPlayer){
          delete this.oGameScene.oActorsMap[this.oPosition.x + "." + this.oPosition.y];
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
}