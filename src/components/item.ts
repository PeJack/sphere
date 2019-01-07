// import Helpers from '../Helpers';
// import VisualTimer from '../systems/VisualTimer';

// class Item extends Phaser.Sprite {
//   constructor(client, data, pos, actor) {
//     // data[3] - spriteName
//     super(client.game, pos.x, pos.y, data[3]);

//     this.client = client;
//     this.group = this.client.layers.items;
//     this.group.add(this);
    
//     this.data = data;
//     this.id = data[0];
//     this.spriteName = data[3];
//     this.type = "weapon";
//     this.attackType = "range";
//     this.level = data[5];
//     this.stack = 1;
//     this.maxStack = 1;
//     this.width = this.client.tilesize;
//     this.height = this.client.tilesize;

//     this.damage = data[18];
//     this.range =  5 * 100 // data[39];
//     this.rangeObject = this.setRangeObject();
//     this.reloadTime = data[37];    
//     this.effect = this.setEffect();
//     this.reloading = false;

//     this.visualTimer  = new VisualTimer({
//       client: this.client,
//       key: "timer",
//       seconds: this.reloadTime
//     });

//     let self = this;
//     this.visualTimer.onComplete = function () {
//       self.reloading = false;
//     };
//   }

//   setEffect() {
//     switch (this.type) {
//       case "weapon": 
//         if (this.attackType == "melee") {
//           return this.client.effectsManager.strike;
//         }
//     }
//   }

//   setRangeObject() {
//     let rangeObject =  this.client.game.add.graphics(0, 0);
//     rangeObject.range = this.range;
//     rangeObject.lineStyle(2, 0xFF0000, 0.2);
//     rangeObject.drawCircle(0, 0, rangeObject.range);
//     // rangeObject = this.addChild(rangeObject);
//     rangeObject.visible = false;

//     return rangeObject;
//   }

//   update() {
//     if (!this.actor) { return };

//     this.rangeObject.x = this.actor.sprite.x;
//     this.rangeObject.y = this.actor.sprite.y;

//     if (!this.visualTimer.hasFinished) {
//       this.visualTimer.sprite.x = this.actor.sprite.x - 30;
//       this.visualTimer.sprite.y = this.actor.sprite.y;
//       this.visualTimer.background.x = this.actor.sprite.x - 30;
//       this.visualTimer.background.y = this.actor.sprite.y;
//     }
//   }

//   attack(path) {
//     if (this.attackType == 'melee') {
//       this.meleeAttack(path);
//     } else {
//       this.rangeAttack(path);
//     }
//   }

//   meleeAttack(path) {
//     if (!this.actor) { return; }
//     if (this.reloading) { return; }

//     let newScale, obj1, obj2, angle, x, y;

//     if (path.worldX <= this.actor.sprite.x) {
//       newScale = this.actor.scale;
//     } else {
//       newScale = -this.actor.scale;
//     }

//     if (!Helpers.pointInCircle(
//       path.worldX, path.worldY, 
//       this.rangeObject.world.x, 
//       this.rangeObject.world.y, 
//       this.rangeObject.range / 2
//       )
//     ) {
//       obj1 = {x: path.worldX, y: path.worldY};
//       obj2 = {x: this.rangeObject.world.x, y: this.rangeObject.world.y};
//       angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);
      
//       x = obj2.x - (this.rangeObject.range / 2) * Math.cos(-angle * Math.PI / 180);
//       y = obj2.y + (this.rangeObject.range / 2) * Math.sin(-angle * Math.PI / 180);      
//     } else {
//       x = path.worldX;
//       y = path.worldY;
//     }

//     this.actor.sprite.scale.x = newScale;

//     this.actor.sprite.animations.play("attack", 10, false);
//     this.effect.call(this.client.effectsManager, x, y);
//   }

//   rangeAttack(path) {
//     if (!this.actor) { return; }
//     if (this.reloading) { return; }

//     let obj1, obj2, angle, x, y, startPoint, targetPoint, dx, dy, diagonalDist;
//     let newPath = [];

//     obj1 = {x: path.worldX, y: path.worldY};
//     obj2 = {x: this.rangeObject.world.x, y: this.rangeObject.world.y};
//     angle = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);

//     if (!Helpers.pointInCircle(
//       path.worldX, path.worldY, 
//       this.rangeObject.world.x, 
//       this.rangeObject.world.y, 
//       this.rangeObject.range / 2
//       )
//     ) {
//       x = obj2.x - (this.rangeObject.range / 2) * Math.cos(-angle * Math.PI / 180);
//       y = obj2.y + (this.rangeObject.range / 2) * Math.sin(-angle * Math.PI / 180);      
//     } else {
//       x = path.worldX;
//       y = path.worldY;
//     }

//     startPoint = {
//       x: this.actor.getPosition().x,
//       y: this.actor.getPosition().y
//     };

//     targetPoint = this.client.getPosition({
//       x: x, 
//       y: y
//     });

//     dx = Math.abs(targetPoint.x - startPoint.x);
//     dy = Math.abs(targetPoint.y - startPoint.y);
//     diagonalDist = Math.max(dx, dy);

//     let point, t, checkingPoint;
//     for (let step = 0; step <= diagonalDist; step++) {
//       t = diagonalDist == 0 ? 0.0 : step / diagonalDist;
//       point = Helpers.lerpPoint(startPoint, targetPoint, t);
//       checkingPoint = {};
//       checkingPoint.x = point.x;
//       checkingPoint.y = point.y;

//       if (!this.client.mapsManager.canGo(checkingPoint)) {
//         break;
//       } else {
//         newPath.push(point)
//       }
//     }

//     newPath = newPath.map(function(np) {
//       return this.client.posToCoord(np);
//     }, this);

//     if (!newPath.length) {
//       return;
//     } else if (newPath.length == 1) {
//       startPoint = newPath[0];      
//     } else {
//       startPoint = newPath.shift();
//     };

//     this.actor.sprite.animations.play("attack", 10, false);
    
//     let projectile = this.client.layers.effects.create(startPoint.x, startPoint.y, "48bitSprites");
//     projectile.frame = Helpers.spriteOffset.normalArrow;
//     projectile.anchor.setTo(0.5, 0.5);
//     projectile.angle = angle + 180;

//     this.reloading = true;
//     this.visualTimer.sprite.visible = true;
//     this.visualTimer.start();
    
//     this.createProjectile(newPath, projectile);
//   }

//   createProjectile(path, projectile) {
//     let firstPath = path.shift(),
//         projectilePos = this.client.getPosition(projectile),
//         firstPathPos = this.client.getPosition(firstPath),
//         delay = 25 * (Math.abs(projectilePos.x - firstPathPos.x) + Math.abs(projectilePos.y - firstPathPos.y)),
//         lastPos;

//     let missleTween = this.client.game.add.tween(projectile);
//     missleTween.to({
//       x: firstPath.x, y: firstPath.y
//     }, delay, Phaser.Easing.Linear.None, true).start();

//     if (path.length != 0) {
//       missleTween.onComplete.addOnce(function() {
//         this.createProjectile(path, projectile);
//       }, this)
//     } else {
//       missleTween.onComplete.addOnce(function() {
//         projectile.destroy();
//       }, this)
//     }
//   }
// }

// export default Item;