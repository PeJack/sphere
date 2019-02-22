import { GameScene } from '../scenes/gameScene';
import { IPath, IPosition, IPoint } from '../interfaces';
import Item from './item';
import { ButtonHandler, IDownButtons } from '../systems/buttonHandler';
import Inventory from './inventory';
import FloatingText from '../systems/floatingText';
import helpers from '../helpers';

//@ts-ignore
interface ISpriteAdd extends Phaser.GameObjects.Sprite {
    _offset?    : number,
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
    public id                   : number;
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
    public nMaxHp               : number;
    public nSp                  : number;
    public nRange               : number;
    public nFaMaxDmg            : number;
    public nFaMinDmg            : number;
    public nMaMaxDmg            : number;
    public nMaMinDmg            : number;
    public nReloadTime          : number;
    public bReloading           : boolean;
    public oButtonHandler       : ButtonHandler;
    public oDownButtons         : IDownButtons;
    public oInventory           : Inventory;
    public oHealthBarBg         : Phaser.GameObjects.Graphics;
    public oHealthBar           : Phaser.GameObjects.Graphics;
    public oContainer           : Phaser.GameObjects.Container;  

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

        this.oSprite._offset = -8;
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

        this.oContainer = this.oGameScene.add.container(this.oSprite.x, this.oSprite.y);
        
