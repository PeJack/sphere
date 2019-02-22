import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import {ButtonHandler, IDownButtons} from '../systems/buttonHandler';
import { IActorsListItem, IPosition } from '../interfaces';
import Item from './item';
import Inventory from './inventory';

export class Player extends Actor {
    public nSpriteOffset    : number;
    public nHp              : number;
    public nSp              : number;
    public nMovingDelay     : number;
    public oButtonHandler   : ButtonHandler;
    public oDownButtons     : IDownButtons;
    public bIsPlayer        : boolean;
    public oInventory       : Inventory;

    constructor(gameScene : GameScene, data : IActorsListItem, pos : IPosition) {
        super(gameScene, pos);

        this.nEntityID      = 0;
        this.nSpriteOffset  = data.spriteOffset;
        this.nMaxHp         = 1000;
        this.nHp            = this.nMaxHp;
        this.nSp            = 110;
        this.nMovingDelay   = 100;

        this.oButtonHandler = this.oGameScene.oButtonHandler;
        this.oDownButtons   = this.oButtonHandler.oDownButtons;

        this.bIsPlayer      = true;

        this.setAnimations() ;
    }

    pickUp(item: Item) : void {
        this.oInventory.addItem(item);
    }
}