import Actor from './actor';
import Helpers from '../helpers';
import VisualTimer from '../systems/VisualTimer';
import { GameScene } from '../scenes/gameScene';
import { IPosition, IPath, IPoint, IItem } from '../interfaces';

interface IRangeObject extends Phaser.GameObjects.Graphics {
    range: number;
}

class Item extends Phaser.GameObjects.Sprite {
    private oGameScene      : GameScene;
    public oActor           : Actor;
    private oGroup          : Phaser.GameObjects.Group;
    public oRangeObject     : IRangeObject;
    private oVisualTimer    : VisualTimer;
    public bReloading       : boolean;
    private sSpriteName     : string;
    private sType           : string;
    private sAttackType     : string;
    public nId              : number;
    public nStack           : number;
    public nMaxStack        : number;
    private nRange          : number;
    private nReloadTime     : number;
    private nDamage         : number;
    public nLevel           : number;
    private aData           : IItem;
    private fEffect         : Function;
    public oSlot            : any;
    
    public oLastPos         : IPosition;
    public bProcessAgain    : boolean;  
    public oLevelText       : Phaser.GameObjects.Text;
    public oStackText       : Phaser.GameObjects.Text;    
    
    constructor(gameScene : GameScene, aData : IItem, pos : IPosition, actor : Actor) {
        super(gameScene, pos.x, pos.y, aData[3], 0); 

        this.oGameScene     = gameScene;
        this.oGroup         = this.oGameScene.oLayers.items;
        this.oGroup.add(this, true);

        this.oActor         = actor;
        this.aData          = aData;
        this.nId            = aData[0];
        this.sSpriteName    = aData[3];
        this.sType          = "weapon";
        this.sAttackType    = "range";
        this.nLevel         = aData[5];
        this.nStack         = 1;
        this.nMaxStack      = 1;
        this.width          = this.oGameScene.nTileSize;
        this.height         = this.oGameScene.nTileSize;  
        this.nDamage        = aData[18];
        this.nRange         = 300;
        this.oRangeObject   = this.setRangeObject();
        this.nReloadTime    = aData[37];    
        this.fEffect        = this.setEffect();
        this.bReloading     = false;    
        this.oVisualTimer   = new VisualTimer({
            gameScene: this.oGameScene,
            key: "timer",
            seconds: this.nReloadTime
        });

        if (this.nLevel) {
            this.oLevelText     = this.oGameScene.add.text(
                0, 0, Helpers.romanize(this.nLevel), 
                {font: '8px Courier New', fill: '#ffffff'}
            ).setActive(false).setVisible(false);
        }

        if (this.nMaxStack && this.nMaxStack > 1) {
            this.oStackText     = this.oGameScene.add.text(
                0, 0, "" + this.nStack,
                {font: '8px Courier New', fill: '#ffffff'}
            ).setActive(false).setVisible(false);
        }
      
        const self = this;
        this.oVisualTimer.fOnComplete = function () {
          self.bReloading = false;
        };
    }

    setEffect(): Function {
        switch (this.sType) {
            case "weapon": 
                if (this.sAttackType == "melee") {
                    return this.oGameScene.oEffectsManager.strike;
                }
        }
    }

