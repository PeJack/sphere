import Helpers from '../helpers';
import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import Item from './item';


//@ts-ignore
interface IInventoryContainer extends Phaser.GameObjects.Container {
    slots?      : IIinvetorySprite[],
    items?      : IIinvetorySprite[]
}

interface IIinvetorySprite extends Phaser.GameObjects.Sprite {
    decor?      : Phaser.GameObjects.Sprite,
    special?    : boolean,
    item?       : Item,
    slots?      : IIinvetorySprite[],
    items?      : Item[]
}

export default class Inventory {
    private oGameScene              : GameScene;
    private oActor                  : Actor;
    private oGroup                  : Phaser.GameObjects.Group;
    private oActiveItem             : Phaser.GameObjects.Group;
    private aPending                : Item[];
    private aItems                  : Item[];
    private nSlots                  : number;
    private nPadding                : number;
    private nIconSize               : number;
    private nCols                   : number;
    private nWidth                  : number;
    private nHeight                 : number;
    private oHeader                 : IIinvetorySprite;
    private oBackground             : IIinvetorySprite;
    private oFakeBg                 : IIinvetorySprite;
    private oInventoryContainer     : Phaser.GameObjects.Container;
    private oBackgroundContainer    : Phaser.GameObjects.Container;        

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
    

    this.oInventoryContainer    = this.oGameScene.add.container(window.innerWidth - (this.nWidth + 90) / 2, 30);
    this.oInventoryContainer.setScrollFactor(0, 0);

    this.oHeader = this.oGroup.create(0, 0, "inventory", "1.png");
    // this.oHeader.displayWidth = this.nWidth + 60;
    
    // FixedToCamera
    this.oHeader.setScrollFactor(0, 0);

    this.oBackgroundContainer = this.oGameScene.add.container(this.oHeader.x + 18, this.oHeader.y + 30);
    this.oBackground = this.oGroup.create(0, 0);
    // this.oBackground.displayWidth = this.nWidth + 40;
    // this.oBackground.displayHeight = this.nHeight + 15;
    this.oBackgroundContainer.setScrollFactor(0, 0);    
    this.oBackground.setScrollFactor(0, 0);
    this.oBackground.slots = [];
    this.oBackground.items = [];
    this.oBackground.setVisible(false);
    this.oBackgroundContainer.add(this.oBackground);

    this.oFakeBg = this.oGroup.create(this.oHeader.x + 2, this.oHeader.y + 75, "inventory", 0);
    this.oFakeBg.displayHeight = this.nHeight + 10;
    this.oFakeBg.setScrollFactor(0, 0);

    this.oInventoryContainer.add(this.oHeader);
    this.oInventoryContainer.add(this.oBackgroundContainer);
    this.oInventoryContainer.add(this.oFakeBg);
    this.oInventoryContainer.bringToTop(this.oBackgroundContainer);

    this.oInventoryContainer.setInteractive(new Phaser.Geom.Rectangle(this.oHeader.x - this.nWidth / 2, -9, this.nWidth, 18), Phaser.Geom.Rectangle.Contains);
    this.oGameScene.input.setDraggable(this.oInventoryContainer);

    this.oInventoryContainer.on("drag", (pointer: any, dragX: number, dragY: number) => {
        this.oInventoryContainer.setPosition(dragX, dragY);

    }, this);


    let count = 0;
    const decorGraphics  = this.oGameScene.textures.createCanvas("decorGraphics", this.nIconSize, this.nIconSize);
    decorGraphics.context.fillStyle = 'rgba(68, 131, 65, 1)';
    decorGraphics.context.fillRect(0, 0, this.nIconSize, this.nIconSize);

