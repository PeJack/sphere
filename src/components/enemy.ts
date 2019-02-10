import Actor from './actor';
import { GameScene } from '../scenes/gameScene';
import { IPath, IActorsListItem, IPosition } from '../interfaces';


export class Enemy extends Actor {
    public nHp                 : number;
    public nSp                 : number;
    public nDamage             : number;
    public bAlerted            : boolean;
    public nAlertedTime        : number;
    public bAlertedHasFinished : boolean;

    public oAlertedTimer       : Phaser.Time.TimerEvent;

    constructor(gameScene : GameScene, data : IActorsListItem, pos : IPosition) {
        super(gameScene, pos);
        
        this.nSpriteOffset = 0;
        this.nHp = 100;
        this.nSp = 110;
        this.nDamage = 1;
        this.bAlerted = false;
        this.nAlertedTime = 5;
        this.nMovingDelay = 300;

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

        if (this.oGameScene.oActorsMap.hasOwnProperty(firstPath.x + "." + firstPath.y)) {
            path = this.oGameScene.oMapsManager.oMap.pathFinding(this, this.oGameScene.oPlayer);
            if (path.length > 1) path.shift();
            this.oGameScene.time.addEvent({
                delay: 100,
                callback: function() {
                    this.moveTo(path)
                },
                callbackScope: this
            })

            return;
        }

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
}