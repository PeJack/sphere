import Inventory from "./inventory";
import { GameScene } from "../scenes/gameScene";
import Actor from "./actor";

export class Pocket extends Inventory {
    public nPadding                : number;
    public nIconSize               : number;
    public nCols                   : number;
    public nWidth                  : number;
    public nHeight                 : number;
    public nInitX                  : number;
    public nInitY                  : number;
    public bHasSpecialSlots        : boolean;

    constructor(gameScene: GameScene, actor: Actor) {
        super(gameScene, actor);

        this.nSlots             = 15;

        this.nPadding           = 2;
        this.nIconSize          = 35;
        this.nCols              = 5;
        this.bHasSpecialSlots   = true;
        this.sTitle             = "Инвентарь";

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

          this.nInitX             = window.innerWidth - (this.nWidth + 90) / 2;
          this.nInitY             = 30;          

        this.create();  
    }
}