import { GameScene } from '../scenes/gameScene';

export default class VisualTimer {
    private sType         : string;
    private nTotalTime    : number;
    private oGameScene    : GameScene;
    private oGame         : Phaser.Game;
    private nFullWidth    : number;
    private oTimer        : Phaser.Tweens.Tween;

    public fOnComplete    : Function;
    public oBackground    : Phaser.GameObjects.Sprite;
    public oSprite        : Phaser.GameObjects.Sprite;
    public bHasFinished   : boolean;


    constructor(opts) {
        this.sType = 'down';    
        if (opts.type) {
            this.sType = opts.type;
        } 

        this.nTotalTime   = opts.seconds;
        this.oGameScene   = opts.gameScene;
        this.fOnComplete  = opts.onComplete; 

        let key = 'timer';
        if (opts.key) {
            key = opts.key;
        }   

        this.oBackground = this.oGameScene.add.sprite(0, 0, key + "_bg", 0);
        this.oBackground.setOrigin(0, 3.5);
        this.oBackground.visible = false;   
        this.oSprite = this.oGameScene.add.sprite(0, 0, key, 0);
        this.oSprite.setOrigin(0, 3.5);
        this.oSprite.visible = false;   
        this.oGameScene.oLayers.hud.add(this.oBackground);  
        this.oGameScene.oLayers.hud.add(this.oSprite);      
        this.nFullWidth = this.oSprite.width;   
        this.bHasFinished = true;
    }

    reset(): void {
	    if (this.oTimer) {
	    	this.oTimer.stop();
        }

        this.bHasFinished = false;
        this.oSprite.displayWidth = this.nFullWidth;
        this.oSprite.visible = true;
        this.oBackground.visible = true;

        this.oTimer = this.oGameScene.tweens.add({
            targets: this.oSprite,
            displayWidth: 0,
            ease: 'Linear',
            duration: this.nTotalTime * 1000,
            onComplete: function() {
                this.bHasFinished = true;
                this.oSprite.visible = false;
                this.oBackground.visible = false;

                if (typeof this.fOnComplete === "function") {
                    this.fOnComplete();
                };
            },
            onCompleteScope: this,
        });
    }
  
    setTime(seconds: number): void {
		this.nTotalTime = seconds;
		this.reset();
    }
  
    start(): void {
        this.reset();
        // this.oTimer.play(false);
    }
  
    stop(): void {
    	this.oTimer.stop();
    }

    pause(): void {
    	this.oTimer.pause();
    }

    resume(): void {
    	this.oTimer.resume();
    }

    remainingTime() {
    	return this.nTotalTime - this.oTimer.elapsed;
    }
}

