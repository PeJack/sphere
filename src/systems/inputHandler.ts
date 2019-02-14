import { GameScene } from "../scenes/gameScene";
import { ButtonHandler, IDownButtons, IUpButtons } from "./buttonHandler";
import { IPath } from "../interfaces";
import Item from "../components/item";

interface IClickPosition {
    x: number, y: number
}

export class InputHandler {
    private oGameScene      : GameScene;
    private oClickPosition  : IClickPosition;
    private oButtonHandler  : ButtonHandler;
    private oDownButtons    : IDownButtons;
    private oUpButtons      : IUpButtons;
    private bActive         : boolean;
    private sAction         : string; 

    constructor(gameScene: GameScene) {
        this.oGameScene     = gameScene;
        this.oClickPosition = { x: 0, y: 0 };

        this.create();
    }

    create(): void {
        this.oGameScene.input.setPollRate(150);
        this.oGameScene.input.on("pointerdown", this.handleInputTap, this);
        this.oGameScene.input.enabled = true;
        this.oButtonHandler = this.oGameScene.oButtonHandler;
        this.oDownButtons   = this.oButtonHandler.oDownButtons;
        this.oUpButtons     = this.oButtonHandler.oUpButtons;
        this.bActive        = false;
    }

    start(): void {
        this.sAction = "none";
        this.bActive = true;
    }

    stop(): void {
        this.sAction = "none";
        this.bActive = false;
    }

    handleInputButton(): void {
        if (this.oButtonHandler.update() && this.sAction != "waiting" && this.bActive) {
            const path: IPath = {};
            let direction: string;

            if (this.oUpButtons.ONE && this.oGameScene.oPlayer.oPocket.oBackground.slots[5].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[5].item);
            }

            if (this.oUpButtons.TWO && this.oGameScene.oPlayer.oPocket.oBackground.slots[6].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[6].item);
            }

            if (this.oUpButtons.THREE && this.oGameScene.oPlayer.oPocket.oBackground.slots[7].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[7].item);
            }
            
            if (this.oUpButtons.FOUR && this.oGameScene.oPlayer.oPocket.oBackground.slots[8].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[8].item);
            } 
            
            if (this.oUpButtons.FIVE && this.oGameScene.oPlayer.oPocket.oBackground.slots[9].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[9].item);
            }
            
            if (this.oUpButtons.SIX && this.oGameScene.oPlayer.oPocket.oBackground.slots[10].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[10].item);
            }
            
            if (this.oUpButtons.SEVEN && this.oGameScene.oPlayer.oPocket.oBackground.slots[11].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[11].item);
            }
            
            if (this.oUpButtons.EIGHT && this.oGameScene.oPlayer.oPocket.oBackground.slots[12].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[12].item);
            }
            
            if (this.oUpButtons.NINE && this.oGameScene.oPlayer.oPocket.oBackground.slots[13].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[13].item);
            }
            
            if (this.oUpButtons.ZERO && this.oGameScene.oPlayer.oPocket.oBackground.slots[14].item) {
                this.oGameScene.oPlayer.oPocket.activateItem(this.oGameScene.oPlayer.oPocket.oBackground.slots[14].item);
            }
            
            if (this.oUpButtons.E || this.oDownButtons.E) {
                this.oGameScene.oLayers.items.getChildren().forEach((item: Item) => {
                    if (this.oGameScene.checkOverlap(this.oGameScene.oPlayer.oSprite, item)) {
                        this.oGameScene.oPlayer.pickUp(item);
                    }
                });
            }

            if (this.oUpButtons.I) {
                this.oGameScene.oPocket.open();
                this.oGameScene.oBag.open();
            }

            if (this.oDownButtons.UP) {
                path.y = this.oGameScene.oPlayer.getPosition().y - 1;
                direction = "up";

                if (this.oDownButtons.RIGHT) {
                    path.x = this.oGameScene.oPlayer.getPosition().x + 1;
                } else if (this.oDownButtons.LEFT) {
                    path.x = this.oGameScene.oPlayer.getPosition().x - 1;
                }
                
                this.startWalk([path], direction);
                this.oButtonHandler.timeOut();           
            }

            if (this.oDownButtons.DOWN) {
                path.y = this.oGameScene.oPlayer.getPosition().y + 1;
                direction = "down";

                if (this.oDownButtons.RIGHT) {
                    path.x = this.oGameScene.oPlayer.getPosition().x + 1;
                    direction = "right";
                } else if (this.oDownButtons.LEFT) {
                    path.x = this.oGameScene.oPlayer.getPosition().x - 1;
                    direction = "left";
                }

                this.startWalk([path], direction);
                this.oButtonHandler.timeOut();                
            }

            if (this.oDownButtons.LEFT) {
                this.startWalk(
                    [{x: this.oGameScene.oPlayer.getPosition().x - 1}],
                    "left"
                )

                this.oButtonHandler.timeOut();                 
            }
            
            if (this.oDownButtons.RIGHT) {
                this.startWalk(
                    [{x: this.oGameScene.oPlayer.getPosition().x + 1}],
                    "right"
                )
                this.oButtonHandler.timeOut();           
            }

            this.oButtonHandler.timeOut();            
        }
    }

    handleInputTap(pointer: Phaser.Input.Pointer): void {
        // for(const item of this.oGameScene.oPocket.aItems) {
        //     this.attack();
        // }
    }

    startWalk(path : IPath[], direction : string): void {
        this.sAction = "waiting";
        this.oGameScene.oPlayer.aPath = path;

        const oCurrentPath : IPath = this.oGameScene.oPlayer.aPath.pop();

        if (oCurrentPath) {
            this.oGameScene.oPlayer.walkToTile(oCurrentPath, direction, function() {
                this.sAction = "none";
            }, this);
        }
    }

    attack(): void {
        if (!this.oGameScene.oPlayer.oWeapon) { return };
        this.oGameScene.oPlayer.oWeapon.attack(this.oGameScene.input.activePointer);
    }

    update(): void {
        this.handleInputButton();
    }
}