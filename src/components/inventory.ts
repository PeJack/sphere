import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import Item from './item';

interface IInventorySprite extends Phaser.GameObjects.Sprite {
    id?                             : number,
    decor?                          : Phaser.GameObjects.Sprite,
    decorGraphics?                  : Phaser.GameObjects.Sprite,
    special?                        : boolean,
    item?                           : Item,
    slots?                          : IInventorySprite[],
    items?                          : Item[],
    parent?                         : IInventory,
    pointerOver?                    : boolean,
    sType?                          : string
}

interface IInventory {
    oBaseContainer                  : Phaser.GameObjects.Container, 
    oHeader                         : IInventorySprite,
    oBackground                     : IInventorySprite,
    oBackgroundContainer            : Phaser.GameObjects.Container,
    oFakeBg                         : IInventorySprite,
    nPadding                        : number,
    nIconSize                       : number,
    nSlots                          : number,
    nSpecialSlots                   : number,
    nCols                           : number,
    nWidth                          : number,
    nHeight                         : number,
    nInitX                          : number,
    nInitY                          : number,
    bHasSpecialSlots                : boolean,
    sTitle                          : string,
    bEnabled                        : boolean
    nRemainingSlots                 : number
}

export default class Inventory {
    public aItems                   : Item[]; 

    private oGameScene              : GameScene;
    private oActor                  : Actor;
    private oGroup                  : Phaser.GameObjects.Group;
    private oActiveItem             : Item;
    private aPending                : Item[];
    
    public oPocket                  : IInventory;
    public oBag                     : IInventory;

    constructor(gameScene: GameScene, actor: Actor) {
        this.oGameScene = gameScene;
        this.oActor     = actor;
        this.oGroup     = this.oGameScene.oLayers.hud;
        
        this.aPending   = [];
        this.aItems     = [];

        this.oActiveItem = null;

        // Инициализация "кармана" (основной сумки)
        this.oPocket = {} as IInventory;

        this.oPocket.nPadding        = 2;
        this.oPocket.nIconSize       = 35;
        this.oPocket.nSlots          = 15;
        this.oPocket.nSpecialSlots   = 5;
        this.oPocket.nRemainingSlots = 15;
        this.oPocket.nCols           = 5;
        
        this.oPocket.nWidth = 
            (this.oPocket.nIconSize * this.oPocket.nCols) + 
            (this.oPocket.nPadding * this.oPocket.nCols) + 
            this.oPocket.nPadding;
        
        this.oPocket.nHeight = 
            (this.oPocket.nIconSize * 
            Math.ceil(this.oPocket.nSlots / this.oPocket.nCols)) +
            this.oPocket.nPadding *
            Math.ceil(this.oPocket.nSlots / this.oPocket.nCols) +
            this.oPocket.nPadding;
        
        this.oPocket.nInitX = window.innerWidth - (this.oPocket.nWidth + 90) / 2;
        this.oPocket.nInitY = 30;
        this.oPocket.bHasSpecialSlots = true;
        this.oPocket.sTitle = "Инвентарь";;
        this.oPocket.bEnabled = true;

        this.create(this.oPocket);

        // Инициализация торбы (доп. сумки)
        this.oBag = {} as IInventory;

        this.oBag.nPadding        = 2;
        this.oBag.nIconSize       = 35;
        this.oBag.nSlots          = 12;
        this.oBag.nSpecialSlots   = 0;
        this.oBag.nRemainingSlots = 12;        
        this.oBag.nCols           = 4;
        
        this.oBag.nWidth = 
            (this.oBag.nIconSize * this.oBag.nCols) + 
            (this.oBag.nPadding * this.oBag.nCols) + 
            this.oBag.nPadding;
        
        this.oBag.nHeight = 
            (this.oBag.nIconSize * 
            Math.ceil(this.oBag.nSlots / this.oBag.nCols)) +
            this.oBag.nPadding *
            Math.ceil(this.oBag.nSlots / this.oBag.nCols) +
            this.oBag.nPadding;
        
        this.oBag.nInitX = window.innerWidth - (this.oPocket.nWidth + 90) / 2;
        this.oBag.nInitY = 180; 
        this.oBag.bHasSpecialSlots = false;
        this.oBag.sTitle = "Торба";       
        this.oPocket.bEnabled = false;      
        
        this.create(this.oBag);

        this.oGameScene.input.on("dragenter", (pointer: Phaser.Input.Pointer, gameObject, target)=> {
            if (target.sType == "slot") {
                this.oPocket.oBackground.slots.forEach((slot)=>{
                    slot.pointerOver = false;
                });
                this.oBag.oBackground.slots.forEach((slot)=>{
                    slot.pointerOver = false;
                });

                target.pointerOver = true;
            }
        });

        this.oGameScene.input.on("dragleave", (pointer: Phaser.Input.Pointer, gameObject, target)=> {
            if (target.sType == "slot") {
                this.oPocket.oBackground.slots.forEach((slot)=>{
                    slot.pointerOver = false;
                });
                this.oBag.oBackground.slots.forEach((slot)=>{
                    slot.pointerOver = false;
                });

                target.pointerOver = false;
            }
        });
    }

