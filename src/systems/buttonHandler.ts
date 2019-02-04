import { GameScene } from "../scenes/game-scene";

interface IButtons {
    UP:    Phaser.Input.Keyboard.Key,
    DOWN:  Phaser.Input.Keyboard.Key,
    LEFT:  Phaser.Input.Keyboard.Key,
    RIGHT: Phaser.Input.Keyboard.Key,
    ESC:   Phaser.Input.Keyboard.Key,
    I:     Phaser.Input.Keyboard.Key,
    E:     Phaser.Input.Keyboard.Key,    
    W:     Phaser.Input.Keyboard.Key,
    A:     Phaser.Input.Keyboard.Key,
    S:     Phaser.Input.Keyboard.Key,
    D:     Phaser.Input.Keyboard.Key
}

export interface IDownButtons {
    UP:    boolean,
    DOWN:  boolean,
    LEFT:  boolean,
    RIGHT: boolean,
    ESC:   boolean,
    LMB:   boolean,
    I:     boolean,
    E:     boolean,    
    W:     boolean,
    A:     boolean,
    S:     boolean,
    D:     boolean
}

export class ButtonHandler {
    public oDownButtons  : IDownButtons;
    
    private oGameScene   : GameScene;
    private oButtons     : IButtons;
    private oPointer     : Phaser.Input.Pointer;    
    private nLastTimeOut : number;

    constructor(gameScene: GameScene) {
        this.oGameScene = gameScene;

        this.oButtons.UP    = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.UP); 
        this.oButtons.DOWN  = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.oButtons.LEFT  = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.oButtons.RIGHT = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.RIGHT); 
        this.oButtons.ESC   = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.oButtons.I     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.I);
        this.oButtons.W     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.W);
        this.oButtons.A     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.A);
        this.oButtons.S     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.S);
        this.oButtons.D     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.D);
        this.oButtons.E     = new Phaser.Input.Keyboard.Key(Phaser.Input.Keyboard.KeyCodes.E);

        this.oPointer       = this.oGameScene.input.activePointer;  
        this.oGameScene.input.mouse.capture = true;

        this.nLastTimeOut = 0;
        this.oDownButtons = {
            UP: false,
            DOWN: false,
            LEFT: false,
            RIGHT: false,
            ESC: false,
            I: false,
            W: false,
            A: false,
            S: false,
            D: false,
            LMB: false,
            E: false
        };
    }

    update(): boolean {
        if (this.oGameScene.time.now < this.nLastTimeOut) {
            return false;
        } else {
            this.reset();
            this.handleButtons();
            return true;
        }
    }

    timeOut(): void {
        this.nLastTimeOut = this.oGameScene.time.now;
        this.reset();
    }

    reset(): void {
        for (let button in this.oDownButtons) {
            this.oDownButtons[button] = false;
        }
    }

    handleButtons(): void {
        this.oDownButtons.UP    = this.oButtons.UP.isDown;
        this.oDownButtons.DOWN  = this.oButtons.DOWN.isDown;
        this.oDownButtons.LEFT  = this.oButtons.LEFT.isDown;
        this.oDownButtons.RIGHT = this.oButtons.RIGHT.isDown; 
        this.oDownButtons.ESC   = this.oButtons.ESC.isDown;
        this.oDownButtons.I     = this.oButtons.I.isDown;
        this.oDownButtons.E     = this.oButtons.E.isDown;
        this.oDownButtons.W     = this.oButtons.W.isDown;
        this.oDownButtons.A     = this.oButtons.A.isDown;
        this.oDownButtons.S     = this.oButtons.S.isDown;
        this.oDownButtons.D     = this.oButtons.D.isDown;
        this.oDownButtons.LMB   = this.oPointer.leftButtonDown();                                                                                        
    }
} 