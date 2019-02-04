import { GameScene } from '../scenes/game-scene';
import Actor from './actor';
import {ButtonHandler, IDownButtons} from '../systems/buttonHandler';

export class Player extends Actor {
    public nSpriteOffset  : number;
    public nHp            : number;
    public nSp            : number;
    public nDamage        : number;
    public nMovingDelay   : number;
    public oButtonHandler : ButtonHandler;
    public oDownButtons   : IDownButtons;
    public bIsPlayer      : boolean;

    constructor(gameScene : GameScene, data : any[], pos : {x : number, y : number}) {
        super(gameScene, pos);

        this.nSpriteOffset = 110;
        this.nHp           = 100;
        this.nSp           = 110;
        this.nDamage       = 1;
        this.nMovingDelay  = 100;

        this.oButtonHandler = this.oGameScene.oButtonHandler;
        this.oDownButtons   = this.oButtonHandler.oDownButtons;

        this.bIsPlayer     = true;
    }

    pickUp(item) : void {
    }
}