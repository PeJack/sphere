import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import Item from './item';

interface IinvetorySprite extends Phaser.GameObjects.Sprite {
    id?             : number,
    decor?          : Phaser.GameObjects.Sprite,
    decorGraphics?  : Phaser.GameObjects.Sprite,
    special?        : boolean,
    item?           : Item,
    slots?          : IinvetorySprite[],
    items?          : Item[]
}

export default class Inventory {
    public aItems                   : Item[];
    public oBackground              : IinvetorySprite;    

    public nSlots                   : number;
    public nPadding                 : number;
    public nIconSize                : number;
    public nCols                    : number;
    public nWidth                   : number;
    public nHeight                  : number;
    public nInitX                   : number;
    public nInitY                   : number;
    public bHasSpecialSlots         : boolean;
    public sTitle                   : string;

    private oGameScene              : GameScene;
    private oActor                  : Actor;
    private oGroup                  : Phaser.GameObjects.Group;
    private oActiveItem             : Item;
    private aPending                : Item[];

    private oHeader                 : IinvetorySprite;
    private oFakeBg                 : IinvetorySprite;
    private oBaseContainer          : Phaser.GameObjects.Container;
    private oBackgroundContainer    : Phaser.GameObjects.Container;

    constructor(gameScene: GameScene, actor: Actor) {
        this.oGameScene = gameScene;
        this.oActor     = actor;
        this.oGroup     = this.oGameScene.oLayers.hud;
        
        this.aPending   = [];
        this.aItems     = [];

        this.oActiveItem = null;
    }

    create():void {
        this.oBaseContainer = this.oGameScene.add.container(this.nInitX, this.nInitY);
        this.oBaseContainer.setScrollFactor(0, 0);

        this.oHeader = this.oGroup.create(0, 0, "inventory", "1.png");

        // FixedToCamera
        this.oHeader.setScrollFactor(0, 0);

        this.oBackgroundContainer = this.oGameScene.add.container(this.oHeader.x + 18, this.oHeader.y + 30);
        this.oBackground = this.oGroup.create(0, 0);

        this.oBackgroundContainer.setScrollFactor(0, 0);    
        this.oBackground.setScrollFactor(0, 0);
        this.oBackground.slots = [];
        this.oBackground.items = [];
        this.oBackground.setVisible(false);
        this.oBackgroundContainer.add(this.oBackground);

        this.oFakeBg = this.oGroup.create(this.oHeader.x + 2, this.oHeader.y + 75, "inventory", 0);
        this.oFakeBg.displayHeight = this.nHeight + 10;
        this.oFakeBg.setScrollFactor(0, 0);

        this.oBaseContainer.add(this.oHeader);
        this.oBaseContainer.add(this.oBackgroundContainer);
        this.oBaseContainer.add(this.oFakeBg);
        this.oBaseContainer.bringToTop(this.oBackgroundContainer);

        this.oBaseContainer.setInteractive(new Phaser.Geom.Rectangle(this.oHeader.x - this.nWidth / 2, -9, this.nWidth, 18), Phaser.Geom.Rectangle.Contains);
        this.oGameScene.input.setDraggable(this.oBaseContainer);

        this.oBaseContainer.on("drag", (pointer: any, dragX: number, dragY: number) => {
            this.oBaseContainer.setPosition(dragX, dragY);
        }, this);

        let count = 0;
        const decorGraphics  = this.oGameScene.make.graphics({x: 0, y: 0, add: false});
        decorGraphics.fillStyle(0x448341, 1);
        decorGraphics.fillRect(0, 0, this.nIconSize - 1, this.nIconSize);
        decorGraphics.generateTexture("decorGraphics", this.nIconSize, this.nIconSize);
        
        let decor: IinvetorySprite;
        let slot: IinvetorySprite;
        
        for (let y = this.nPadding + 5; y < this.nHeight; y += this.nIconSize + this.nPadding) {
            for (let x = this.nPadding; x < this.nWidth; x += this.nIconSize + this.nPadding) {
                if (count < this.nSlots) {
                    if (count < 5 && this.bHasSpecialSlots) {
                        const index = count + 3 == 6 ? 5 : count + 3 > 6 ? count + 2 : count + 3;
                    
                        decor = this.oGameScene.add.sprite(x - this.nWidth / 2, y, "inventory", index + ".png");
                        decor.alpha = 0.1;
                        decor.displayWidth = this.nIconSize;
                        decor.displayHeight = this.nIconSize - 3;
                    } else {            
                        decor = this.oGameScene.add.sprite(x - this.nWidth / 2 - 8, y - 8, "ic_hand");
                        decor.visible = false;
                    }
                
                    const i = count < 5 ? 15 : 16;
                    slot = this.oGameScene.add.sprite(x - this.nWidth / 2, y, "inventory", i + ".png");
                    slot.id = count + 1;
                    slot.displayWidth = this.nIconSize;
                    slot.displayHeight = this.nIconSize;
                    slot.special = count < 5;
                
                    if (!slot.special) {
                        const decorGraphicsSprite = this.oGameScene.add.sprite(x - this.nWidth / 2 + 1, y, "decorGraphics");
                        decorGraphicsSprite.visible = false;
                    
                        this.oBackgroundContainer.add(decorGraphicsSprite)
                        slot.decorGraphics = decorGraphicsSprite;
                    }
                
                    this.oBackgroundContainer.add(decor);
                    slot.decor = decor;
                    
                    slot.tint = 0x736861;
                
                    this.oBackgroundContainer.add(slot);
                    this.oBackground.slots.push(slot);
                
                    count += 1;
                }
            }
        }
    
        const text = this.oGameScene.add.text(-this.nWidth / 2 + 10, -4, this.sTitle, {font: '14px Courier New', fill: '#ffffff'});
        this.oBaseContainer.add(text);
    }