        this.createHealthBar();
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
                    }
                ),
                frameRate: 12
            });
        }

        if (!this.oGameScene.anims.exists("blood_hit_1")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_1",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_1", {
                        start: 0,
                        end: 12
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);

                        let children = this.oGameScene.oLayers.underactors.getChildren().filter(
                            el=> el.name === sprite.name
                        );
                        if (children.length > 4) {
                            this.oGameScene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                delay: 5000,
                                duration: 10000,
                                onComplete: function() {
                                    sprite.destroy();
                                },
                                onCompleteScope: this,
                            })
                        }
                    }, this
                );
            }
        }

        if (!this.oGameScene.anims.exists("blood_hit_2")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_2",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_2", {
                        start: 0,
                        end: 12
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);
                        
                        let children = this.oGameScene.oLayers.underactors.getChildren().filter(
                            el=> el.name === sprite.name
                        );
                        if (children.length > 4) {
                            this.oGameScene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                delay: 5000,
                                duration: 10000,
                                onComplete: function() {
                                    sprite.destroy();
                                },
                                onCompleteScope: this,
                            })
                        }
                    }, this
                );
            }
        }

        if (!this.oGameScene.anims.exists("blood_hit_3")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_3",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_3", {
                        start: 0,
                        end: 12
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);

                        let children = this.oGameScene.oLayers.underactors.getChildren().filter(
                            el=> el.name === sprite.name
                        );
                        if (children.length > 4) {
                            this.oGameScene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                delay: 5000,
                                duration: 10000,
                                onComplete: function() {
                                    sprite.destroy();
                                },
                                onCompleteScope: this,
                            })
                        }
                    }, this
                );
            }
        }  
        
        if (!this.oGameScene.anims.exists("blood_hit_4")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_4",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_4", {
                        start: 0,
                        end: 12
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);

                        let children = this.oGameScene.oLayers.underactors.getChildren().filter(
                            el=> el.name === sprite.name
                        );
                        if (children.length > 4) {
                            this.oGameScene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                delay: 5000,
                                duration: 10000,
                                onComplete: function() {
                                    sprite.destroy();
                                },
                                onCompleteScope: this,
                            })
                        }
                    }, this
                );
            }
        }   
        
        if (!this.oGameScene.anims.exists("blood_hit_5")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_5",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_5", {
                        start: 0,
                        end: 12
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);

                        let children = this.oGameScene.oLayers.underactors.getChildren().filter(
                            el=> el.name === sprite.name
                        );
                        if (children.length > 4) {
                            this.oGameScene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                delay: 5000,
                                duration: 10000,
                                onComplete: function() {
                                    sprite.destroy();
                                },
                                onCompleteScope: this,
                            })
                        }
                    }, this
                );
            }
        }

        if (!this.oGameScene.anims.exists("blood_hit_6")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_6",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_6", {
                        start: 0,
                        end: 14
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);
                        
                        this.oGameScene.tweens.add({
                            targets: sprite,
                            alpha: 0,
                            delay: 2000,
                            duration: 500,
                            onComplete: function() {
                                sprite.destroy();
                            },
                            onCompleteScope: this,
                        })
                    }, this
                );
            }
        }

        if (!this.oGameScene.anims.exists("blood_hit_7")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_7",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_7", {
                        start: 0,
                        end: 14
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);
                        
                        this.oGameScene.tweens.add({
                            targets: sprite,
                            alpha: 0,
                            delay: 5000,
                            duration: 500,
                            onComplete: function() {
                                sprite.destroy();
                            },
                            onCompleteScope: this,
                        })
                    }, this
                );
            }
        }

        if (!this.oGameScene.anims.exists("blood_hit_8")) {
            let anim  = this.oGameScene.anims.create({
                key: "blood_hit_8",
                frames: this.oGameScene.anims.generateFrameNumbers(
                    "blood_hit_8", {
                        start: 0,
                        end: 14
                    }
                ),
            })

            if (anim) {
                anim.on('complete', (
                        currentAnim: Phaser.Animations.Animation, 
                        currentFrame: number, 
                        sprite: Phaser.GameObjects.Sprite
                    ) => {
                        sprite.setDepth(0);
                        
                        this.oGameScene.tweens.add({
                            targets: sprite,
                            alpha: 0,
                            delay: 5000,
                            duration: 500,
                            onComplete: function() {
                                sprite.destroy();
                            },
                            onCompleteScope: this,
                        })
                    }, this
                );
            }
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
            y: this.oSprite.target.y,
            duration: this.nMovingDelay,
            ease: 'Linear',
            onStart: function() {
                this.startWalk(this.oDirectionScale[direction]);
            },
            onStartScope: this,
            onComplete: function() {
                this.stopWalk(callback, context);
            },
            onCompleteScope: this,
            onUpdate: function() {
                this.oContainer.setPosition(this.oSprite.x, this.oSprite.y);
            },
            onUpdateScope: this
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

    hurt(faDmg: number, maDmg: number) : void {
        new FloatingText(this.oGameScene, {
            text: "-" + (faDmg + maDmg),
            // @ts-ignore
            parentObject: this.oSprite,
            animation: "explode",
            textStyle: {
                fontSize: 14,
                fill: "#FF0000",
                stroke: "#ffffff",
                strokeThickness: 2,
                wordWrap: true,
                wordWrapWidth: 200
            }
        });

        this.nHp -= faDmg + maDmg;

        this.oHealthBar.clear();
        this.oHealthBar.fillStyle(0x88e453, 1);
        this.oHealthBar.fillRect(
            - (this.oSprite.width / 4), 
            - this.oSprite.height / 2,
            (this.oSprite.width / 2) * (this.nHp / this.nMaxHp), 2
        ); 

        const dummyPos = {} as IPoint;
        let frames = [1,2,3,4,5];
        let frame = frames[Math.floor(Math.random()*frames.length)];
        switch (frame) {
            case 1:
                dummyPos.x = this.oSprite.x - 35;
                dummyPos.y = this.oSprite.y - this.oSprite.height / 2;
                break;
            case 2:
                dummyPos.x = this.oSprite.x;
                dummyPos.y = this.oSprite.y - this.oSprite.height;
                break;
            case 3:
                dummyPos.x = this.oSprite.x + 45;
                dummyPos.y = this.oSprite.y + this.oSprite.height / 2;
                break;
            case 4:
                dummyPos.x = this.oSprite.x;
                dummyPos.y = this.oSprite.y + this.oSprite.height / 2;
                break;
            case 5:
                dummyPos.x = this.oSprite.x;
                dummyPos.y = this.oSprite.y + this.oSprite.height / 2;
                break;   
            default:
                break;                    
        }

        const dummy: Phaser.GameObjects.Sprite = this.oGameScene.oLayers.underactors.create(dummyPos.x, dummyPos.y, "blood_dummy_" + this.id, 0, true); 
        dummy.name = "blood_dummy_" + this.id;

        dummy.play("blood_hit_" + frame);
        dummy.setDepth(100);

        if (this.nHp <= 0) {
            this.kill();
        }
    }

    kill(): void {
        this.oGroup.remove(this.oSprite, true);
        this.oContainer.removeAll(true);
        this.oGameScene.aActorsList = this.oGameScene.aActorsList.filter(actor=> actor.id !== this.id);
    }

    private createHealthBar(): void {
        this.oHealthBarBg = this.oGameScene.add.graphics();
        this.oHealthBarBg.lineStyle(1, 0x000000)
        this.oHealthBarBg.strokeRect(
            - this.oSprite.width / 4, 
            - this.oSprite.height / 2, 
            (this.oSprite.width / 2) - 1, 2
        ); 
        this.oContainer.add(this.oHealthBarBg);

        this.oHealthBar = this.oGameScene.add.graphics();
        this.oHealthBar.fillStyle(0x88e453, 1);
        this.oHealthBar.fillRect(
            - this.oSprite.width / 4, 
            - this.oSprite.height / 2, 
            (this.oSprite.width / 2) - 1, 2
        ); 

        this.oContainer.add(this.oHealthBar);
    }

    pickUp(item: Item): void {}

    aiAct(): void {}
}