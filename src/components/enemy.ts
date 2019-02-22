import Actor from './actor';
import { GameScene } from '../scenes/gameScene';
import { IPath, IActorsListItem, IPosition, IPoint } from '../interfaces';
import helpers from '../helpers';

export class Enemy extends Actor {
    public nHp                 : number;
    public nSp                 : number;
    public nRange              : number;
    public bAlerted            : boolean;
    public nAlertedTime        : number;
    public bAlertedHasFinished : boolean;
    public nFaMaxDmg           : number;
    public nFaMinDmg           : number;
    public nMaMaxDmg           : number;
    public nMaMinDmg           : number;
    public nReloadTime         : number;
    public bReloading          : boolean;

    public oAlertedTimer       : Phaser.Time.TimerEvent;

    constructor(gameScene : GameScene, data : IActorsListItem, pos : IPosition) {
        super(gameScene, pos);
        
        this.nEntityID = data.id;
        this.nSpriteOffset = data.spriteOffset;
        this.nMaxHp = 10000;
        this.nHp = this.nMaxHp;
        this.nSp = 110;
        this.nFaMaxDmg = 8;
        this.nFaMinDmg = 4;
        this.nMaMaxDmg = 0;
        this.nMaMinDmg = 0;
        this.nRange = 4;
        this.nReloadTime = 2;
        this.bReloading = false;

        this.bAlerted = false;
        this.nAlertedTime = 5;
        this.nMovingDelay = 250;

        this.bAlertedHasFinished = false;
        this.setAnimations();
    }

    public aiAct() : void {
        if (this.bAlerted) return;

        if (this.bVisibleForPlayer) {
            if (this.oGameScene.oMapsManager.oMap.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
                this.bAlerted = true;

                let aPath = [];
                aPath = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
                aPath.shift();

                this.moveTo(aPath);
            }
        }
    }

    moveTo(path: IPath[]): void {
        let firstPath = path.shift();
        
        if (!firstPath) {
            this.bAlerted = false;
            this.bAlertedHasFinished = true;
            return;
        }
        
        if (this.oGameScene.oMapsManager.oMap.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
            if (this.oGameScene.distanceBetween(firstPath, this.oGameScene.oPlayer.oPosition) <= this.nRange) {

                if (!this.bReloading) {
                    this.attack(this.oGameScene.oPlayer);
                    this.bAlerted = false;
                    this.bAlertedHasFinished = true;
                    return;                    
                }

                if (!this.oGameScene.oMapsManager.oMap.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
                    path = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
                    path.shift();
                    firstPath = path.shift();
                }

            }

            if (this.oGameScene.distanceBetween(firstPath, this.oGameScene.oPlayer.oPosition) > 
                this.oGameScene.distanceBetween(this.oPosition, this.oGameScene.oPlayer.oPosition)) {
            
                path = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
                if (path.length > 1) path.shift();
                if (path.length == 1) {
                    this.bAlerted = false;
                    return;
                }
    
                firstPath = path.shift();
            }
        }



        // if (this.oGameScene.oActorsMap.hasOwnProperty(firstPath.x + "." + firstPath.y)) {
        //     path = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
        //     if (path.length > 1) path.shift();
        //     this.oGameScene.time.addEvent({
        //         delay: 100,
        //         callback: function() {
        //             this.moveTo(path)
        //         },
        //         callbackScope: this
        //     })

        //     return;
        // }

        if (this.oGameScene.oMapsManager.oMap.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
            if (this.oAlertedTimer) { this.oAlertedTimer.destroy() };
            this.oAlertedTimer = this.oGameScene.time.addEvent({
                delay: this.nAlertedTime * 1000,
                callback: function() {
                    this.bAlertedHasFinished = true;
                },
                callbackScope: this
            });
        }

        if (path.length) {
            this.walkToTile(firstPath, null, function() {
                this.moveTo(path);
            }, this)
        } else {
            if (!this.bAlertedHasFinished) {
                path = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
                if (path.length > 1) path.shift();
                if (path.length == 1) {
                    this.bAlerted = false;
                    return;
                }

                firstPath = path.shift();

                this.walkToTile(firstPath, null, function() {
                    this.moveTo(path);
                }, this)
            } else {
                this.bAlerted = false;
                this.bAlertedHasFinished = false;
            }
        }
        
    }

