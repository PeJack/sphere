import Helpers from '../helpers';
import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import Item from './item';

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
    private oActiveItem             : Item;
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
    
    this.aPending   = [];
    this.aItems     = [];
    this.nSlots     = 15;

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
    

    this.oInventoryContainer = this.oGameScene.add.container(window.innerWidth - (this.nWidth + 90) / 2, 30);
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
    const decorGraphics  = this.oGameScene.make.graphics({x: 0, y: 0, add: false});
    decorGraphics.fillStyle(0x448341, 1);
    decorGraphics.fillRect(0, 0, this.nIconSize, this.nIconSize);
    decorGraphics.generateTexture("decorGraphics", this.nIconSize, this.nIconSize);

    let decor: IIinvetorySprite;
    let slot: IIinvetorySprite;
    let decorContainer: Phaser.GameObjects.Container;

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
                    // decorContainer.add(this.oGameScene.add.sprite(x - this.nWidth / 2 - 8, y - 8, "ic_hand"));
                    // decorContainer.add(this.oGameScene.add.sprite(x- this.nWidth / 2, y, "decorGraphics"));
                    decor = this.oGameScene.add.sprite(x - this.nWidth / 2 - 8, y - 8, "ic_hand");
                    decor.visible = false;

                    this.oBackgroundContainer.add(decor);
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
    }

    addItem(item: Item): void {
        this.aPending.push(item);
    }

    processItem(item: Item): void {
        const stackSlot = this.findSlotWithSameItem(item);
        let levelText: Phaser.GameObjects.Text;

        this.oGameScene.oLayers.items.remove(item);
        delete this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y];
        
        item.alpha = 1;

        if (item.nMaxStack && stackSlot) {
            if ((stackSlot.item.nStack + item.nStack) > stackSlot.item.nMaxStack) {
                let diff = (stackSlot.item.nStack + item.nStack) - stackSlot.item.nMaxStack;
                stackSlot.item.nStack += (item.nStack - diff);
                item.nStack -= diff;
                item.bProcessAgain = true;
            } else {
                stackSlot.item.nStack += item.nStack;
            }

            // обновление текста стака
            stackSlot.item.oStackText.setText("" + stackSlot.item.nStack);

            if (item.bProcessAgain) {
                return this.processItem(item);
            }

            item.destroy();
            this.oGroup.remove(item)
        } else {
            const emptySlot = this.findFirstEmptySlot();

            if (emptySlot) {
                item.x = emptySlot.x;
                item.y = emptySlot.y;
                item.width = this.nIconSize;
                item.height = this.nIconSize;

                emptySlot.item = item;
                item.oSlot = emptySlot;
                item.oActor = this.oActor;

                this.aItems.push(item);
                this.oBackgroundContainer.add(item);

                if (item.oLevelText) {
                    item.oLevelText.x = (emptySlot.x - emptySlot.width / 2) + 3;
                    item.oLevelText.y = emptySlot.y + 7;
                    this.oBackgroundContainer.add(item.oLevelText);
                }

                if (item.oStackText) {
                    item.oStackText.x = (emptySlot.x + emptySlot.width / 2) - item.oStackText.width - 3;
                    item.oStackText.y = emptySlot.y - 16;                    
                    this.oBackgroundContainer.add(item.oStackText);
                }

                item.switchProperties(true);

                item.setScrollFactor(0, 0);
                item.setInteractive(
                    new Phaser.Geom.Rectangle(0, 0, item.width, item.height), 
                    Phaser.Geom.Rectangle.Contains
                );
                this.oGameScene.input.setDraggable(item);               
                
                item.on("pointerdown", (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Event) => {
                    if (pointer.leftButtonDown) {
                        if (this.oActiveItem && this.oActiveItem.bReloading) { return };
        
                        item.oSlot.decor.visible = !item.oSlot.decor.visible;

                        if (item.oSlot.decor.visible) {
                            if (this.oActiveItem) {
                                this.oActiveItem.oRangeObject.visible = false;
                                this.oActiveItem.oSlot.decor.visible = false;
                            }
        
                            item.oSlot.tint = 0x304876;
                            this.oActiveItem = item;
                            this.oActor.oWeapon = item;
                            this.oActor.oWeapon.oRangeObject.visible = true;
                        } else {
                            this.oActiveItem = undefined;
                            item.oSlot.tint = 0x736861;

                            this.oActor.oWeapon.oRangeObject.visible = false;
                            this.oActor.oWeapon = undefined;
                        }
                    }  
                })
                    
                // let heldItemSlot: IIinvetorySprite;
                // item.on("dragstart", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                //     item.setPosition(pointer.worldX, pointer.worldY);
                //     heldItemSlot = item.oSlot;
                // }, this);

                // item.on("dragend", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number, dropped: boolean) => {
                //     // this.oBackgroundContainer.add(item);
                    
                //     // const closestSlot = this.findClosestSlotTo(item);
                    
                //     // if (closestSlot) {

                //     //     if (closestSlot.item != undefined) {
                //     //         const closestItem = closestSlot.item;

                //     //         closestItem.x = heldItemSlot.x;
                //     //         closestItem.y = heldItemSlot.y;

                //     //         closestItem.slot = heldItemSlot;
                //     //         heldItemSlot  = closestSlot;
                //     //         closestSlot.item = item;
                //     //         heldItemSlot.item = closestItem;                            
                //     //     } else {
    
                //     //         item.oSlot = closestSlot;
                //     //         closestSlot.item = item;

                //     //         heldItemSlot.item = undefined;
                //     //     }
                //     // }

                // }, this);

                // let heldItemSlot;


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
            const slot = this.oBackground.slots[i];

            if(slot.item) {
                if(slot.item.nId == item.nId && slot.item.nStack < slot.item.nMaxStack) {
                    return slot;
                }
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
            if (slot != sprite.slot && !slot.special) {
                dist = Phaser.Math.Distance.Between(slot.x, slot.y, sprite.x, sprite.y);
        
                if(dist < lastDist) {
                    lastDist = dist;
                    closestSlot = slot;
                }
            }
        }, this);

        return closestSlot;
    }
}
