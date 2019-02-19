import { IPosition, IPath } from "../interfaces";
import { Game } from "../game";

interface IOptions {
    text: string,
    textStyle?: object,    
    width?: number | string,
    height?: number | string,
    x?: number,
    rotation?: number,
    y?: number,
    parentObject?: Phaser.GameObjects.Sprite,
    animation?: string,
    fixedToCamera?: boolean,
    // sprite?: Phaser.GameObjects.Sprite,
    // spriteAnimationName?: string,
    // spriteAnimationFrames?: Phaser.Animations.Types.AnimationFrame[],
    // spriteAnimationFrameRate?: number,
    // spriteAnimationRepeat?: boolean,
    hasBackground?: boolean,
    backgroundColor?: number,
    distance?: number,
    easing?: any,
    timeToLive?: number,
    customPath?: IPosition[],
    align?: string
}

interface ITextObject extends Phaser.GameObjects.Text {
    animation?: string,
    easing?: any,
    timeToLive?: number,
    distance?: number,
    customPath?: IPosition[]
}

export default class FloatingText {
    private oScene                      : Phaser.Scene;
    private oContainer                  : Phaser.GameObjects.Container;
    private oGroup                      : Phaser.GameObjects.Group;

    private sText                       : string;
    private oTextStyle                  : object;
    // private oSprite                     : Phaser.GameObjects.Sprite;
    // private sSpriteAnimationName        : string;
    // private aSpriteAnimationFrames      : Phaser.Animations.Types.AnimationFrame[];
    // private nspriteAnimationFrameRate   : number;
    // private bSpriteAnimationRepeat      : boolean;
    private x                           : number;
    private y                           : number;
    private nRotation                   : number;
    private oParentObject               : Phaser.GameObjects.Sprite;
    private nWidth                      : number | string;
    private nHeight                     : number | string;
    private bHasBackground              : boolean;
    private nBackgroundColor            : number;
    private sAnimation                  : string;
    private nDistance                   : number;
    private oEasing                     : any;
    private nTimeToLive                 : number;
    private bFixedToCamera              : boolean;
    private sAlign                      : string;
    private aCustomPath                 : IPosition[];

    constructor(scene: Phaser.Scene, opts: IOptions) {
        this.oScene     = scene;
        this.oContainer = this.oScene.add.container(0, 0);

        this.sText  = opts.text;
        this.oTextStyle  = opts.textStyle || {
            fontSize: 14,
            fill: "#ffffff",
            stroke: "#1e1e1e",
            strokeThickness: 1,
            wordWrap: true,
            wordWrapWidth: 200
        };
        
        // this.oSprite = opts.sprite;
        // this.sSpriteAnimationName = opts.spriteAnimationName;
        // this.aSpriteAnimationFrames = opts.spriteAnimationFrames || [];
        // this.nspriteAnimationFrameRate = opts.spriteAnimationFrameRate || 24;
        // this.bSpriteAnimationRepeat = opts.spriteAnimationRepeat || true;
        this.x = opts.x;
        this.y = opts.y;
        this.nRotation = opts.rotation;
        this.oParentObject = opts.parentObject;
        this.nWidth = opts.width || "auto";
        this.nHeight = opts.height || "auto";
        this.bHasBackground = opts.hasBackground || false;
        this.nBackgroundColor = opts.backgroundColor || 0x000000;
        this.sAnimation = opts.animation || "explode";
        this.nDistance = opts.distance || 40;
        this.oEasing = opts.easing || Phaser.Math.Easing.Quintic.Out;
        this.nTimeToLive = opts.timeToLive || 600;
        this.bFixedToCamera = opts.fixedToCamera || false;
        this.sAlign = opts.align || "center";
        this.aCustomPath = opts.customPath || [];

        this.create();
    }

    create(): void {
        let textObj: ITextObject;

        textObj = this.oScene.add.text(0, 0, this.sText, this.oTextStyle);

        if (this.nRotation) {
            textObj.angle = this.nRotation;
        }

        if (this.oParentObject) {
            if (!this.x) {
                textObj.x = this.oParentObject.x + this.oParentObject.width / 2 - textObj.width / 2;
            } else {
                textObj.x = this.x;
            }

            if (!this.y) {
                textObj.y = this.oParentObject.y - this.oParentObject.height / 2;
            } else {
                textObj.y = this.y;
            }
        } else {
            if (this.sAlign === "center") {
                textObj.x = this.x - textObj.width / 2;
                textObj.y = this.y - textObj.height / 2;
            } else if (this.sAlign === "left") {
                textObj.x = this.x;
                textObj.y = this.y;
            } else if (this.sAlign === "right") {
                textObj.x = this.x + textObj.width;
                textObj.y = this.y + textObj.height;
            } else if (this.sAlign === "none") {
                textObj.x = this.x;
                textObj.y = this.y;
            }
        }

        let modal: Phaser.GameObjects.Graphics;
        if (this.bHasBackground) {
            modal = this.oScene.add.graphics({x: textObj.width + 10, y: textObj.height});
            this.oContainer.width = textObj.width + 5;
            this.oContainer.height = textObj.width + 5;
            modal.fillRoundedRect(0, 0, textObj.width + 10, textObj.height, 6);
            this.oContainer.add(modal);
        } else {
            this.oContainer.width = textObj.width;
            this.oContainer.height = textObj.height;
        }

        if (this.bFixedToCamera) {
            this.oContainer.setScrollFactor(0, 0);
        }

        this.oContainer.x = textObj.x;
        this.oContainer.y = textObj.y;

        textObj.x = 0;
        textObj.y = 0;

        if (modal !== undefined) {
            modal.x = -5;
            modal.y = 0;
        }

        textObj.animation = this.sAnimation;
        textObj.easing = this.oEasing;
        textObj.timeToLive = this.nTimeToLive;
        textObj.distance = this.nDistance;
        textObj.customPath = this.aCustomPath;

        this.oContainer.add(textObj);
        this.oContainer.visible = false;
        
        this.animate(textObj);
    }

    animate(textObj: Phaser.GameObjects.Text): void {
        this.oContainer.visible = true;
        this.oContainer.setDepth(100);
        if (this.sAnimation === "explode") {
            this.oScene.tweens.add({
                targets: textObj,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 250,
                delay: 0,
                ease: this.oEasing,
                onComplete: function() {
                    this.oScene.tweens.add({
                        targets: textObj,
                        alpha: 0,
                        duration: 250,
                        delay: this.nTimeToLive,
                        onComplete: function() {
                            this.oContainer.remove(textObj);
                        },
                        onCompleteScope: this
                    });
                },
                onCompleteScope: this,
            })

        } else if (this.sAnimation === "up") {
            this.oScene.tweens.add({
                targets: this.oContainer,
                y: this.oContainer.y - this.nDistance,
                duration: 400,
                delay: 100,
                ease: this.oEasing,
                onComplete: function() {
                    this.oScene.tweens.add({
                        targets: textObj,
                        alpha: 0,
                        duration: 150,
                        delay: this.nTimeToLive,
                        onComplete: function() {
                            this.oContainer.remove(textObj);
                        },
                        onCompleteScope: this
                    });
                },
                onCompleteScope: this,
            })
        }
    }
}