    create(inv: IInventory):void {
        inv.oBaseContainer = this.oGameScene.add.container(inv.nInitX, inv.nInitY);
        inv.oBaseContainer.setScrollFactor(0, 0);

        inv.oHeader = this.oGroup.create(0, 0, "inventory", "1.png");
        inv.oHeader.displayWidth = inv.nWidth + 20;
        // FixedToCamera
        inv.oHeader.setScrollFactor(0, 0);

        inv.oBackgroundContainer = this.oGameScene.add.container(inv.oHeader.x + 18, inv.oHeader.y + 30);
        inv.oBackground = this.oGroup.create(0, 0);
        inv.oBackground.displayWidth = inv.nWidth + 20;        

        inv.oBackgroundContainer.setScrollFactor(0, 0);    
        inv.oBackground.setScrollFactor(0, 0);
        inv.oBackground.slots = [];
        inv.oBackground.items = [];
        inv.oBackground.setVisible(false);
        inv.oBackgroundContainer.add(inv.oBackground);

        inv.oFakeBg = this.oGroup.create(inv.oHeader.x + 2, inv.oHeader.y + 75, "inventory", 0);
        inv.oFakeBg.displayWidth = inv.nWidth + 35;         
        inv.oFakeBg.displayHeight = inv.nHeight + 10;
        inv.oFakeBg.setScrollFactor(0, 0);

        inv.oBaseContainer.add(inv.oHeader);
        inv.oBaseContainer.add(inv.oBackgroundContainer);
        inv.oBaseContainer.add(inv.oFakeBg);
        inv.oBaseContainer.bringToTop(inv.oBackgroundContainer);

        inv.oBaseContainer.setInteractive(new Phaser.Geom.Rectangle(inv.oHeader.x - inv.nWidth / 2, -9, inv.nWidth, 18), Phaser.Geom.Rectangle.Contains);
        this.oGameScene.input.setDraggable(inv.oBaseContainer);

        inv.oBaseContainer.on("drag", (pointer: any, dragX: number, dragY: number) => {
            inv.oBaseContainer.setPosition(dragX, dragY);
        }, this);

        let count = 0;
        const decorGraphics  = this.oGameScene.make.graphics({x: 0, y: 0, add: false});
        decorGraphics.fillStyle(0x448341, 1);
        decorGraphics.fillRect(0, 0, inv.nIconSize - 1, inv.nIconSize);
        decorGraphics.generateTexture("decorGraphics", inv.nIconSize, inv.nIconSize);
        
        let decor: IInventorySprite;
        let slot: IInventorySprite;
        
        for (let y = inv.nPadding + 5; y < inv.nHeight; y += inv.nIconSize + inv.nPadding) {
            for (let x = inv.nPadding; x < inv.nWidth; x += inv.nIconSize + inv.nPadding) {
                if (count < inv.nSlots) {
                    if (inv.bHasSpecialSlots) {
                        if (count < 5) {
                            const index = count + 3 == 6 ? 5 : count + 3 > 6 ? count + 2 : count + 3;
                        
                            decor = this.oGameScene.add.sprite(x - inv.nWidth / 2, y, "inventory", index + ".png");
                            decor.alpha = 0.1;
                            decor.displayWidth = inv.nIconSize;
                            decor.displayHeight = inv.nIconSize - 3;
                        } else {            
                            decor = this.oGameScene.add.sprite(x - inv.nWidth / 2 - 8, y - 8, "ic_hand");
                            decor.visible = false;
                        }

                        const i = count < 5 ? 15 : 16;
                        slot = this.oGameScene.add.sprite(x - inv.nWidth / 2, y, "inventory", i + ".png");
                        slot.special = count < 5;
                    } else {
                        decor = this.oGameScene.add.sprite(x - inv.nWidth / 2 - 8, y - 8, "ic_hand");
                        decor.visible = false;
                        
                        const i = 16;
                        slot = this.oGameScene.add.sprite(x - inv.nWidth / 2, y, "inventory", i + ".png"); 
                        slot.special = false;                       
                    }

                    slot.id = count + 1;
                    slot.sType = "slot";
                    slot.displayWidth = inv.nIconSize;
                    slot.displayHeight = inv.nIconSize;
                    slot.parent = inv;
                    
                    if (!slot.special) {
                        const decorGraphicsSprite = this.oGameScene.add.sprite(x - inv.nWidth / 2 + 1, y, "decorGraphics");
                        decorGraphicsSprite.visible = false;
                    
                        inv.oBackgroundContainer.add(decorGraphicsSprite)
                        slot.decorGraphics = decorGraphicsSprite;
                    }
                
                    inv.oBackgroundContainer.add(decor);
                    slot.decor = decor;
                    
                    slot.tint = 0x736861;

                    slot.setScrollFactor(0, 0);

                    inv.oBackgroundContainer.add(slot);

                    slot.setInteractive({ dropZone: true });
                    slot.pointerOver = false;

                    inv.oBackground.slots.push(slot);                    
                
                    count += 1;
                }
            }
        }
    
        const text = this.oGameScene.add.text(-inv.nWidth / 2 + 10, -4, inv.sTitle, {font: '14px Courier New', fill: '#ffffff'});
        inv.oBaseContainer.add(text);

        this.setEnabled(inv, inv.bEnabled);
    }

