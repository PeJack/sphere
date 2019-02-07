import { GameScene } from "../scenes/gameScene";
import { ButtonHandler, IDownButtons } from "./buttonHandler";
import { IPath } from "../interfaces";

interface IClickPosition {
    x: number, y: number
}

export class InputHandler {
    private oGameScene     : GameScene;
    private oClickPosition : IClickPosition;
    private oButtonHandler : ButtonHandler;
    private oDownButtons   : IDownButtons;
    private bActive        : boolean;
    private sAction        : string; 

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
            if (this.oDownButtons.UP) {
                this.startWalk(
                    [{y: this.oGameScene.oPlayer.getPosition().y - 1}],
                    "up"
                )

                this.oButtonHandler.timeOut();                
            }

            if (this.oDownButtons.DOWN) {
                this.startWalk(
                    [{y: this.oGameScene.oPlayer.getPosition().y + 1}],
                    "down"
                )

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
        }
    }

    handleInputTap(pointer: Phaser.Input.Pointer): void {
        // for(const item of this.oGameScene.oInventory.aItems) {
        //     if (item.input.pointOver()) {
        //         return;
        //     }

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