    attack(target: Actor): void {
        let obj1: IPosition, obj2: IPosition;
        let angle: number;
        let startPoint: IPoint, targetPoint: IPoint;
        let dx: number, dy: number;
        let diagonalDist: number;  
        let newPath : IPoint[] = [];               

        obj2 = {x: this.oSprite.x, y: this.oSprite.y};
        obj1 = {x: target.oSprite.x, y: target.oSprite.y};
        angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);   

        startPoint = {
            x: this.getPosition().x,
            y: this.getPosition().y
        };    
      
        targetPoint = target.oPosition;

        dx = Math.abs(targetPoint.x - startPoint.x);
        dy = Math.abs(targetPoint.y - startPoint.y);
        diagonalDist = Math.max(dx, dy);  
      
        let point: IPoint; 
        let t: number;
        const checkingPoint = {} as IPoint;

        for (let step = 0; step <= diagonalDist; step++) {
            t = diagonalDist == 0 ? 0.0 : step / diagonalDist;
            point = helpers.lerpPoint(startPoint, targetPoint, t); 

            checkingPoint.x = point.x;
            checkingPoint.y = point.y;  

            if (!this.oGameScene.oMapsManager.isWalkable(checkingPoint)) {
                break;
            } else {
                newPath.push(point)
            }
        }

        const coordPath = [] as IPoint[];
        newPath.forEach((np: IPoint)=> {
            let _coordPath = this.oGameScene.posToCoord(np);
            coordPath.push({x: _coordPath.x, y: _coordPath.y});
        });
 
        if (!coordPath.length) {
            return;
        } else if (coordPath.length == 1) {
            startPoint = coordPath[0];      
        } else {
            startPoint = coordPath.shift();
        }; 

        const projectile : Phaser.GameObjects.Sprite = this.oGameScene.oLayers.effects.create(startPoint.x, startPoint.y, "48bitSprites");
        projectile.setFrame(helpers.oSpriteOffset.normalArrow);
        projectile.angle = angle + 180; 
        
        this.bReloading = true;
        this.oGameScene.time.addEvent({
            delay: this.nReloadTime * 1000,
            callback: function() {
                this.bReloading = false;
            },
            callbackScope: this
        });

        this.createProjectile(coordPath, projectile);
    }

    createProjectile(path: IPoint[], projectile: Phaser.GameObjects.Sprite): void {
        const firstPath: IPoint = path.shift(),
            projectilePos: IPosition = this.oGameScene.getPosition(projectile),
            firstPathPos: IPosition = this.oGameScene.getPosition(firstPath),
            delay: number = 25 * (Math.abs(projectilePos.x - firstPathPos.x) + Math.abs(projectilePos.y - firstPathPos.y));

        if (this.oGameScene.checkOverlap(projectile, this.oGameScene.oPlayer.oSprite)) {
            this.oGameScene.oPlayer.hurt(
                helpers.random(this.nFaMaxDmg, this.nFaMinDmg), 
                helpers.random(this.nMaMaxDmg, this.nMaMinDmg)
            );
            projectile.destroy();
            return;
        }

        if (path.length != 0) {
            this.oGameScene.tweens.add({
                targets: projectile,
                x: firstPath.x,
                y: firstPath.y,
                ease: 'Linear',
                duration: delay,
                onComplete: function() {
                    this.createProjectile(path, projectile);
                },
                onCompleteScope: this,
                onCompleteParams: [path, projectile],          
            });
        } else {
            this.oGameScene.tweens.add({
                targets: projectile,
                x: firstPath.x,
                y: firstPath.y,
                ease: 'Linear',
                duration: delay,
                onComplete: function() {
                    projectile.destroy();
                },
                onCompleteScope: this,
                onCompleteParams: [projectile],          
            });
        } 
    }
}