    // update():void {
    //     while (this.aPending.length > 0) {
    //         this.processItem(this.aPending.shift());
    //     }
    // }

    open(): void {
        this.oPocket.oBaseContainer.visible = !this.oPocket.oBaseContainer.visible;

        if (this.oBag.bEnabled) {
            this.oBag.oBaseContainer.visible = !this.oBag.oBaseContainer.visible;
        }
    }

    addItem(item: Item): void {
        if ((this.oPocket.nRemainingSlots - this.oPocket.nSpecialSlots) > 0) {
            this.processItem(this.oPocket, item);
        } else if ((this.oBag.nRemainingSlots - this.oBag.nSpecialSlots) > 0) {
            if (this.oBag.bEnabled) {
                this.processItem(this.oBag, item);
            }
        }
    }

    setEnabled(inv: IInventory, value: boolean) {
        inv.bEnabled = value;
        inv.oBaseContainer.setVisible(value);
    }

    processItem(inv: IInventory, item: Item): void {
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
                return this.processItem(inv, item);
            }

            item.destroy();
            this.oGroup.remove(item);
        } else {
            const emptySlot = this.findFirstEmptySlot();

            if (emptySlot) {
                this.oGameScene.oLayers.items.remove(item);
                delete this.oGameScene.oItemsMap[item.oLastPos.x + "." + item.oLastPos.y];

                item.x = emptySlot.x;
                item.y = emptySlot.y;
                item.width = inv.nIconSize;
                item.height = inv.nIconSize;

                emptySlot.item = item;
                emptySlot.parent.nRemainingSlots--;

                item.oSlot = emptySlot;
                item.oActor = this.oActor;

                this.aItems.push(item);
                inv.oBackgroundContainer.add(item);

                if (item.oLevelText) {
                    item.oLevelText.x = (emptySlot.x - emptySlot.width / 2) + 3;
                    item.oLevelText.y = emptySlot.y + 7;
                    inv.oBackgroundContainer.add(item.oLevelText);
                }

                if (item.oStackText) {
                    item.oStackText.x = (emptySlot.x + emptySlot.width / 2) - item.oStackText.width - 3;
                    item.oStackText.y = emptySlot.y - 16;                    
                    inv.oBackgroundContainer.add(item.oStackText);
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

                let heldItemSlot: IInventorySprite;
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
                                const closestItem   = closestSlot.item;
    
                                closestItem.x       = heldItemSlot.x;
                                closestItem.y       = heldItemSlot.y;
                                closestItem.oSlot   = heldItemSlot;

                                heldItemSlot.item   = closestItem;
                                item.oSlot          = closestSlot;
                                closestSlot.item    = item;

                                closestSlot.parent.oBackgroundContainer.remove(closestItem);
                                heldItemSlot.parent.oBackgroundContainer.add(closestItem);

                                heldItemSlot.parent.oBackgroundContainer.remove(item);
                                closestSlot.parent.oBackgroundContainer.add(item);
                            } else {
                                item.oSlot          = closestSlot;
                                closestSlot.item    = item;
    
                                heldItemSlot.item   = undefined;

                                heldItemSlot.parent.oBackgroundContainer.remove(item);
                                heldItemSlot.parent.nRemainingSlots++;

                                closestSlot.parent.oBackgroundContainer.add(item);
                                closestSlot.parent.nRemainingSlots--;
                            }

                            item.x = closestSlot.x;
                            item.y = closestSlot.y;
                        } else {
                            item.oSlot.item = undefined;
                            
                            this.disableDecor(item.oSlot);
                            if (item == this.oActiveItem) {
                                this.disableActiveItem();
                            }

                            item.oSlot.parent.oBackgroundContainer.remove(item);
                            item.oSlot.parent.nRemainingSlots++;
                            item.oSlot = undefined;
                        
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

    findSlotWithSameItem(item: Item): IInventorySprite {
        for(let i = 0; i < this.oPocket.oBackground.slots.length; i++) {
            const slot = this.oPocket.oBackground.slots[i];

            if(slot.item) {
                if(slot.item.nId == item.nId && slot.item.nStack < slot.item.nMaxStack) {
                    return slot;
                }
            }
        }

        if (this.oBag.bEnabled) {
            for(let i = 0; i < this.oBag.oBackground.slots.length; i++) {
                const slot = this.oBag.oBackground.slots[i];
    
                if(slot.item) {
                    if(slot.item.nId == item.nId && slot.item.nStack < slot.item.nMaxStack) {
                        return slot;
                    }
                }
            }            
        }
    }

    findFirstEmptySlot(): IInventorySprite {
        for(let i = 0; i < this.oPocket.oBackground.slots.length; i++) {
            let slot = this.oPocket.oBackground.slots[i];
            if(slot.item == undefined && !slot.special) {
                return slot;
            }
        }

        if (this.oBag.bEnabled) {
            for(let i = 0; i < this.oBag.oBackground.slots.length; i++) {
                let slot = this.oBag.oBackground.slots[i];
                if(slot.item == undefined) {
                    return slot;
                }
            }
        }
    }

    findClosestSlotTo(item: Item) {
        let closestSlot: IInventorySprite, dist: number;
        let lastDist = 50; 

        for(let i = 0; i < this.oPocket.oBackground.slots.length; i++) {
            let _slot = this.oPocket.oBackground.slots[i];
            if (!_slot.special && _slot.pointerOver) {
                return _slot;
            }
        }

        // if (closestSlot) {
        //     return closestSlot;
        // } else if (this.oBag.bEnabled) {
        //     console.log(this.oBag.oBackground.slots);
        //     this.oBag.oBackground.slots.forEach(function(_slot) {
        //         if (!_slot.special) {
        //             dist = Phaser.Math.Distance.Between(slot.x, slot.y, _slot.x, _slot.y);
                    
        //             if(dist < lastDist) {
        //                 lastDist = dist;
        //                 closestSlot = _slot;
        //             }
        //         }
        //     }, this);
        // }

        if (this.oBag.bEnabled) {
            for(let i = 0; i < this.oBag.oBackground.slots.length; i++) {
                let _slot = this.oBag.oBackground.slots[i];
                if (_slot.pointerOver) {
                    return _slot;
                }
            }
        }

        // return closestSlot;
    }

    disableActiveItem(): void {
        this.oActiveItem.oRangeObject.visible = false;
        this.oActiveItem.oSlot.decor.visible = false;
        this.oActiveItem.oSlot.decorGraphics.visible = false;
        this.oActiveItem.oSlot.tint = 0x736861;  
        
        this.oActiveItem = undefined;
    }

    disableDecor(slot: IInventorySprite): void {
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