    let decor: IIinvetorySprite, slot: IIinvetorySprite, ic_hand: IIinvetorySprite;
    for (let y = this.nPadding + 5; y < this.nHeight; y += this.nIconSize + this.nPadding) {
        for (let x = this.nPadding; x < this.nWidth; x += this.nIconSize + this.nPadding) {
            if (count < this.nSlots) {
                if (count < 5) {
                    const index = count + 3 == 6 ? 5 : count + 3 > 6 ? count + 2 : count + 3;

                    decor = this.oGameScene.add.sprite(x - this.nWidth / 2, y, "inventory", index + ".png");
                    decor.alpha = 0.1;
                    decor.displayWidth = this.nIconSize;
                    decor.displayHeight = this.nIconSize - 3;

                    this.oBackgroundContainer.add(decor);
                } else {            
                    const decorContainer: Phaser.GameObjects.Container = this.oGameScene.add.container(0, 0);
                    decor = this.oGameScene.add.sprite(x - this.nWidth / 2, y, "decorGraphics");
                    ic_hand = this.oGameScene.add.sprite(3, 3, "ic_hand");
                    decorContainer.add(decor);
                    decorContainer.add(ic_hand);

                    ic_hand.visible = false;

                    this.oBackgroundContainer.add(decorContainer);
                }

                const i = count < 5 ? 15 : 16;
                slot = this.oGameScene.add.sprite(x - this.nWidth / 2, y, "inventory", i + ".png");
                
                slot.displayWidth = this.nIconSize;
                slot.displayHeight = this.nIconSize;
                slot.special = count < 5;
                slot.decor = decor;
                slot.tint = 0x736861;

                this.oBackgroundContainer.add(slot);
                this.oBackground.slots.push(slot);

                count += 1;
            }
        }
    }

    const text = this.oGameScene.add.text(-this.nWidth / 2 + 10, -4, "Инвентарь", {font: '14px Courier New', fill: '#ffffff'});
    this.oInventoryContainer.add(text);

