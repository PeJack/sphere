import Helpers from '../helpers';
import { GameScene } from '../scenes/gameScene';
import Actor from './actor';


export default class Inventory {
    private oGameScene  : GameScene;
    private oActor      : Actor;
    private oGroup      : Phaser.GameObjects.Group;
    private oActiveItem : Phaser.GameObjects.Group;
    private aPending    : Array<Phaser.GameObjects.Group>;
    private aItems      : Array<Phaser.GameObjects.Group>;
    private nSlots      : number;
    private nPadding    : number;
    private nIconSize   : number;
    private nCols       : number;
    private nWidth      : number;
    private nHeight     : number;
    private oHeader     : any;
    private oBackground : any;
    private oFakeBg     : any;

  constructor(gameScene : GameScene, actor : Actor) {
    this.oGameScene = gameScene;
    this.oActor     = actor;
    this.oGroup     = this.oGameScene.oLayers.hud;
    
    this.aPending = [];
    this.aItems   = [];
    this.nSlots   = 15;

    this.nPadding   = 2;
    this.nIconSize  = 35;
    this.nCols      = 5;

    this.oActiveItem = null;
    
    this.nWidth = 
      (this.nIconSize * this.nCols) + 
      (this.nPadding * this.nCols) + 
      this.nPadding;
    
    this.nHeight =
      (this.nIconSize * 
      Math.ceil(this.nSlots / this.nCols)) +
      this.nPadding *
      Math.ceil(this.nSlots / this.nCols) +
      this.nPadding;
    
    this.oHeader = this.oGroup.create(window.screen.width - (this.nWidth + 90), 30, "inventory", 1);
    this.oHeader.width = this.nWidth + 90;
    this.oHeader.fixedToCamera = true;
    this.oHeader.inputEnabled = true;
    this.oHeader.input.enableDrag();
    this.oHeader.input.useHandCursor = true;

    let bgGraphics  = this.oGameScene.make.bitmapData(this.nWidth, this.nHeight);
    this.oBackground = this.oGroup.create(this.oHeader.x + 18, this.oHeader.y + 30, bgGraphics);
    this.oBackground.width = this.nWidth + 50;
    this.oBackground.height = this.nHeight + 15;  

    this.oBackground.fixedToCamera = true;
    this.oBackground.slots = [];
    this.oBackground.items = [];

    this.oFakeBg = this.oGroup.create(this.oHeader.x - 4, this.oHeader.y + 30, "inventory", 0);
    this.oFakeBg.width = this.nWidth + 100;
    this.oFakeBg.height = this.nHeight + 35;
    this.oFakeBg.fixedToCamera = true;

    this.oBackground.bringToTop();

    this.oHeader.events.onDragUpdate.add(function(sprite, pointer, dragX, dragY) {
      this.oBackground.cameraOffset.setTo(sprite.cameraOffset.x + 18, sprite.cameraOffset.y + 30);
      this.oFakeBg.cameraOffset.setTo(sprite.cameraOffset.x - 4, sprite.cameraOffset.y + 30);
    }, this);


    let count = 0, decor, slot;
    for (let y = this.nPadding + 5; y < this.nHeight; y += this.nIconSize + this.nPadding) {
      for (let x = this.nPadding; x < this.nWidth; x += this.nIconSize + this.nPadding) {
        if (count < this.nSlots) {
          if (count < 5) {
            let index = count + 3 == 6 ? 5 : count + 3 > 6 ? count + 2 : count  + 3;
            decor = this.oGameScene.add.sprite(x, y + 2, "inventory", index);
            decor.alpha = 0.1;
            decor.width = this.nIconSize;
            decor.height = this.nIconSize - 3;
            this.oBackground.addChild(decor);
          } else {
            let decorGraphics  = this.oGameScene.make.bitmapData(this.nIconSize, this.nIconSize);
            decorGraphics.ctx.fillStyle = 'rgba(68, 131, 65, 1)';
            decorGraphics.ctx.fillRect(0, 0, this.nIconSize, this.nIconSize);
            decor = this.oGameScene.add.sprite(x, y, decorGraphics);
            decor.addChild(this.oGameScene.add.sprite(3, 3, "ic_hand"));

            decor.visible = false;
            this.oBackground.addChild(decor);
          }
          slot = this.oGameScene.add.sprite(x, y, "inventory", count < 5 ? 15 : 16);
 
          slot.width = this.nIconSize;
          slot.height = this.nIconSize;
          slot.special = count < 5;
          slot.decor = decor;
          slot.tint = 0x736861;

          this.oBackground.addChild(slot);
          this.oBackground.slots.push(slot);

          count += 1;
        }
      }
    }

    let text = this.oGameScene.add.text(this.nPadding + 20, this.nPadding + 10, "Инвентарь", {font: '14px Courier New', fill: '#ffffff'});
    this.oHeader.addChild(text);

    let self = this;
    this.oGameScene.input.keyboard.onDownCallback = function(e) {
      if (e.keyCode == 73) { // 73 = I
        self.open();
      }
    }
  }

