import Actor from './actor';
import Helpers from '../Helpers';
import VisualTimer from '../systems/VisualTimer';
import { GameScene } from '../scenes/game-scene';



class Item extends Phaser.GameObjects.Sprite {
  private oGameScene    : GameScene;
  private oActor        : Actor;
  private oGroup        : Phaser.GameObjects.Group;
  private oRangeObject  : Phaser.GameObjects.Graphics;
  private oVisualTimer  : VisualTimer;
  private bReloading    : boolean;
  private sSpriteName   : string;
  private sType         : string;
  private sAttackType   : string;
  private nId           : number;
  private nStack        : number;
  private nMaxStack     : number;
  private nRange        : number;
  private nReloadTime   : number;
  private nDamage       : number;

  constructor(gameScene : GameScene, data, pos, actor : Actor) {
    // data[3] - spriteName
    super(gameScene, pos.x, pos.y, data[3]);

    this.oGameScene = gameScene;
    this.oGroup     = this.oGameScene.oLayers.items;
    this.oGroup.add(this);
    
    this.oActor       = actor;
    this.data         = data;
    this.nId          = data[0];
    this.sSpriteName  = data[3];
    this.sType        = "weapon";
    this.sAttackType  = "range";
    this.level        = data[5];
    this.nStack       = 1;
    this.nMaxStack    = 1;
    this.width = this.oGameScene.nTileSize;
    this.height = this.oGameScene.nTileSize;

    this.nDamage      = data[18];
    this.nRange       =  5 * 100 // data[39];
    this.oRangeObject = this.setRangeObject();
    this.nReloadTime  = data[37];    
    this.effect       = this.setEffect();
    this.bReloading   = false;

    this.oVisualTimer  = new VisualTimer({
      gameScene: this.oGameScene,
      key: "timer",
      seconds: this.nReloadTime
    });

    let self = this;
    this.oVisualTimer.fOnComplete = function () {
      self.bReloading = false;
    };
  }

  setEffect() {
    switch (this.sType) {
      case "weapon": 
        if (this.sAttackType == "melee") {
          return this.oGameScene.effectsManager.strike;
        }
    }
  }

  private setRangeObject(): Phaser.GameObjects.Graphics {
    let rangeObject = this.oGameScene.add.graphics({x: 0, y: 0});
    // rangeObject.set = this.nRange;
    rangeObject.lineStyle(2, 0xFF0000, 0.2);
    rangeObject.strokeCircle(0, 0, this.nRange);
    // rangeObject = this.addChild(rangeObject);
    rangeObject.visible = false;

    return rangeObject;
  }

  update() {
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

  attack(path) {
    if (this.sAttackType == 'melee') {
      this.meleeAttack(path);
    } else {
      this.rangeAttack(path);
    }
  }

  meleeAttack(path) {
    if (!this.oActor) { return; }
    if (this.bReloading) { return; }

    let newScale, obj1, obj2, angle, x, y;

    if (path.worldX <= this.oActor.oSprite.x) {
      newScale = this.oActor.nScale;
    } else {
      newScale = -this.oActor.nScale;
    }

    if (!Helpers.pointInCircle(
      path.worldX, path.worldY, 
      this.oRangeObject.x, 
      this.oRangeObject.y, 
      this.oRangeObject.range / 2
      )
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

    this.oActor.oSprite.animations.play("attack", 10, false);
    this.effect.call(this.oGameScene.effectsManager, x, y);
  }

  rangeAttack(path) {
    if (!this.oActor) { return; }
    if (this.bReloading) { return; }

    let obj1, obj2, angle, x, y, startPoint, targetPoint, dx, dy, diagonalDist;
    let newPath = [];

    obj1 = {x: path.worldX, y: path.worldY};
    obj2 = {x: this.oRangeObject.x, y: this.oRangeObject.y};
    angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);

    if (!Helpers.pointInCircle(
      path.worldX, path.worldY, 
      this.oRangeObject.x, 
      this.oRangeObject.y, 
      this.oRangeObject.range / 2
      )
    ) {
      x = obj2.x - (this.oRangeObject.range / 2) * Math.cos(-angle * Math.PI / 180);
      y = obj2.y + (this.oRangeObject.range / 2) * Math.sin(-angle * Math.PI / 180);      
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

    let point, t, checkingPoint;
    for (let step = 0; step <= diagonalDist; step++) {
      t = diagonalDist == 0 ? 0.0 : step / diagonalDist;
      point = Helpers.lerpPoint(startPoint, targetPoint, t);
      checkingPoint = {};
      checkingPoint.x = point.x;
      checkingPoint.y = point.y;

      if (!this.oGameScene.mapsManager.canGo(checkingPoint)) {
        break;
      } else {
        newPath.push(point)
      }
    }

    newPath = newPath.map(function(np) {
      return this.oGameScene.posToCoord(np);
    }, this);

    if (!newPath.length) {
      return;
    } else if (newPath.length == 1) {
      startPoint = newPath[0];      
    } else {
      startPoint = newPath.shift();
    };

    this.oActor.sprite.animations.play("attack", 10, false);
    
    let projectile = this.oGameScene.oLayers.effects.create(startPoint.x, startPoint.y, "48bitSprites");
    projectile.frame = Helpers.spriteOffset.normalArrow;
    projectile.anchor.setTo(0.5, 0.5);
    projectile.angle = angle + 180;

    this.bReloading = true;
    this.oVisualTimer.oSprite.visible = true;
    this.oVisualTimer.start();
    
    this.createProjectile(newPath, projectile);
  }

  createProjectile(path, projectile) {
    let firstPath = path.shift(),
        projectilePos = this.oGameScene.getPosition(projectile),
        firstPathPos = this.oGameScene.getPosition(firstPath),
        delay = 25 * (Math.abs(projectilePos.x - firstPathPos.x) + Math.abs(projectilePos.y - firstPathPos.y)),
        lastPos;

    let missleTween = this.oGameScene.add.tween(projectile);
    missleTween.to({
      x: firstPath.x, y: firstPath.y
    }, delay, Phaser.Easing.Linear.None, true).start();

    if (path.length != 0) {
      missleTween.onComplete.addOnce(function() {
        this.createProjectile(path, projectile);
      }, this)
    } else {
      missleTween.onComplete.addOnce(function() {
        projectile.destroy();
      }, this)
    }
  }
}

export default Item;