    private setRangeObject(): IRangeObject {
        const rangeObject = this.oGameScene.add.graphics({x: 0, y: 0}) as IRangeObject;

        rangeObject.range = this.nRange;
        rangeObject.lineStyle(2, 0xFF0000, 0.2);
        rangeObject.strokeCircle(0, 0, this.nRange);

        rangeObject.visible = false;  
        
        return rangeObject;
    }   
    update(): void {
        if (!this.oActor) { return }; 
        
        this.oRangeObject.x = this.oActor.oSprite.x;
        this.oRangeObject.y = this.oActor.oSprite.y;  
        
        if (!this.oVisualTimer.bHasFinished) {
            this.oVisualTimer.oSprite.x = this.oActor.oSprite.x - 30;
            this.oVisualTimer.oSprite.y = this.oActor.oSprite.y;
            this.oVisualTimer.oBackground.x = this.oActor.oSprite.x - 30;
            this.oVisualTimer.oBackground.y = this.oActor.oSprite.y;
        }
    }   
    attack(path: IPath): void {
        if (this.sAttackType == 'melee') {
            this.meleeAttack(path);
        } else {
            this.rangeAttack(path);
        }
    }   
    meleeAttack(path: IPath): void {
        if (!this.oActor) { return; }
        if (this.bReloading) { return; }  
        
        let newScale: number;
        let obj1: IPosition, obj2: IPosition;
        let angle: number;
        let x: number, y:number;  
     
        if (path.worldX <= this.oActor.oSprite.x) {
            newScale = this.oActor.nScale;
        } else {
            newScale = -this.oActor.nScale;
        }  
      
        if (!Helpers.pointInCircle(
            path.worldX, path.worldY, 
            this.oRangeObject.x, 
            this.oRangeObject.y, 
            this.oRangeObject.range / 2)
        ) {
            obj1 = {x: path.worldX, y: path.worldY};
            obj2 = {x: this.oRangeObject.x, y: this.oRangeObject.y};
            angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);

            x = obj2.x - (this.oRangeObject.range / 2) * Math.cos(-angle * Math.PI / 180);
            y = obj2.y + (this.oRangeObject.range / 2) * Math.sin(-angle * Math.PI / 180);      
        } else {
            x = path.worldX;
            y = path.worldY;
        }  
      
        this.oActor.oSprite.scaleX = newScale;    
        this.oActor.oSprite.anims.play("attack");
        this.fEffect.call(this.oGameScene.oEffectsManager, x, y);
    }

    rangeAttack(path: IPath): void {
        if (!this.oActor) { return; }
        if (this.bReloading) { return; }  
      
        let obj1: IPosition, obj2: IPosition;
        let angle: number;
        let x: number, y: number;
        let startPoint: IPoint, targetPoint: IPoint;
        let dx: number, dy: number;
        let diagonalDist: number;
        let newPath : IPoint[] = [];  

        obj1 = {x: path.worldX, y: path.worldY};
        obj2 = {x: this.oRangeObject.x, y: this.oRangeObject.y};
        angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);   

        if (!Helpers.pointInCircle(
            path.worldX, path.worldY, 
            this.oRangeObject.x, 
            this.oRangeObject.y, 
            this.oRangeObject.range)
        ) {
            x = obj2.x - (this.oRangeObject.range) * Math.cos(-angle * Math.PI / 180);
            y = obj2.y + (this.oRangeObject.range) * Math.sin(-angle * Math.PI / 180);      
        } else {
            x = path.worldX;
            y = path.worldY;
        }  
        
        startPoint = {
            x: this.oActor.getPosition().x,
            y: this.oActor.getPosition().y
        };    
      
        targetPoint = this.oGameScene.getPosition({
            x: x, 
            y: y
        });

        dx = Math.abs(targetPoint.x - startPoint.x);
        dy = Math.abs(targetPoint.y - startPoint.y);
        diagonalDist = Math.max(dx, dy);  
      
        let point: IPoint; 
        let t: number;
        const checkingPoint = {} as IPoint;

        for (let step = 0; step <= diagonalDist; step++) {
            t = diagonalDist == 0 ? 0.0 : step / diagonalDist;
            point = Helpers.lerpPoint(startPoint, targetPoint, t); 

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
        this.oActor.oSprite.anims.play("attack");

        const projectile : Phaser.GameObjects.Sprite = this.oGameScene.oLayers.effects.create(startPoint.x, startPoint.y, "48bitSprites");
        projectile.setFrame(Helpers.oSpriteOffset.normalArrow);
        projectile.angle = angle + 180;   
      
        this.bReloading = true;
        this.oVisualTimer.oSprite.visible = true;
        this.oVisualTimer.start();
        this.createProjectile(coordPath, projectile);
    }   
    
    createProjectile(path: IPoint[], projectile: Phaser.GameObjects.Sprite): void {
        const firstPath: IPoint = path.shift(),
            projectilePos: IPosition = this.oGameScene.getPosition(projectile),
            firstPathPos: IPosition = this.oGameScene.getPosition(firstPath),
            delay: number = 25 * (Math.abs(projectilePos.x - firstPathPos.x) + Math.abs(projectilePos.y - firstPathPos.y));   

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

    switchProperties(value: boolean): void {
        if (this.oLevelText) this.oLevelText.setVisible(value);
        if (this.oStackText) this.oStackText.setVisible(value);
    }
}

export default Item;