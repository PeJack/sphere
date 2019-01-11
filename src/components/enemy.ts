import Actor from './actor';
import { GameScene } from '../scenes/game-scene';


export class Enemy extends Actor {
    public nHp                 : number;
    public nSp                 : number;
    public nDamage             : number;
    public bAlerted            : boolean;
    public nAlertedTime        : number;
    public bAlertedHasFinished : boolean;

    public oAlertedTimer       : Phaser.Time.TimerEvent;

    constructor(gameScene : GameScene, data : any[], pos : {x : number, y : number}) {
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

    aiAct() : void {
        if (this.bAlerted) return;

        if (this.bVisibleForPlayer) {
            if (this.oGameScene.oMapsManager.map.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
                this.bAlerted = true;

                let aPath = [];
                path = this.oGameScene.oItemsMapsManager.map.pathfinding(this, this.oGameScene.oPlayer);
                path.shift();
                this.moveTo(path);
            }
        }
    }

    moveTo(path) {
        let firstPath = path.shift();
        
        if (!firstPath) {
            this.bAlerted = false;
            this.bAlertedHasFinished = true;
            return;
        }

        if (this.oGameScene.oActorsMap.hasOwnProperty(firstPath.x + "." + firstPath.y)) {
            path = this.oGameScene.oMapsManager.map.pathfinding(this, this.oGameScene.oPlayer);
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

        if (this.oGameScene.oMapsManager.map.computeVisibilityBetween(this, this.oGameScene.oPlayer)) {
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
            this.bAlerted = false;
            this.bAlertedHasFinished = false;
        }
        
    }
}