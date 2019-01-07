import { GameScene } from '../scenes/game-scene';

export default class VisualTimer {
  private sType         : string;
  private nTotalTime    : number;
  private oGameScene    : GameScene;
  private oGame         : Phaser.Game;
  private nFullWidth    : number;
  private oTimer        : Phaser.Tweens.Tween;
  
  public fOnComplete   : Function;
  public oBackground   : Phaser.GameObjects.Sprite;
  public oSprite       : Phaser.GameObjects.Sprite;
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

  reset() {
		if (this.oTimer) {
			this.oTimer.stop();
    }
    
    // let self = this;
    
    this.bHasFinished = false;
    this.oSprite.width = this.nFullWidth;
    this.oSprite.visible = true;
    this.oBackground.visible = true;

    // this.timer = this.game.time.create(true);

		// this.timer.repeat(Phaser.Timer.SECOND, this.nTotalTime, this.timerTick, this);
		// this.timer.onComplete.add(function() {
    //   this.bHasFinished = true;
    //   this.oSprite.visible = false;
		// 	if (this.fOnComplete) {
		// 		this.fOnComplete();
		// 	}
    // }, this);

    this.oTimer = this.oGameScene.add.tween(this.oSprite);

    this.oTimer.to(
      { width: 0 },  
      this.nTotalTime * 1000, 
      Phaser.Easing.Linear.None,
      false,
      0
    );

    this.oTimer.onComplete.add(function() {
      this.bHasFinished = true;
      this.oSprite.visible = false;
      this.oBackground.visible = false;

      if (this.fOnComplete) {
        this.fOnComplete();
      }
    }, this);

		// this.rect = new Phaser.Rectangle(0, 0, 0, this.oSprite.height);
    
    // if (this.type == 'down') {
		// 	this.oSprite.crop(null);
		// } else {
		// 	this.oSprite.crop(this.rect);
    // }
  }
  
  setTime(seconds) {
		this.nTotalTime = seconds;
		this.reset();
  }
  
  start() {
    this.reset();
    this.oTimer.start();
  }
  
  stop() {
		this.oTimer.stop();
  }
  
  pause() {
		this.oTimer.pause();
  }
  
  resume() {
		this.oTimer.resume();
  }
  
  remainingTime() {
		return this.nTotalTime - this.oTimer.seconds;
  }
  
  timerTick() {
    let myTime = (this.sType == 'down') ? this.remainingTime() : this.oTimer.seconds;
    let newWidth = Math.max(0, (myTime / this.nTotalTime) * this.nFullWidth);


		// this.oSprite.crop(this.rect);
    
    // this.myTween = this.game.add.tween(this.oSprite).to(
    //   { width: newWidth },  
    //   Phaser.Timer.SECOND, 
    //   Phaser.Easing.Linear.None,
    //   false,
    //   0,
    //   this.totalTime
    // ); 

    // this.myTween.onRepeat.add(function() { 
    //   this.currentTime -= 1;
    //   newWidth = Math.max(0, (this.currentTime / this.totalTime) * this.nFullWidth);
    // }, this);

    // this.myTween.onComplete.add(function() {
    //   console.log('complete');
    // }, this)
    
    //this.myTween.start();
  }
}