    const self = this;
    this.oGameScene.input.keyboard.on("keydown", function(e: KeyboardEvent) {
        if (e.keyCode == 73) {
            self.open()
        }
    });
  }

    update() {
        while (this.aPending.length > 0) {
            this.processItem(this.aPending.shift());
        }
    }

    open(): void {
        this.oBackgroundContainer.visible = !this.oBackgroundContainer.visible;
        this.oFakeBg.visible = !this.oFakeBg.visible;
        // this.oInventoryContainer.visible = !this.oInventoryContainer.visible
    }

    addItem(item: Item): void {
        this.aPending.push(item);
    }

    processItem(item: Item): void {
        let stackSlot = this.findSlotWithSameItem(item);
        this.oGameScene.oLayers.items.remove(item);
        delete this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y];
    
        item.alpha = 1;

        // if (!Helpers.find(item.children, "title", "levelText") && item.nLevel) {
        //     let levelText = this.oGameScene.add.text(0, 0, Helpers.romanize(item.nLevel), {font: '8px Courier New', fill: '#ffffff'});
        //     levelText.text = "levelText";
        //     item.addChild(levelText);
   
        //     levelText.y = item.getBounds().height - 10;      
        // }

        if (item.nMaxStack && stackSlot) {
            if ((stackSlot.item.nStack + item.nStack) > stackSlot.item.nMaxStack) {
                let diff = (stackSlot.item.nStack + item.nStack) - stackSlot.item.nMaxStack;
                stackSlot.item.nStack += (item.nStack - diff);
                item.nStack -= diff;
                item.bProcessAgain = true;
            } else {
                stackSlot.item.nStack += item.nStack;
            }

            // обновление текста стака или его создание
            // if (Helpers.find(stackSlot.item.children, "title", "stackText")) {
            //     let stackText = Helpers.find(stackSlot.item.children, "title", "stackText");
            //     stackText.setText(stackSlot.item.stack);
            //     stackText.x = stackSlot.item.getLocalBounds().width - stackText.width - 5; 
            //     stackText.y = 3;
            // } else {
            //     let stackText = this.oGameScene.add.text(0, 0, stackSlot.item.stack, {font: '9px Courier New', fill: '#ffffff'});
            //     stackText.text = "stackText";
            //     stackSlot.item.addChild(stackText); 
            //     stackText.x = stackSlot.item.getLocalBounds().width - stackText.width - 5;  
            //     stackText.y = 3;     
            // }

            if (item.bProcessAgain) {
                return this.processItem(item);
            }

            item.destroy();
            this.oGroup.remove(item)
            // removeChild(item);
        } else {
            let emptySlot = this.findFirstEmptySlot();

            if (emptySlot) {
                item.x = emptySlot.x;
                item.y = emptySlot.y;
                item.width = this.nIconSize;
                item.height = this.nIconSize;

                item.setInteractive();
                this.oGameScene.input.setDraggable(item);

                this.oBackgroundContainer.add(item);
                emptySlot.item = item;
                item.oSlot = emptySlot;
                item.oActor = this.oActor;

                // if (Helpers.find(emptySlot.item.children, "title", "stackText")) {
                //   let stackText = Helpers.find(emptySlot.item.children, "title", "stackText");
                //   stackText.setText(emptySlot.item.stack);
                //   stackText.x = emptySlot.item.getLocalBounds().width - stackText.width - 5;
                //   stackText.y = 3; 
                // }

                this.aItems.push(item);

                // let heldItemSlot;

                // item.events.onDragStart.add(function (heldItem, pointer) {
                //     this.oBackground.removeChild(heldItem);
                //     this.oBackground.addChild(heldItem);

                //     heldItemSlot = heldItem.slot;
                // }, this);

                // item.events.onDragStop.add(function (heldItem, pointer) {
                //     let closestSlot = this.findClosestSlotTo(heldItem);

                //     if (closestSlot) {
                //         // ближайший слот содержит предмет
                //         if (closestSlot.item != undefined) {
                //             let closestItem = closestSlot.item;

                //             // поменять предметы местами
                //             closestItem.x = heldItemSlot.x;
                //             closestItem.y = heldItemSlot.y;

                //             closestItem.slot = heldItemSlot;
                //             heldItem.slot = closestSlot;

                //             closestSlot.item = heldItem;
                //             heldItemSlot.item = closestItem;
                //         } else { // если слот пустой
                //             heldItem.slot = closestSlot;
                //             closestSlot.item = heldItem;

                //             heldItemSlot.item = null;

                //         }
                  
                //         // переместить предмет в ближайший слот
                //         heldItem.x = closestSlot.x;
                //         heldItem.y = closestSlot.y;

                //     } else { // выбросить предмет
                //         item.slot.item = undefined;
                //         this.oBackground.removeChild(item);
                //         this.aItems.splice(this.aItems.indexOf(item), 1);
                    
                //         // вернуть предмет обратно в мир
                //         item.width = this.oGameScene.tilesize;
                //         item.height = this.oGameScene.tilesize;
                    
                //         item.x = this.oActor.sprite.x;
                //         item.y = this.oActor.sprite.y;
                //         item.lastPos.x = this.oActor.position.x;
                //         item.lastPos.y = this.oActor.position.y;
                    
                //         item.events.destroy();
                    
                //         this.oGameScene.layers.items.add(item);
                //         this.oGameScene.itemsMap[item.lastPos.x + "." + item.lastPos.y] = item;            
                //     }
                // }, this);

                // item.events.onInputDown.add(function (item, pointer) {
                //     if (pointer.rightButton.isDown) {
                //         if (item.stack > 1) {
                //             item.stack -= 1;
                //             Helpers.find(item.children, "title", "stackText").setText(item.stack);
                //             this.oGameScene.itemsManager.create(item.id, this.oActor.sprite, null);
                //         } else {
                //             item.kill();
                //             item.slot.item = undefined;
                //             this.oBackground.removeChild(item);
                //             this.aItems.splice(this.aItems.indexOf(item), 1);
                //             this.oGameScene.itemsManager.create(item.id, this.oActor.sprite, null);              
                //         }
                //     }
                  
                //     if (pointer.leftButton.isDown) {
                //         if (this.oActiveItem && this.oActiveItem.reloading) { return };

                //         item.slot.decor.visible = !item.slot.decor.visible;
                    
                //         if (item.slot.decor.visible) {
                //             if (this.oActiveItem) {
                //                 this.oActiveItem.rangeObject.visible = false;
                //                 this.oActiveItem.slot.decor.visible = false;
                //             }

                //             item.slot.tint = 0x304876;
                //             this.oActiveItem = item;
                //             this.oActor.weapon = item;
                //             this.oActor.weapon.rangeObject.visible = true;
                //         } else {
                //             this.oActiveItem = undefined;
                            
                //             this.oActor.weapon.rangeObject.visible = false;
                //             this.oActor.weapon = undefined;
                //         }
                //     }
                // }, this);
            }
        }
    }

    findSlotWithSameItem(item: Item) {
        for(let i = 0; i < this.oBackground.slots.length; i++) {
            let slot = this.oBackground.slots[i];

            if(slot.item) {
                if(slot.item.nId == item.nId && slot.item.nStack < slot.item.nMaxStack)
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
