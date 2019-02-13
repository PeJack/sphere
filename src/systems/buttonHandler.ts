import { GameScene } from "../scenes/gameScene";

interface IButtons {
    UP:     Phaser.Input.Keyboard.Key,
    DOWN:   Phaser.Input.Keyboard.Key,
    LEFT:   Phaser.Input.Keyboard.Key,
    RIGHT:  Phaser.Input.Keyboard.Key,
    ESC:    Phaser.Input.Keyboard.Key,
    I:      Phaser.Input.Keyboard.Key,
    E:      Phaser.Input.Keyboard.Key,    
    W:      Phaser.Input.Keyboard.Key,
    A:      Phaser.Input.Keyboard.Key,
    S:      Phaser.Input.Keyboard.Key,
    D:      Phaser.Input.Keyboard.Key,
    ONE:    Phaser.Input.Keyboard.Key,
    TWO:    Phaser.Input.Keyboard.Key,
    THREE:  Phaser.Input.Keyboard.Key,
    FOUR:   Phaser.Input.Keyboard.Key,
    FIVE:   Phaser.Input.Keyboard.Key,
    SIX:    Phaser.Input.Keyboard.Key,
    SEVEN:  Phaser.Input.Keyboard.Key,
    EIGHT:  Phaser.Input.Keyboard.Key,
    NINE:   Phaser.Input.Keyboard.Key,
    ZERO:   Phaser.Input.Keyboard.Key
}

export interface IDownButtons {
    UP:     boolean,
    DOWN:   boolean,
    LEFT:   boolean,
    RIGHT:  boolean,
    ESC:    boolean,
    LMB:    boolean,
    I:      boolean,
    E:      boolean,    
    W:      boolean,
    A:      boolean,
    S:      boolean,
    D:      boolean,
    ONE:    boolean,
    TWO:    boolean,
    THREE:  boolean,
    FOUR:   boolean,
    FIVE:   boolean,
    SIX:    boolean,
    SEVEN:  boolean,
    EIGHT:  boolean,
    NINE:   boolean,
    ZERO:   boolean
}

export interface IUpButtons {
    ONE:    boolean,
    TWO:    boolean,
    THREE:  boolean,
    FOUR:   boolean,
    FIVE:   boolean,
    SIX:    boolean,
    SEVEN:  boolean,
    EIGHT:  boolean,
    NINE:   boolean,
    ZERO:   boolean,
    E:      boolean
}

export class ButtonHandler {
    public oDownButtons     : IDownButtons;
    public oUpButtons       : IUpButtons;       

    private oGameScene      : GameScene;
    private oButtons        : IButtons;
    private oPointer        : Phaser.Input.Pointer;    
    private nLastTimeOut    : number;

    constructor(gameScene: GameScene) {
        this.oGameScene         = gameScene;
        this.oButtons           = {} as IButtons;
        
        this.oButtons.UP        = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP); 
        this.oButtons.DOWN      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.oButtons.LEFT      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.oButtons.RIGHT     = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT); 
        this.oButtons.ESC       = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.oButtons.I         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.oButtons.W         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.oButtons.A         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.oButtons.S         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.oButtons.D         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.oButtons.E         = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.oButtons.ONE       = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);        
        this.oButtons.TWO       = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.oButtons.THREE     = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.oButtons.FOUR      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.oButtons.FIVE      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.oButtons.SIX       = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
        this.oButtons.SEVEN     = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);
        this.oButtons.EIGHT     = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);
        this.oButtons.NINE      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);
        this.oButtons.ZERO      = this.oGameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);

        this.oPointer           = this.oGameScene.input.activePointer;  
        this.oGameScene.input.mouse.capture = true;

        this.nLastTimeOut = 0;
        this.oDownButtons = {
            UP:     false,
            DOWN:   false,
            LEFT:   false,
            RIGHT:  false,
            ESC:    false,
            I:      false,
            W:      false,
            A:      false,
            S:      false,
            D:      false,
            LMB:    false,
            E:      false,
            ONE:    false,
            TWO:    false,
            THREE:  false,
            FOUR:   false,
            FIVE:   false,
            SIX:    false,
            SEVEN:  false,
            EIGHT:  false,
            NINE:   false,
            ZERO:   false
        };

        this.oUpButtons = {
            ONE:    false,
            TWO:    false,
            THREE:  false,
            FOUR:   false,
            FIVE:   false,
            SIX:    false,
            SEVEN:  false,
            EIGHT:  false,
            NINE:   false,
            ZERO:   false,
            E:      false
        };

        this.oButtons.ONE.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.ONE = true;
        }, this);

        this.oButtons.TWO.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.TWO = true;
        }, this);
        
        this.oButtons.THREE.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.THREE = true;
        }, this);

        this.oButtons.FOUR.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.FOUR = true;
        }, this);
        
        this.oButtons.FIVE.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.FIVE = true;
        }, this);
        
        this.oButtons.SIX.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.SIX = true;
        }, this);  

        this.oButtons.SEVEN.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.SEVEN = true;
        }, this);

        this.oButtons.EIGHT.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.EIGHT = true;
        }, this);
        
        this.oButtons.NINE.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.NINE = true;
        }, this);
        
        this.oButtons.ZERO.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.ZERO = true;
        }, this);  
        
        this.oButtons.E.on("up", (e: KeyboardEvent)=> {
            this.oUpButtons.E = true;
        }, this);
    }

    update(): boolean {
        if (this.oGameScene.time.now < this.nLastTimeOut) {
            return false;
        } else {
            // this.reset();
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

        for (let button in this.oUpButtons) {
            this.oUpButtons[button] = false;
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