    update():void {
        while (this.aPending.length > 0) {
            this.processItem(this.aPending.shift());
        }
    }

    open(): void {
        this.oBaseContainer.visible = !this.oBaseContainer.visible;
    }

    addItem(item: Item): void {
        this.aPending.push(item);
    }

    processItem(item: Item): void {
        const stackSlot = this.findSlotWithSameItem(item);
        
        item.alpha = 1;

        if (item.nMaxStack && stackSlot) {
            this.oGameScene.oLayers.items.remove(item);
            delete this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y];

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
                this.oGameScene.oLayers.items.remove(item);
                delete this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y];

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
                
                item.on("pointerup", (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Event) => {
                    if (pointer.leftButtonDown) {
                        this.activateItem(item);
                    }  
                }, this);

                let heldItemSlot: IinvetorySprite;
                item.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                    item.setPosition(dragX, dragY);
                    heldItemSlot = item.oSlot;
                }, this);

                item.on("dragend", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number, dropped: boolean) => {
                    if (heldItemSlot) {
                        const closestSlot = this.findClosestSlotTo(item);

                        if (closestSlot) {
                            if (item == this.oActiveItem) {
                                this.disableActiveItem();
                            }

                            if (closestSlot.item != undefined) {
                                const closestItem = closestSlot.item;
    
                                closestItem.x = heldItemSlot.x;
                                closestItem.y = heldItemSlot.y;
                                closestItem.oSlot = heldItemSlot;
                                heldItemSlot.item = closestItem;

                                item.oSlot = closestSlot;
                                closestSlot.item = item;
                            } else {
                                item.oSlot = closestSlot;
                                closestSlot.item = item;
    
                                heldItemSlot.item = undefined;
                            }

                            item.x = closestSlot.x;
                            item.y = closestSlot.y;
                        } else {
                            item.oSlot.item = undefined;
                            
                            this.disableDecor(item.oSlot);
                            if (item == this.oActiveItem) {
                                this.disableActiveItem();
                            }

                            item.oSlot = undefined;

                            this.oBackgroundContainer.remove(item);
                            this.aItems.splice(this.aItems.indexOf(item), 1);
    
                            item.width = this.oGameScene.nTileSize;
                            item.height = this.oGameScene.nTileSize;
    
                            item.x = this.oActor.oSprite.x;
                            item.y = this.oActor.oSprite.y;
                            item.oLastPos.x = this.oActor.oPosition.x;
                            item.oLastPos.y = this.oActor.oPosition.y;

                            item.switchProperties(false);
                            item.removeAllListeners();                            
                            item.removeInteractive();
                            item.setScrollFactor(1, 1);

                            this.oGameScene.oLayers.items.add(item, true);
                            this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y] = item;
                        }
                    }

                    heldItemSlot = undefined;
                }, this);
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

    findClosestSlotTo(slot: IinvetorySprite) {
        let closestSlot: IinvetorySprite, dist: number;
        let lastDist = 50; 
        this.oBackground.slots.forEach(function(_slot) {
            if (!_slot.special) {
                dist = Phaser.Math.Distance.Between(slot.x, slot.y, _slot.x, _slot.y);
                
                if(dist < lastDist) {
                    lastDist = dist;
                    closestSlot = _slot;
                }
            }
        }, this);

        return closestSlot;
    }

    disableActiveItem(): void {
        this.oActiveItem.oRangeObject.visible = false;
        this.oActiveItem.oSlot.decor.visible = false;
        this.oActiveItem.oSlot.decorGraphics.visible = false;
        this.oActiveItem.oSlot.tint = 0x736861;  
        
        this.oActiveItem = undefined;
    }

    disableDecor(slot: IinvetorySprite): void {
        slot.decor.visible = false;
        slot.decorGraphics.visible = false;
        slot.tint = 0x736861;
    }

    activateItem(item: Item): void {
        if (!item.oSlot) { return };
        if (this.oActiveItem && this.oActiveItem.bReloading) { return };

        item.oSlot.decorGraphics.visible = !item.oSlot.decorGraphics.visible;
        item.oSlot.decor.visible = !item.oSlot.decor.visible;

        if (item.oSlot.decor.visible) {
            if (this.oActiveItem) {
                this.disableActiveItem();
            }

            item.oSlot.tint = 0x304876;
            this.oActiveItem = item;
            this.oActor.oWeapon = item;
            this.oActor.oWeapon.oRangeObject.visible = true;
        } else {
            if (this.oActiveItem) {
                this.disableActiveItem();
            }

            this.oActor.oWeapon.oRangeObject.visible = false;
            this.oActor.oWeapon = undefined;
        }
    }
}