  update() {
    while (this.aPending.length > 0) {
      this.processItem(this.aPending.shift());
    }
  }

  open() {
    // this.header.visible = !this.header.visible;
    this.oBackground.visible = !this.oBackground.visible;
    this.oFakeBg.visible = !this.oFakeBg.visible;
  }

  addItem(item) {
    this.aPending.push(item);
  }

  processItem(item) {
    let stackSlot = this.findSlotWithSameItem(item);
    this.oGameScene.oLayers.items.remove(item);
    delete this.oGameScene.oItemsMap[item.lastPos.x + "." + item.lastPos.y];
    
    item.alpha = 1;

    if (!Helpers.find(item.children, "title", "levelText") && item.level) {
      let levelText = this.oGameScene.add.text(0, 0, Helpers.romanize(item.level), {font: '8px Courier New', fill: '#ffffff'});
      levelText.text = "levelText";
      item.addChild(levelText);
      levelText.y = item.getLocalBounds().height - 10;      
    }

    if (item.maxStack && stackSlot) {
      if ((stackSlot.item.stack + item.stack) > stackSlot.item.maxStack) {
        let diff = (stackSlot.item.stack + item.stack) - stackSlot.item.maxStack;
        stackSlot.item.stack += (item.stack - diff);
        item.stack -= diff;
        item.processAgain = true;
      } else {
        stackSlot.item.stack += item.stack;
      }

      // обновление текста стака или его создание
      if (Helpers.find(stackSlot.item.children, "title", "stackText")) {
        let stackText = Helpers.find(stackSlot.item.children, "title", "stackText");
        stackText.setText(stackSlot.item.stack);
        stackText.x = stackSlot.item.getLocalBounds().width - stackText.width - 5; 
        stackText.y = 3;
      } else {
        let stackText = this.oGameScene.add.text(0, 0, stackSlot.item.stack, {font: '9px Courier New', fill: '#ffffff'});
        stackText.text = "stackText";
        stackSlot.item.addChild(stackText); 
        stackText.x = stackSlot.item.getLocalBounds().width - stackText.width - 5;  
        stackText.y = 3;     
      }

      if (item.processAgain) {
        return this.processItem(item);
      }

      item.kill();
      this.oGroup.remove(item)
      // removeChild(item);
    } else {
      let emptySlot = this.findFirstEmptySlot();

      if (emptySlot) {
        item.x = emptySlot.x;
        item.y = emptySlot.y;
        item.width = this.nIconSize;
        item.height = this.nIconSize;
        item.inputEnabled = true;
        item.input.enableDrag();
        item.input.useHandCursor = true;

        this.oBackground.addChild(item);
        emptySlot.item = item;
        item.slot = emptySlot;
        item.actor = this.oActor;

        if (Helpers.find(emptySlot.item.children, "title", "stackText")) {
          let stackText = Helpers.find(emptySlot.item.children, "title", "stackText");
          stackText.setText(emptySlot.item.stack);
          stackText.x = emptySlot.item.getLocalBounds().width - stackText.width - 5;
          stackText.y = 3; 
        }

        this.aItems.push(item);

        let heldItemSlot;

        item.events.onDragStart.add(function (heldItem, pointer) {
          this.oBackground.removeChild(heldItem);
          this.oBackground.addChild(heldItem);

          heldItemSlot = heldItem.slot;
        }, this);

        item.events.onDragStop.add(function (heldItem, pointer) {
          let closestSlot = this.findClosestSlotTo(heldItem);

          if (closestSlot) {
            // ближайший слот содержит предмет
            if (closestSlot.item != undefined) {

              let closestItem = closestSlot.item;

              // поменять предметы местами
              closestItem.x = heldItemSlot.x;
              closestItem.y = heldItemSlot.y;

              closestItem.slot = heldItemSlot;
              heldItem.slot = closestSlot;

              closestSlot.item = heldItem;
              heldItemSlot.item = closestItem;

            } else { // если слот пустой
              heldItem.slot = closestSlot;
              closestSlot.item = heldItem;

              heldItemSlot.item = null;

            }

            // переместить предмет в ближайший слот
            heldItem.x = closestSlot.x;
            heldItem.y = closestSlot.y;
            
          } else { // выбросить предмет
            item.slot.item = undefined;
            this.oBackground.removeChild(item);
            this.aItems.splice(this.aItems.indexOf(item), 1);
            
            // вернуть предмет обратно в мир
            item.width = this.oGameScene.tilesize;
            item.height = this.oGameScene.tilesize;

            item.x = this.oActor.sprite.x;
            item.y = this.oActor.sprite.y;
            item.lastPos.x = this.oActor.position.x;
            item.lastPos.y = this.oActor.position.y;

            item.events.destroy();

            this.oGameScene.layers.items.add(item);
            this.oGameScene.itemsMap[item.lastPos.x + "." + item.lastPos.y] = item;            
          }
        }, this);

        item.events.onInputDown.add(function (item, pointer) {
          if (pointer.rightButton.isDown) {
            if (item.stack > 1) {
              item.stack -= 1;
              Helpers.find(item.children, "title", "stackText").setText(item.stack);
              this.oGameScene.itemsManager.create(item.id, this.oActor.sprite, null);
            } else {
              item.kill();
              item.slot.item = undefined;
              this.oBackground.removeChild(item);
              this.aItems.splice(this.aItems.indexOf(item), 1);
              this.oGameScene.itemsManager.create(item.id, this.oActor.sprite, null);              
            }
          }

          if (pointer.leftButton.isDown) {
            if (this.oActiveItem && this.oActiveItem.reloading) { return };
             
            item.slot.decor.visible = !item.slot.decor.visible;

            if (item.slot.decor.visible) {
              if (this.oActiveItem) {
                this.oActiveItem.rangeObject.visible = false;
                this.oActiveItem.slot.decor.visible = false;
              }
              
              item.slot.tint = 0x304876;
              this.oActiveItem = item;
              this.oActor.weapon = item;
              this.oActor.weapon.rangeObject.visible = true;
            } else {
              this.oActiveItem = undefined;

              this.oActor.weapon.rangeObject.visible = false;
              this.oActor.weapon = undefined;
            }
          }
        }, this);
      }
    }
  }

  findSlotWithSameItem(item) {
    for(let i = 0; i < this.oBackground.slots.length; i++) {
      let slot = this.oBackground.slots[i];

      if(slot.item) {
        if(slot.item.id == item.id
        && slot.item.stack < slot.item.maxStack)
            return slot;
      }
    }
    return false;
  }

  findFirstEmptySlot() {
    for(var i = 0; i < this.oBackground.slots.length; i++) {
      let slot = this.oBackground.slots[i];
      if(slot.item == undefined && !slot.special) {
        return slot;
      }
    }
    return false;
  }

  findClosestSlotTo(sprite) {
    let closestSlot, dist;
    let lastDist = 50; 

    this.oBackground.slots.forEach(function(slot) {
      dist = this.oGameScene.game.math.distance(slot.x, slot.y, sprite.x, sprite.y);
      
      if(dist < lastDist) {
        lastDist = dist;
        closestSlot = slot;
      }
    }, this);

    return closestSlot;
  }
}
