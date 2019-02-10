import { GameScene } from '../scenes/gameScene';
import Actor from './actor';
import {ButtonHandler, IDownButtons} from '../systems/buttonHandler';
import { IActorsListItem, IPosition } from '../interfaces';
import Item from './item';
// import Inventory from './inventory';

export class Player extends Actor {
    public nSpriteOffset    : number;
    public nHp              : number;
    public nSp              : number;
    public nDamage          : number;
    public nMovingDelay     : number;
    public oButtonHandler   : ButtonHandler;
    public oDownButtons     : IDownButtons;
    public bIsPlayer        : boolean;
    // public oInventory       : Inventory;

    constructor(gameScene : GameScene, data : IActorsListItem, pos : IPosition) {
        super(gameScene, pos);

        this.nSpriteOffset = 140;
        this.nHp           = 100;
        this.nSp           = 110;
        this.nDamage       = 1;
        this.nMovingDelay  = 200;

        this.oButtonHandler = this.oGameScene.oButtonHandler;
        this.oDownButtons   = this.oButtonHandler.oDownButtons;

        this.bIsPlayer     = true;

        this.setAnimations() ;
    }

    pickUp(item: Item) : void {
    }
}